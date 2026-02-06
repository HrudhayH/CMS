/**
 * Staff Portal Controller
 * Handles staff-specific API endpoints.
 * All endpoints filter data by the logged-in staff member (req.user.id).
 */
const Project = require('../models/Project');

/**
 * Get dashboard stats for the logged-in staff member.
 * Only counts projects assigned to this staff.
 */
const getStaffDashboardStats = async (req, res) => {
  try {
    const staffId = req.user.id;

    // Get all projects assigned to this staff member
    const [
      totalProjects,
      inProgressProjects,
      completedProjects,
      onHoldProjects
    ] = await Promise.all([
      Project.countDocuments({ assignedStaff: staffId }),
      Project.countDocuments({ assignedStaff: staffId, status: 'In Progress' }),
      Project.countDocuments({ assignedStaff: staffId, status: 'Completed' }),
      Project.countDocuments({ assignedStaff: staffId, status: 'On Hold' })
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        inProgress: inProgressProjects,
        completed: completedProjects,
        onHold: onHoldProjects
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * Get recent projects for the logged-in staff member.
 * Returns the 5 most recently updated projects.
 */
const getStaffRecentProjects = async (req, res) => {
  try {
    const staffId = req.user.id;

    const recentProjects = await Project.find({ assignedStaff: staffId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status updatedAt')
      .lean();

    res.json({
      success: true,
      data: recentProjects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * Get all projects assigned to the logged-in staff member with pagination.
 */
const getStaffProjects = async (req, res) => {
  try {
    const staffId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find({ assignedStaff: staffId })
        .populate('assignedClients', 'name email phone')
        .populate('assignedStaff', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments({ assignedStaff: staffId })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * Get a single project by ID (only if assigned to the logged-in staff).
 */
const getStaffProjectById = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;

    const project = await Project.findOne({ 
      _id: id, 
      assignedStaff: staffId 
    })
      .populate('assignedClients', 'name email phone')
      .populate('assignedStaff', 'name email')
      .populate('dailyUpdates.staff', 'name email')
      .lean();

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found or you do not have access to it.' 
      });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * Add a daily update to a project (staff only).
 * Updates project status, progress, and adds to dailyUpdates array.
 */
const addProjectUpdate = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;
    const { status, progress, comment } = req.body;

    // Validate required fields
    if (!comment || !comment.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment is required.' 
      });
    }

    // Find project and verify staff is assigned
    const project = await Project.findOne({ 
      _id: id, 
      assignedStaff: staffId 
    });

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found or you do not have access to it.' 
      });
    }

    // Create the new update object
    const newUpdate = {
      staff: staffId,
      status: status || project.status,
      progress: parseInt(progress) || project.progress || 0,
      comment: comment.trim(),
      createdAt: new Date()
    };

    // Update project: push new update, update status and progress
    project.dailyUpdates.unshift(newUpdate);
    project.status = newUpdate.status;
    project.progress = newUpdate.progress;
    
    await project.save();

    // Return updated project with populated fields
    const updatedProject = await Project.findById(id)
      .populate('assignedClients', 'name email phone')
      .populate('assignedStaff', 'name email')
      .populate('dailyUpdates.staff', 'name email')
      .lean();

    res.json({ 
      success: true, 
      message: 'Update added successfully.',
      data: updatedProject 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * Get paginated daily updates for a project (staff only).
 */
const getProjectUpdates = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    // Find project and verify staff is assigned
    const project = await Project.findOne({ 
      _id: id, 
      assignedStaff: staffId 
    }).lean();

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found or you do not have access to it.' 
      });
    }

    // Get total count of updates
    const total = project.dailyUpdates?.length || 0;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Slice the updates array for pagination (already sorted by createdAt DESC from unshift)
    const paginatedUpdates = (project.dailyUpdates || []).slice(skip, skip + limit);

    // Populate staff info for paginated updates
    const populatedUpdates = await Project.populate(paginatedUpdates, {
      path: 'staff',
      select: 'name email'
    });

    res.json({
      success: true,
      data: populatedUpdates,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = {
  getStaffDashboardStats,
  getStaffRecentProjects,
  getStaffProjects,
  getStaffProjectById,
  addProjectUpdate,
  getProjectUpdates
};
