const mongoose = require('mongoose');

const paymentPhaseSchema = new mongoose.Schema(
  {
    paymentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentPlan',
      required: true,
      index: true
    },
    phaseName: {
      type: String,
      required: true,
      trim: true
    },
    amountType: {
      type: String,
      enum: ['FIXED', 'PERCENTAGE'],
      required: true
    },
    amountValue: {
      type: Number,
      required: true,
      min: 0
    },
    calculatedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    dueDate: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING'
    },
    paidDate: {
      type: Date,
      default: null
    },
    paymentMode: {
      type: String,
      enum: ['UPI', 'BANK', 'CASH', 'CHEQUE'],
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for querying phases by plan and status
paymentPhaseSchema.index({ paymentPlan: 1, status: 1 });

module.exports = mongoose.model('PaymentPhase', paymentPhaseSchema);
