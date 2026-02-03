const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
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
  assignedClients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  }],
  assignedStaff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }]
}, { 
  timestamps: true 
});

// Index for faster queries
projectSchema.index({ status: 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
