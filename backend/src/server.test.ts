import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOtp, verifyOtp } from './utils/otp';

test('generates an OTP and verifies it for the same phone number', () => {
  const phone = '+911234567890';
  const otp = generateOtp(phone);
  assert.equal(otp.length, 6);
  assert.equal(verifyOtp(phone, otp), true);
});

test('fails for a different OTP', () => {
  const phone = '+911234567891';
  const otp = generateOtp(phone);
  assert.equal(verifyOtp(phone, `${Number(otp) + 1}`.padStart(6, '0')), false);
});
