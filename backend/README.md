# MiniLedger Backend

A small Node.js + TypeScript + PostgreSQL API for tracking loans lent to friends.

## Features
- Mock phone-number login using OTP printed in server logs
- Add a loan entry
- Mark a loan as repaid
- View all loan entries
- Get summary of total lent, total repaid, and overdue amount

## Prerequisites
- Node.js 18+
- PostgreSQL running locally or via Docker

## Setup
1. Install dependencies:
   npm install
2. Start PostgreSQL:
   docker compose up -d
3. Copy `.env.example` to `.env` and update the values if needed
4. Start the API:
   npm run dev

## Available scripts
- `npm run dev` – run development server with tsx
- `npm run build` – compile TypeScript
- `npm run start` – start compiled server
- `npm test` – run Jest tests

## API
### POST /api/login
Request:
{
  "phoneNumber": "+919999999999"
}

Response:
{
  "message": "OTP sent",
  "otp": "123456"
}

### POST /api/verify-otp
Request:
{
  "phoneNumber": "+919999999999",
  "otp": "123456"
}

### GET /api/loans
Returns the list of loan entries.

### POST /api/loans
Request:
{
  "friendName": "Sam",
  "phoneNumber": "+919999999999",
  "amount": 2500,
  "dueDate": "2026-10-25",
  "receiptUrl": "https://example.com/receipt.jpg"
}

### PATCH /api/loans/:id/repaid
Marks the loan as repaid.

### GET /api/summary
Returns:
{
  "totalLent": 5000,
  "totalRepaid": 2500,
  "overdueAmount": 1500
}
