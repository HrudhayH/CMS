const mongoose = require('mongoose');
const Counter = require('./Counter');

const momSchema = new mongoose.Schema(
    {
        mom_id: {
            type: String,
            unique: true
        },
        project_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        client_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: true
        },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'creatorModel'
        },
        creatorModel: {
            type: String,
            required: true,
            enum: ['Staff', 'Admin'],
            default: 'Staff'
        },
        meeting_date: {
            type: Date,
            required: true
        },
        meeting_title: {
            type: String,
            required: true,
            trim: true
        },
        attendees: [
            {
                type: String,
                trim: true
            }
        ],
        discussion_points: [
            {
                type: String,
                trim: true
            }
        ],
        action_items: [
            {
                point: { type: String, trim: true },
                assignee: { type: String, trim: true },
                deadline: { type: Date }
            }
        ],
        next_followup_date: {
            type: Date
        },
        status: {
            type: String,
            enum: ['Open', 'Closed'],
            default: 'Open'
        }
    },
    {
        timestamps: true
    }
);

// Pre-save hook to generate mom_id
momSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const seq = await Counter.getNextSequence('mom');
            this.mom_id = `MOM-${seq.toString().padStart(4, '0')}`;
            next();
        } catch (error) {
            next(error);
        }
    } else {
        next();
    }
});

// Indexes
momSchema.index({ project_id: 1 });
momSchema.index({ client_id: 1 });
momSchema.index({ creator: 1 });
momSchema.index({ meeting_date: -1 });
momSchema.index({ status: 1 });

module.exports = mongoose.model('MOM', momSchema);
