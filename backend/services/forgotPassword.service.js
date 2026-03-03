const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const Client = require('../models/Client');
const OtpToken = require('../models/OtpToken');
const bcrypt = require('bcrypt');
const { generateOTP, hashOTP, compareOTP, getExpiresAt } = require('../utils/otp');
const { sendOtpEmail } = require('../utils/email');

/**
 * Resolve user model from role
 */
function getModelForRole(role) {
  switch (role) {
    case 'admin': return Admin;
    case 'staff': return Staff;
    case 'client': return Client;
    default: return null;
  }
}

/**
 * Request a forgot-password OTP
 */
async function requestForgotOtp(email, role) {
  const Model = getModelForRole(role);
  if (!Model) throw new Error('Invalid role.');

  // Find user — for staff/client, password is select:false so we just need existence
  const user = await Model.findOne({ email: email.toLowerCase().trim() });

  // Always return success to prevent email enumeration
  if (!user) return { success: true, message: 'If the email exists, an OTP has been sent.' };

  // Generate & hash OTP
  const otp = generateOTP();
  const otpHash = await hashOTP(otp);

  // Store OTP token
  await OtpToken.create({
    email: email.toLowerCase().trim(),
    otpHash,
    purpose: 'forgot',
    role,
    expiresAt: getExpiresAt(),
    consumed: false
  });

  // Send email (fire-and-forget style but await for error handling)
  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error('[ForgotPassword] Email send failed:', err.message);
    // Still return success to prevent enumeration
  }

  return { success: true, message: 'If the email exists, an OTP has been sent.' };
}

/**
 * Verify a forgot-password OTP
 */
async function verifyForgotOtp(email, code, role) {
  // Find the latest unconsumed OTP for this email + role
  const otpRecord = await OtpToken.findOne({
    email: email.toLowerCase().trim(),
    purpose: 'forgot',
    role,
    consumed: false
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return { success: false, message: 'Invalid or expired OTP.' };
  }

  // Check expiry
  if (new Date() > otpRecord.expiresAt) {
    // Mark as consumed so it can't be retried
    otpRecord.consumed = true;
    await otpRecord.save();
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  // Compare hash
  const isValid = await compareOTP(code, otpRecord.otpHash);
  if (!isValid) {
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }

  // Mark consumed
  otpRecord.consumed = true;
  await otpRecord.save();

  return { success: true, message: 'OTP verified successfully.' };
}

/**
 * Reset password after OTP verification
 */
async function resetPassword(email, newPassword, role) {
  const Model = getModelForRole(role);
  if (!Model) throw new Error('Invalid role.');

  const user = await Model.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password directly (bypass pre-save hook to avoid double hashing)
  await Model.updateOne(
    { _id: user._id },
    { $set: { password: hashedPassword } }
  );

  // Clean up any remaining unconsumed OTPs for this email + role
  await OtpToken.updateMany(
    { email: email.toLowerCase().trim(), role, consumed: false },
    { $set: { consumed: true } }
  );

  return { success: true, message: 'Password reset successfully.' };
}

module.exports = { requestForgotOtp, verifyForgotOtp, resetPassword };
