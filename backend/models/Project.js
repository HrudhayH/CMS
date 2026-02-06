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
    ],

    // Daily updates from staff
    dailyUpdates: [
      {
        staff: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Staff',
          required: true
        },
        status: {
          type: String,
          required: true
        },
        progress: {
          type: Number,
          default: 0
        },
        comment: {
          type: String,
          required: true
        },
        images: [
          {
            type: String
          }
        ],
        replies: [
          {
            senderType: {
              type: String,
              enum: ['staff', 'client'],
              required: true
            },
            staff: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Staff'
            },
            client: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Client'
            },
            message: {
              type: String,
              required: true
            },
            createdAt: {
              type: Date,
              default: Date.now
            }
          }
        ],
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // Overall project progress percentage
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
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
