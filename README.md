# MiniLedger

MiniLedger is a small money-lending tracker for friends. It includes a Node.js + TypeScript + PostgreSQL backend and a React Native app.

## Project structure
- `backend/` — Express API with PostgreSQL persistence
- `mobile/` — Expo React Native client

## Features implemented
- Phone login with a mock OTP that is printed to the backend console
- Add loan entries with friend name, phone number, amount, due date, and optional receipt URL
- Mark a loan as repaid
- Get a summary of total lent, total repaid, and overdue amount
- Overdue loan entries highlighted in the app
- Basic validation and working backend tests

## Backend setup
1. Go to the `backend` folder
2. Copy `.env.example` to `.env` if desired
3. Start PostgreSQL using Docker:
   ```bash
   docker compose up -d
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the API:
   ```bash
   npm run dev
   ```

## Backend scripts
- `npm run dev` — start dev server
- `npm run build` — compile TypeScript
- `npm run start` — run compiled server
- `npm test` — run Node test suite

## App setup
1. Go to the `mobile` folder
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Expo:
   ```bash
   npm start
   ```
4. Open the app with an iOS simulator, Android emulator, or Expo Go

## API endpoints
- `POST /api/login` with `{ "phoneNumber": "+919999999999" }`
- `POST /api/verify-otp` with `{ "phoneNumber": "+919999999999", "otp": "123456" }`
- `GET /api/loans`
- `POST /api/loans` with payload:
  ```json
  {
    "friendName": "Sam",
    "phoneNumber": "+919999999999",
    "amount": 2500,
    "dueDate": "2026-10-25",
    "receiptUrl": "https://example.com/receipt.jpg"
  }
  ```
- `PATCH /api/loans/:id/repaid`
- `GET /api/summary`

## Notes
- This is a mock OTP flow; the OTP is printed in the backend console for development/testing.
- The optional receipt feature is implemented as a URL field in the entry, which keeps the app lightweight and easy to run locally.
