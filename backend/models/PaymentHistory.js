const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    paymentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentPlan',
      required: true
    },
    phaseName: {
      type: String,
      default: 'FULL_PAYMENT',
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMode: {
      type: String,
      enum: ['UPI', 'BANK', 'CASH', 'CHEQUE'],
      required: true
    },
    paidDate: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    type: {
      type: String,
      enum: ['PAYMENT', 'EDIT'],
      default: 'PAYMENT'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    previousAmount: {
      type: Number,
      default: null
    },
    newAmount: {
      type: Number,
      default: null
    },
    previousMode: {
      type: String,
      default: null
    },
    newMode: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for paginated queries by client
paymentHistorySchema.index({ client: 1, createdAt: -1 });
// Index for global history queries
paymentHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('PaymentHistory', paymentHistorySchema);
