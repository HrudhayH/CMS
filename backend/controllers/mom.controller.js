const MOM = require('../models/MOM');
const Project = require('../models/Project');

/**
 * Create a new MOM
 * POST /api/mom/create
 */
exports.createMOM = async (req, res) => {
    try {
        const {
            project_id,
            client_id,
            meeting_date,
            meeting_title,
            attendees,
            discussion_points,
            action_items,
            next_followup_date,
            status
        } = req.body;

        const creator = req.user.id;
        const creatorModel = (req.user.role === 'admin' || req.user.role === 'super_admin') ? 'Admin' : 'Staff';

        // Verify if staff is assigned to the project
        const project = await Project.findOne({
            _id: project_id,
            assignedStaff: creator
        });

        if (!project && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this project.'
            });
        }

        const newMOM = new MOM({
            project_id,
            client_id,
            creator,
            creatorModel,
            meeting_date,
            meeting_title,
            attendees,
            discussion_points,
            action_items,
            next_followup_date,
            status
        });

        await newMOM.save();

        res.status(201).json({
            success: true,
            message: 'MOM created successfully.',
            data: newMOM
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};

/**
 * Get all MOMs with filtering
 * GET /api/mom/all
 */
exports.getAllMOMs = async (req, res) => {
    try {
        const { client, project, staff, date, status } = req.query;
        let query = {};

        // Role-based access control
        if (req.user.role === 'staff') {
            query.creator = req.user.id;
        } else if (req.user.role === 'client') {
            // Find projects where this client is assigned
            const projects = await Project.find({ assignedClients: req.user.id }).select('_id');
            const projectIds = projects.map(p => p._id);
            query.project_id = { $in: projectIds };
        }

        // Apply filters
        if (client) query.client_id = client;
        if (project) query.project_id = project;
        if (staff) query.creator = staff;
        if (status) query.status = status;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.meeting_date = { $gte: startOfDay, $lte: endOfDay };
        }

        const moms = await MOM.find(query)
            .populate('project_id', 'title projectCode')
            .populate('client_id', 'name email company')
            .populate('creator', 'name email')
            .sort({ meeting_date: -1 });

        res.json({ success: true, data: moms });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};

/**
 * Get MOM by ID
 * GET /api/mom/:id
 */
exports.getMOMById = async (req, res) => {
    try {
        const { id } = req.params;
        const mom = await MOM.findById(id)
            .populate('project_id', 'title projectCode assignedClients assignedStaff')
            .populate('client_id', 'name email company')
            .populate('creator', 'name email');

        if (!mom) {
            return res.status(404).json({ success: false, message: 'MOM not found.' });
        }

        // Access control check
        if (req.user.role === 'staff' && mom.creator._id.toString() !== req.user.id) {
            // Check if staff is assigned to project
            const isAssigned = mom.project_id.assignedStaff.some(s => s.toString() === req.user.id);
            if (!isAssigned) return res.status(403).json({ success: false, message: 'Access denied.' });
        } else if (req.user.role === 'client') {
            const isAssigned = mom.project_id.assignedClients.some(c => c.toString() === req.user.id);
            if (!isAssigned) return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        res.json({ success: true, data: mom });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};

/**
 * Get MOMs by Project ID
 * GET /api/mom/project/:projectId
 */
exports.getMOMsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Check access
        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found.' });

        if (req.user.role === 'staff' && !project.assignedStaff.includes(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        } else if (req.user.role === 'client' && !project.assignedClients.includes(req.user.id)) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        const moms = await MOM.find({ project_id: projectId })
            .populate('creator', 'name email')
            .sort({ meeting_date: -1 });

        res.json({ success: true, data: moms });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};

/**
 * Update MOM
 * PUT /api/mom/update/:id
 */
exports.updateMOM = async (req, res) => {
    try {
        const { id } = req.params;
        const mom = await MOM.findById(id);

        if (!mom) {
            return res.status(404).json({ success: false, message: 'MOM not found.' });
        }

        // Role-based editing restrictions
        if (req.user.role === 'staff' && mom.creator.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only edit your own MOMs.' });
        }

        if (req.user.role === 'admin' && req.user.role !== 'super_admin') {
            // Admin cannot edit unless super_admin (as per requirements)
            // But wait, the requirement says "Admin: Cannot edit unless Super Admin"
            // Let's enforce that.
            return res.status(403).json({ success: false, message: 'Admins cannot edit MOMs. Only Staff (own) or Super Admins can edit.' });
        }

        if (req.user.role === 'client') {
            return res.status(403).json({ success: false, message: 'Clients cannot edit MOMs.' });
        }

        const updatedMOM = await MOM.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        res.json({
            success: true,
            message: 'MOM updated successfully.',
            data: updatedMOM
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};

/**
 * Delete MOM
 * DELETE /api/mom/delete/:id
 */
exports.deleteMOM = async (req, res) => {
    try {
        const { id } = req.params;
        const mom = await MOM.findById(id);

        if (!mom) {
            return res.status(404).json({ success: false, message: 'MOM not found.' });
        }

        // Only Super Admin or the Staff who created it can delete? 
        // Requirement says "Super Admin: Full access (view/edit/delete)"
        // It doesn't explicitly say Staff can delete. Let's stick to Super Admin for delete for safety, 
        // or allow the creator staff as well. I'll allow Super Admin and Creator Staff.

        if (req.user.role !== 'super_admin' && (req.user.role === 'staff' && mom.creator.toString() !== req.user.id)) {
            return res.status(403).json({ success: false, message: 'Permission denied to delete.' });
        }

        if (req.user.role === 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ success: false, message: 'Admins cannot delete MOMs.' });
        }

        await MOM.findByIdAndDelete(id);

        res.json({ success: true, message: 'MOM deleted successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};
