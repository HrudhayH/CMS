const mongoose = require('mongoose');

const paymentPlanSchema = new mongoose.Schema(
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
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentType: {
      type: String,
      enum: ['ONE_TIME', 'PHASE_WISE'],
      required: true
    },
    totalPaidAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['PENDING', 'PARTIAL', 'PAID'],
      default: 'PENDING',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for remaining amount
paymentPlanSchema.virtual('remainingAmount').get(function () {
  return this.totalAmount - this.totalPaidAmount;
});

// Ensure virtuals are included in JSON
paymentPlanSchema.set('toJSON', { virtuals: true });
paymentPlanSchema.set('toObject', { virtuals: true });

// Unique index on project (one payment plan per project)
paymentPlanSchema.index({ project: 1 }, { unique: true });

module.exports = mongoose.model('PaymentPlan', paymentPlanSchema);
