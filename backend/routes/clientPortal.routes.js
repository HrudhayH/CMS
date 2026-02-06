const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  getClientDashboardStats,
  getClientProjects,
  getClientProject,
  getClientProjectUpdates,
  getClientAllUpdates,
  getClientPaymentSummary,
  getClientPaymentHistory,
  addClientUpdateReply
} = require('../controllers/clientPortal.controller');

// All routes protected by auth + client role
router.use(authMiddleware);
router.use(roleMiddleware(['client']));

// Dashboard
router.get('/dashboard/stats', getClientDashboardStats);

// Projects
router.get('/projects', getClientProjects);
router.get('/projects/:id', getClientProject);
router.get('/projects/:id/updates', getClientProjectUpdates);
router.post('/projects/:id/updates/:updateId/reply', addClientUpdateReply);

// Updates
router.get('/updates/all', getClientAllUpdates);

// Payments
router.get('/payments/summary', getClientPaymentSummary);
router.get('/payments/history', getClientPaymentHistory);

module.exports = router;
