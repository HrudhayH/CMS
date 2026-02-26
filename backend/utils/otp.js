const bcrypt = require('bcrypt');
const crypto = require('crypto');

const OTP_LENGTH = 6;
const SALT_ROUNDS = 10;

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
function generateOTP() {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  const otp = crypto.randomInt(min, max + 1);
  return otp.toString();
}

/**
 * Hash OTP using bcrypt
 */
async function hashOTP(otp) {
  return bcrypt.hash(otp, SALT_ROUNDS);
}

/**
 * Compare plain OTP with hashed OTP
 */
async function compareOTP(otp, hash) {
  return bcrypt.compare(otp, hash);
}

/**
 * Get expiry date (default from env or 5 minutes)
 */
function getExpiresAt() {
  const ttlMinutes = parseInt(process.env.OTP_TTL_MIN, 10) || 5;
  return new Date(Date.now() + ttlMinutes * 60 * 1000);
}

module.exports = { generateOTP, hashOTP, compareOTP, getExpiresAt };
