const otpStore = new Map<string, string>();

export function generateOtp(phoneNumber: string): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phoneNumber, otp);
  console.log(`[OTP] Phone: ${phoneNumber} OTP: ${otp}`);
  return otp;
}

export function verifyOtp(phoneNumber: string, otp: string): boolean {
  return otpStore.get(phoneNumber) === otp;
}
