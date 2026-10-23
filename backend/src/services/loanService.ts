import { pool } from '../config/db';
import { LoanEntry, SummaryResponse } from '../types/loan';

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS loans (
      id SERIAL PRIMARY KEY,
      friend_name VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
      due_date DATE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      repaid_at TIMESTAMPTZ,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      receipt_url TEXT
    );
  `);
}

export async function addLoanEntry(data: {
  friendName: string;
  phoneNumber: string;
  amount: number;
  dueDate: string;
  receiptUrl?: string | null;
}): Promise<LoanEntry> {
  const result = await pool.query(
    `
      INSERT INTO loans (friend_name, phone_number, amount, due_date, receipt_url, status)
      VALUES ($1, $2, $3, $4, $5, 'active')
      RETURNING *
    `,
    [data.friendName, data.phoneNumber, Number(data.amount), data.dueDate, data.receiptUrl || null],
  );

  return mapLoanRow(result.rows[0]);
}

export async function markLoanRepaid(id: number): Promise<LoanEntry | null> {
  const result = await pool.query(
    `
      UPDATE loans
      SET status = 'repaid', repaid_at = NOW()
      WHERE id = $1 AND status = 'active'
      RETURNING *
    `,
    [id],
  );

  if (!result.rows[0]) return null;
  return mapLoanRow(result.rows[0]);
}

export async function getAllLoans(): Promise<LoanEntry[]> {
  const result = await pool.query('SELECT * FROM loans ORDER BY created_at DESC');
  return result.rows.map(mapLoanRow);
}

export async function getLoanSummary(): Promise<SummaryResponse> {
  const today = new Date();
  const result = await pool.query(
    `
      SELECT
        COALESCE(SUM(CASE WHEN status = 'active' THEN amount ELSE 0 END), 0) AS total_lent,
        COALESCE(SUM(CASE WHEN status = 'repaid' THEN amount ELSE 0 END), 0) AS total_repaid,
        COALESCE(SUM(CASE WHEN status = 'active' AND due_date < $1 THEN amount ELSE 0 END), 0) AS overdue_amount
      FROM loans
    `,
    [today.toISOString().slice(0, 10)],
  );

  return {
    totalLent: Number(result.rows[0].total_lent),
    totalRepaid: Number(result.rows[0].total_repaid),
    overdueAmount: Number(result.rows[0].overdue_amount),
  };
}

function mapLoanRow(row: any): LoanEntry {
  return {
    id: Number(row.id),
    friendName: row.friend_name,
    phoneNumber: row.phone_number,
    amount: Number(row.amount),
    dueDate: row.due_date,
    createdAt: row.created_at,
    repaidAt: row.repaid_at,
    status: row.status,
    receiptUrl: row.receipt_url || null,
  };
}
