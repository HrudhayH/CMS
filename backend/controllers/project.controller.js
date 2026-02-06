const Project = require('../models/Project');

// Get all projects with pagination
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find()
        .populate('assignedClients', 'name email phone status')
        .populate('assignedStaff', 'name email status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments()
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

// Get single project by ID
const getProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('assignedClients', 'name email phone status')
      .populate('assignedStaff', 'name email status');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Create new project
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      startDate,
      endDate,
      techStack,
      assignedClients,
      assignedStaff
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required.'
      });
    }

    // Date validation
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date.'
      });
    }

    const project = await Project.create({
      title,
      description: description || '',
      status: status || 'New',
      startDate: startDate || null,
      endDate: endDate || null,
      techStack: techStack || [],
      assignedClients: assignedClients || [],
      assignedStaff: assignedStaff || []
    });

    const populatedProject = await Project.findById(project._id)
      .populate('assignedClients', 'name email phone status')
      .populate('assignedStaff', 'name email status');

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: populatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error.',
      error: error.message
    });
  }
};


// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      startDate,
      endDate,
      techStack,
      assignedClients,
      assignedStaff
    } = req.body;

    // Date validation
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date.'
      });
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.startDate = startDate || null;
    if (endDate !== undefined) updateData.endDate = endDate || null;
    if (techStack !== undefined) updateData.techStack = techStack;
    if (assignedClients !== undefined) updateData.assignedClients = assignedClients;
    if (assignedStaff !== undefined) updateData.assignedStaff = assignedStaff;

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignedClients', 'name email phone status')
      .populate('assignedStaff', 'name email status');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found.'
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully.',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error.',
      error: error.message
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Update project status
const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['New', 'In Progress', 'On Hold', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use New, In Progress, On Hold, or Completed.'
      });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('assignedClients', 'name email phone status')
      .populate('assignedStaff', 'name email status');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({ success: true, message: 'Project status updated successfully.', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus
};
