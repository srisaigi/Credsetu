import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateOtp, verifyOtp } from './utils/otp';
import { initializeDatabase, addLoanEntry, getAllLoans, getLoanSummary, markLoanRepaid } from './services/loanService';
import { loanCreateSchema, loginSchema, otpSchema, validate } from './middleware/validate';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.post('/api/login', validate(loginSchema), (req, res) => {
  const { phoneNumber } = req.body as { phoneNumber: string };
  const otp = generateOtp(phoneNumber);
  res.json({ message: 'OTP sent', otp });
});

app.post('/api/verify-otp', validate(otpSchema), (req, res) => {
  const { phoneNumber, otp } = req.body as { phoneNumber: string; otp: string };
  if (!verifyOtp(phoneNumber, otp)) {
    return res.status(401).json({ error: 'Invalid OTP' });
  }

  return res.json({ message: 'Login successful', token: 'mock-token' });
});

app.get('/api/loans', async (_req, res) => {
  try {
    const loans = await getAllLoans();
    res.json(loans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

app.get('/api/summary', async (_req, res) => {
  try {
    const summary = await getLoanSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

app.post('/api/loans', validate(loanCreateSchema), async (req, res) => {
  try {
    const loan = await addLoanEntry(req.body);
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create loan entry' });
  }
});

app.patch('/api/loans/:id/repaid', async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid loan ID' });

  try {
    const loan = await markLoanRepaid(id);
    if (!loan) return res.status(404).json({ error: 'Loan not found or already repaid' });
    res.json(loan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update loan' });
  }
});

async function start() {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`MiniLedger API running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

start();
