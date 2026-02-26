const express = require('express');
const router = express.Router();
const {
  handleRequestOtp,
  handleVerifyOtp,
  handleResetPassword
} = require('../controllers/forgotPassword.controller');

router.post('/request-otp', handleRequestOtp);
router.post('/verify-otp', handleVerifyOtp);
router.post('/reset-password', handleResetPassword);

module.exports = router;
