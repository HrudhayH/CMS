const Project = require('../models/Project');
const Client = require('../models/Client');
const Staff = require('../models/Staff');

const getDashboardStats = async (req, res) => {
  try {
    // Run all queries in parallel for efficiency
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalClients,
      totalStaff
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ['New', 'In Progress'] } }),
      Project.countDocuments({ status: 'Completed' }),
      Client.countDocuments(),
      Staff.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalClients,
        totalStaff
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { getDashboardStats };
