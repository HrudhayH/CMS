const Project = require('../models/Project');
const Client = require('../models/Client');
const Staff = require('../models/Staff');
const PaymentHistory = require('../models/PaymentHistory');
const PaymentPhase = require('../models/PaymentPhase');

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run all queries in parallel for efficiency
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalClients,
      totalStaff,
      revenueData,
      pendingPaymentsCount
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: { $in: ['New', 'In Progress'] } }),
      Project.countDocuments({ status: 'Completed' }),
      Client.countDocuments(),
      Staff.countDocuments(),
      PaymentHistory.aggregate([
        { 
          $match: { 
            type: 'PAYMENT', 
            paidDate: { $gte: firstDayOfMonth } 
          } 
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$amount' } 
          } 
        }
      ]),
      PaymentPhase.countDocuments({ status: 'PENDING' })
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalClients,
        totalStaff,
        monthlyRevenue: revenueData.length > 0 ? revenueData[0].total : 0,
        pendingPayments: pendingPaymentsCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { getDashboardStats };
