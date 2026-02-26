const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    otpHash: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      enum: ['forgot'],
      default: 'forgot'
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'client'],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    consumed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Compound index for fast lookups
otpTokenSchema.index({ email: 1, purpose: 1, consumed: 1, role: 1 });

// TTL index — auto-delete expired tokens after 1 hour
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('OtpToken', otpTokenSchema);
