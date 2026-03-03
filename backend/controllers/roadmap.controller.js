const Roadmap = require('../models/Roadmap');
const Project = require('../models/Project');

// Get Roadmap by Project ID
exports.getRoadmap = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Verify project exists and user has access (already handled by middleware but good to be safe)
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        let roadmap = await Roadmap.findOne({ project: projectId });

        if (!roadmap) {
            // Return null or empty structure, front-end handles the "Create" state
            return res.status(200).json(null);
        }

        res.status(200).json(roadmap);
    } catch (error) {
        console.error('Error fetching roadmap:', error);
        res.status(500).json({ message: 'Server error fetching roadmap' });
    }
};

// Create Roadmap
exports.createRoadmap = async (req, res) => {
    try {
        const projectId = req.params.id;

        // Check if already exists
        let roadmap = await Roadmap.findOne({ project: projectId });
        if (roadmap) {
            return res.status(400).json({ message: 'Roadmap already exists for this project' });
        }

        roadmap = new Roadmap({
            project: projectId,
            phases: []
        });

        await roadmap.save();
        res.status(201).json(roadmap);
    } catch (error) {
        console.error('Error creating roadmap:', error);
        res.status(500).json({ message: 'Server error creating roadmap' });
    }
};

// Add Phase
exports.addPhase = async (req, res) => {
    try {
        const projectId = req.params.id;
        const phaseData = req.body; // Expects { name, startDate, endDate, status, progress, milestones, latestComment }

        // ✅ Validation
        if (!phaseData.name || !phaseData.name.trim()) {
            return res.status(400).json({ message: 'Phase name is required' });
        }
        if (!phaseData.startDate) {
            return res.status(400).json({ message: 'Start date is required' });
        }
        if (!phaseData.endDate) {
            return res.status(400).json({ message: 'End date is required' });
        }

        console.log('[addPhase] Adding phase for projectId:', projectId, 'phaseData:', phaseData);

        const roadmap = await Roadmap.findOne({ project: projectId });
        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found. Create it first.' });
        }

        // ✅ Clean the phase data before adding
        const cleanPhaseData = {
            name: phaseData.name.trim(),
            startDate: phaseData.startDate,
            endDate: phaseData.endDate,
            status: phaseData.status || 'Not Started',
            progress: parseInt(phaseData.progress) || 0,
            milestones: Array.isArray(phaseData.milestones) ? phaseData.milestones : [],
            latestComment: phaseData.latestComment || ''
        };

        console.log('[addPhase] Clean phase data:', cleanPhaseData);

        roadmap.phases.push(cleanPhaseData);
        await roadmap.save();

        console.log('[addPhase] Phase added successfully');
        res.status(201).json(roadmap);
    } catch (error) {
        console.error('[addPhase] Error adding phase:', error.message, error.stack);
        res.status(500).json({ 
            message: 'Server error adding phase',
            error: error.message
        });
    }
};

// Update Phase
exports.updatePhase = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { phaseId } = req.params;
        const updates = req.body; // Expects fields to update

        // ✅ Validation
        if (updates.name && !updates.name.trim()) {
            return res.status(400).json({ message: 'Phase name cannot be empty' });
        }

        console.log('[updatePhase] Updating phase:', { projectId, phaseId, updates });

        const roadmap = await Roadmap.findOne({ project: projectId });
        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        const phase = roadmap.phases.id(phaseId);
        if (!phase) {
            return res.status(404).json({ message: 'Phase not found' });
        }

        // ✅ Apply updates with validation
        if (updates.name) phase.name = updates.name.trim();
        if (updates.startDate) phase.startDate = updates.startDate;
        if (updates.endDate) phase.endDate = updates.endDate;
        if (updates.status) phase.status = updates.status;
        if (updates.progress !== undefined) phase.progress = updates.progress;
        if (updates.latestComment !== undefined) phase.latestComment = updates.latestComment;

        // Handle milestones update - validate and clean
        if (updates.milestones) {
            phase.milestones = Array.isArray(updates.milestones) ? updates.milestones : [];
        }

        await roadmap.save();
        console.log('[updatePhase] Phase updated successfully');
        res.status(200).json(roadmap);
    } catch (error) {
        console.error('[updatePhase] Error updating phase:', error.message, error.stack);
        res.status(500).json({ 
            message: 'Server error updating phase',
            error: error.message
        });
    }
};

// Add Milestone to a Phase
exports.addMilestone = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { phaseId } = req.params;
        const milestoneData = req.body; // Expects { title, dueDate, status }

        const roadmap = await Roadmap.findOne({ project: projectId });
        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        const phase = roadmap.phases.id(phaseId);
        if (!phase) {
            return res.status(404).json({ message: 'Phase not found' });
        }

        phase.milestones.push(milestoneData);
        await roadmap.save();

        res.status(201).json(roadmap);
    } catch (error) {
        console.error('Error adding milestone:', error);
        res.status(500).json({ message: 'Server error adding milestone' });
    }
};

// Update Milestone
exports.updateMilestone = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { phaseId, milestoneId } = req.params;
        const updates = req.body; // Expects fields to update

        const roadmap = await Roadmap.findOne({ project: projectId });
        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        const phase = roadmap.phases.id(phaseId);
        if (!phase) {
            return res.status(404).json({ message: 'Phase not found' });
        }

        const milestone = phase.milestones.id(milestoneId);
        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        // Apply updates
        if (updates.title) milestone.title = updates.title;
        if (updates.dueDate) milestone.dueDate = updates.dueDate;
        if (updates.status) milestone.status = updates.status;

        await roadmap.save();
        res.status(200).json(roadmap);
    } catch (error) {
        console.error('Error updating milestone:', error);
        res.status(500).json({ message: 'Server error updating milestone' });
    }
};

// Delete Phase
exports.deletePhase = async (req, res) => {
    try {
        const projectId = req.params.id;
        const { phaseId } = req.params;

        console.log('[deletePhase] Deleting phase:', { projectId, phaseId });

        const roadmap = await Roadmap.findOne({ project: projectId });
        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        const phaseIndex = roadmap.phases.findIndex(p => p._id.toString() === phaseId);
        if (phaseIndex === -1) {
            return res.status(404).json({ message: 'Phase not found' });
        }

        roadmap.phases.splice(phaseIndex, 1);
        await roadmap.save();

        console.log('[deletePhase] Phase deleted successfully');
        res.status(200).json(roadmap);
    } catch (error) {
        console.error('[deletePhase] Error deleting phase:', error.message, error.stack);
        res.status(500).json({ 
            message: 'Server error deleting phase',
            error: error.message
        });
    }
};
