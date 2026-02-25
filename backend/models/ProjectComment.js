const mongoose = require('mongoose');

const projectCommentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel'
    },

    senderModel: {
      type: String,
      enum: ['Client', 'Staff'],
      required: true
    },

    senderName: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    status: {
      type: String,
      enum: ['Open', 'Responded', 'Closed'],
      default: 'Open'
    },

    isEdited: {
      type: Boolean,
      default: false
    },

    editedAt: {
      type: Date
    },

    attachments: [
      {
        url: String,
        filename: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
projectCommentSchema.index({ project: 1, createdAt: -1 });
projectCommentSchema.index({ project: 1, senderModel: 1 });

module.exports = mongoose.model('ProjectComment', projectCommentSchema);
