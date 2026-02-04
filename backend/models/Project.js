const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true,
      default: ''
    },

    status: {
      type: String,
      enum: ['New', 'In Progress', 'On Hold', 'Completed'],
      default: 'New'
    },

    startDate: {
      type: Date
    },

    endDate: {
      type: Date
    },

    techStack: [
      {
        type: String,
        trim: true
      }
    ],

    assignedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
      }
    ],

    assignedStaff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ startDate: 1 });
projectSchema.index({ endDate: 1 });

module.exports = mongoose.model('Project', projectSchema);
