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
    const { status, progress, comment, images } = req.body;

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
      images: images || [],
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
    })
      .populate('dailyUpdates.staff', 'name')
      .populate('dailyUpdates.replies.staff', 'name')
      .populate('dailyUpdates.replies.client', 'name')
      .lean();

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

    // Slice the updates array for pagination
    const paginatedUpdates = (project.dailyUpdates || []).slice(skip, skip + limit);

    res.json({
      success: true,
      data: paginatedUpdates,
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
 * Staff adds a reply to a daily update.
 */
const addStaffUpdateReply = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { id, updateId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const project = await Project.findOne({ _id: id, assignedStaff: staffId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or access denied.' });
    }

    const dailyUpdate = project.dailyUpdates.id(updateId);
    if (!dailyUpdate) {
      return res.status(404).json({ success: false, message: 'Daily update not found.' });
    }

    dailyUpdate.replies.push({
      senderType: 'staff',
      staff: staffId,
      message: message.trim(),
      createdAt: new Date()
    });

    await project.save();

    res.json({
      success: true,
      message: 'Reply added successfully.',
      data: dailyUpdate.replies[dailyUpdate.replies.length - 1]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

/**
 * Update project deployment links (development and production)
 * PUT /staff/projects/:projectId/deployment-links
 */
const updateDeploymentLinks = async (req, res) => {
  try {
   const { id } = req.params;
    const { developmentLink, productionLink } = req.body;

    // Validate inputs
    if (!developmentLink && !productionLink) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one deployment link is required' 
      });
    }

    // Validate URL format if provided
    const urlRegex = /^https?:\/\/.+/;
    
    if (developmentLink && !urlRegex.test(developmentLink)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid development URL format. Must start with http:// or https://' 
      });
    }

    if (productionLink && !urlRegex.test(productionLink)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid production URL format. Must start with http:// or https://' 
      });
    }

    // Find and update project
    const project = await Project.findByIdAndUpdate(
       id,
      {
        developmentLink: developmentLink || '',
        productionLink: productionLink || ''
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    console.log('[updateDeploymentLinks] Links updated for project:', id);

    res.status(200).json({
      success: true,
      message: 'Deployment links updated successfully',
      data: project
    });
  } catch (error) {
    console.error('[updateDeploymentLinks] Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating deployment links',
      error: error.message 
    });
  }
};

module.exports = {
  getStaffDashboardStats,
  getStaffRecentProjects,
  getStaffProjects,
  getStaffProjectById,
  addProjectUpdate,
  getProjectUpdates,
  addStaffUpdateReply,
  updateDeploymentLinks
};
