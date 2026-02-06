const jwt = require('jsonwebtoken');
const Client = require('../models/Client');
const Project = require('../models/Project');
const PaymentPlan = require('../models/PaymentPlan');
const PaymentPhase = require('../models/PaymentPhase');
const PaymentHistory = require('../models/PaymentHistory');

// Client login
const clientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const client = await Client.findOne({ email }).select('+password');
    if (!client) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (client.status !== 'Active') {
      return res.status(403).json({ success: false, message: 'Account is not active.' });
    }

    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: client._id, email: client.email, name: client.name, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: client._id, name: client.name, email: client.email, role: 'client' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get client dashboard stats
const getClientDashboardStats = async (req, res) => {
  try {
    const clientId = req.user.id;

    const projects = await Project.find({ assignedClients: clientId });
    const projectIds = projects.map(p => p._id);

    const stats = {
      totalProjects: projects.length,
      inProgress: projects.filter(p => p.status === 'In Progress').length,
      completed: projects.filter(p => p.status === 'Completed').length,
      onHold: projects.filter(p => p.status === 'On Hold').length
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get client projects (paginated)
const getClientProjects = async (req, res) => {
  try {
    const clientId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find({ assignedClients: clientId })
        .populate('assignedStaff', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments({ assignedClients: clientId })
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get client project by ID
const getClientProject = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { id } = req.params;

    const project = await Project.findOne({ _id: id, assignedClients: clientId })
      .populate('assignedStaff', 'name email');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get client project updates
const getClientProjectUpdates = async (req, res) => {
  try {
    const clientId = req.user.id;
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const project = await Project.findOne({ _id: id, assignedClients: clientId });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const updates = project.dailyUpdates || [];
    const sortedUpdates = updates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = sortedUpdates.length;
    const paginatedUpdates = sortedUpdates.slice((page - 1) * limit, page * limit);

    res.json({
      success: true,
      data: paginatedUpdates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get all updates for client's projects
const getClientAllUpdates = async (req, res) => {
  try {
    const clientId = req.user.id;

    const projects = await Project.find({ assignedClients: clientId })
      .populate('assignedStaff', 'name')
      .lean();

    const allUpdates = projects.flatMap(project =>
      (project.dailyUpdates || []).map(update => ({
        ...update,
        projectId: project._id,
        projectTitle: project.title
      }))
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, data: allUpdates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get client payment summary
const getClientPaymentSummary = async (req, res) => {
  try {
    const clientId = req.user.id;

    const plans = await PaymentPlan.find({ client: clientId })
      .populate('project', 'title')
      .lean({ virtuals: true });

    // Get phases for each plan
    const plansWithPhases = await Promise.all(
      plans.map(async (plan) => {
        if (plan.paymentType === 'PHASE_WISE') {
          const phases = await PaymentPhase.find({ paymentPlan: plan._id }).sort({ createdAt: 1 }).lean();
          return { ...plan, phases };
        }
        return { ...plan, phases: [] };
      })
    );

    res.json({ success: true, data: plansWithPhases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get client payment history (paginated)
const getClientPaymentHistory = async (req, res) => {
  try {
    const clientId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      PaymentHistory.find({ client: clientId })
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentHistory.countDocuments({ client: clientId })
    ]);

    res.json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = {
  clientLogin,
  getClientDashboardStats,
  getClientProjects,
  getClientProject,
  getClientProjectUpdates,
  getClientAllUpdates,
  getClientPaymentSummary,
  getClientPaymentHistory
};
