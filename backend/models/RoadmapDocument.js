const mongoose = require('mongoose');

const roadmapDocumentSchema = new mongoose.Schema({
    roadmap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    file_name: {
        type: String,
        required: true
    },
    file_path: {
        type: String, // Supabase path
        required: true
    },
    uploaded_by: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'uploaded_by_model'
    },
    uploaded_by_model: {
        type: String,
        required: true,
        enum: ['Admin', 'Staff']
    },
    approval_status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    uploaded_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RoadmapDocument', roadmapDocumentSchema);
