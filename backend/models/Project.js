const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      unique: true,
      sparse: true
    },

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
    },

    // Deployment Links
    developmentLink: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty
          return /^https?:\/\/.+/.test(v); // Basic URL validation
        },
        message: 'Invalid development URL format'
      }
    },

    productionLink: {
      type: String,
      trim: true,
      default: '',
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty
          return /^https?:\/\/.+/.test(v); // Basic URL validation
        },
        message: 'Invalid production URL format'
      }
    },

    // Reference link (Figma, Google Drive, external doc, etc.)
    referenceLink: {
      type: String,
      trim: true,
      default: ''
    },

    // Project Documents
    document_link: {
      type: String,
      trim: true,
      default: ''
    },
    document_file_url: {
      type: String,
      default: ''
    },
    document_file_name: {
      type: String,
      default: ''
    },
    uploadedAt: {
      type: Date
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
projectSchema.index({ projectCode: 1 });
projectSchema.index({ title: 'text' });

module.exports = mongoose.model('Project', projectSchema);
