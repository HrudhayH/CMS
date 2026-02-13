const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
        default: 'Not Started'
    },
    dueDate: {
        type: Date
    }
}, { _id: true }); // Ensure milestones have IDs

const phaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed', 'On Hold'],
        default: 'Not Started'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    milestones: [milestoneSchema],
    latestComment: {
        type: String,
        trim: true,
        default: ''
    }
}, { _id: true }); // Ensure phases have IDs

const roadmapSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        unique: true
    },
    phases: [phaseSchema]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for overall progress
roadmapSchema.virtual('overallProgress').get(function () {
    if (!this.phases || this.phases.length === 0) return 0;
    const totalProgress = this.phases.reduce((sum, phase) => sum + (phase.progress || 0), 0);
    return Math.round(totalProgress / this.phases.length);
});

// Virtual for total phases count
roadmapSchema.virtual('totalPhases').get(function () {
    return this.phases ? this.phases.length : 0;
});

// Virtual for completed phases count
roadmapSchema.virtual('completedPhases').get(function () {
    return this.phases ? this.phases.filter(p => p.status === 'Completed').length : 0;
});

// Virtual for roadmap status (derived from phases)
roadmapSchema.virtual('status').get(function () {
    if (!this.phases || this.phases.length === 0) return 'Not Started';
    const allCompleted = this.phases.every(p => p.status === 'Completed');
    if (allCompleted) return 'Completed';
    const anyInProgress = this.phases.some(p => p.status === 'In Progress' || p.progress > 0);
    if (anyInProgress) return 'In Progress';
    return 'Not Started';
});

// Virtual for deadline (end date of the last phase)
roadmapSchema.virtual('deadline').get(function () {
    if (!this.phases || this.phases.length === 0) return null;
    // Find the max end date
    const dates = this.phases.map(p => p.endDate).filter(d => d);
    if (dates.length === 0) return null;
    return new Date(Math.max.apply(null, dates));
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
