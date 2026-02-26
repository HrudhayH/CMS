const {
  requestForgotOtp,
  verifyForgotOtp,
  resetPassword
} = require('../services/forgotPassword.service');

const VALID_ROLES = ['admin', 'staff', 'client'];

/**
 * POST /api/auth/forgot/request-otp
 * Body: { email, role }
 */
const handleRequestOtp = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ success: false, message: 'Email and role are required.' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    const result = await requestForgotOtp(email, role);
    return res.json(result);
  } catch (error) {
    console.error('[ForgotPassword] requestOtp error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * POST /api/auth/forgot/verify-otp
 * Body: { email, code, role }
 */
const handleVerifyOtp = async (req, res) => {
  try {
    const { email, code, role } = req.body;

    if (!email || !code || !role) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and role are required.' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    // OTP must be exactly 6 digits
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: 'OTP must be a 6-digit number.' });
    }

    const result = await verifyForgotOtp(email, code, role);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error) {
    console.error('[ForgotPassword] verifyOtp error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * POST /api/auth/forgot/reset-password
 * Body: { email, newPassword, role }
 */
const handleResetPassword = async (req, res) => {
  try {
    const { email, newPassword, role } = req.body;

    if (!email || !newPassword || !role) {
      return res.status(400).json({ success: false, message: 'Email, new password, and role are required.' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    // Password strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const result = await resetPassword(email, newPassword, role);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.json(result);
  } catch (error) {
    console.error('[ForgotPassword] resetPassword error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = { handleRequestOtp, handleVerifyOtp, handleResetPassword };
