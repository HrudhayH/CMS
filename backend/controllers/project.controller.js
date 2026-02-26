const Project = require('../models/Project');
const Counter = require('../models/Counter');
const PaymentPlan = require('../models/PaymentPlan');
const PaymentPhase = require('../models/PaymentPhase');
const PaymentHistory = require('../models/PaymentHistory');
const Roadmap = require('../models/Roadmap');
const ProjectComment = require('../models/ProjectComment');

// Get all projects with pagination, search, and filters
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status, techStack, startDateFrom, startDateTo, sortBy, sortOrder } = req.query;

    // Build query conditions
    const query = {};

    // Search by title or projectCode
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { projectCode: searchRegex }
      ];
    }

    // Filter by status
    if (status && ['New', 'In Progress', 'On Hold', 'Completed'].includes(status)) {
      query.status = status;
    }

    // Filter by tech stack (comma-separated)
    if (techStack) {
      const stackArray = techStack.split(',').map(s => s.trim()).filter(Boolean);
      if (stackArray.length > 0) {
        query.techStack = { $in: stackArray };
      }
    }

    // Filter by start date range
    if (startDateFrom || startDateTo) {
      query.startDate = {};
      if (startDateFrom) query.startDate.$gte = new Date(startDateFrom);
      if (startDateTo) query.startDate.$lte = new Date(startDateTo);
    }

    // Build sort
    let sort = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sort = { [sortBy]: order };
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('assignedClients', 'name email phone status clientCode')
        .populate('assignedStaff', 'name email status employeeCode')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(query)
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
      .populate('assignedClients', 'name email phone status clientCode')
      .populate('assignedStaff', 'name email status employeeCode');

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
      assignedStaff,
      referenceLink,
      developmentLink,
      productionLink
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

    // Generate projectCode
    const seq = await Counter.getNextSequence('project');
    const projectCode = `PRJ-${String(seq).padStart(4, '0')}`;

    const project = await Project.create({
      projectCode,
      title,
      description: description || '',
      status: status || 'New',
      startDate: startDate || null,
      endDate: endDate || null,
      techStack: techStack || [],
      assignedClients: assignedClients || [],
      assignedStaff: assignedStaff || [],
      referenceLink: referenceLink || '',
      developmentLink: developmentLink || '',
      productionLink: productionLink || ''
    });

    const populatedProject = await Project.findById(project._id)
      .populate('assignedClients', 'name email phone status clientCode')
      .populate('assignedStaff', 'name email status employeeCode');

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
      assignedStaff,
      referenceLink,
      developmentLink,
      productionLink
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
    if (referenceLink !== undefined) updateData.referenceLink = referenceLink;
    if (developmentLink !== undefined) updateData.developmentLink = developmentLink;
    if (productionLink !== undefined) updateData.productionLink = productionLink;

    const project = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignedClients', 'name email phone status clientCode')
      .populate('assignedStaff', 'name email status employeeCode');

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

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Cascade: delete related payment data
    const paymentPlans = await PaymentPlan.find({ project: id });
    const planIds = paymentPlans.map(p => p._id);

    if (planIds.length > 0) {
      await PaymentPhase.deleteMany({ paymentPlan: { $in: planIds } });
      await PaymentHistory.deleteMany({ project: id });
      await PaymentPlan.deleteMany({ project: id });
    }

    // Cascade: delete roadmap
    await Roadmap.deleteMany({ project: id });

    // Cascade: delete comments
    await ProjectComment.deleteMany({ project: id });

    await Project.findByIdAndDelete(id);

    res.json({ success: true, message: 'Project and related data deleted successfully.' });
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
      .populate('assignedClients', 'name email phone status clientCode')
      .populate('assignedStaff', 'name email status employeeCode');

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
