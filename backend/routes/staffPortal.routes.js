/**
 * Staff Portal Routes
 * All routes are protected by authMiddleware and roleMiddleware(['staff']).
 * Staff can only access projects assigned to them.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  getStaffDashboardStats,
  getStaffRecentProjects,
  getStaffProjects,
  getStaffProjectById,
  addProjectUpdate,
  getProjectUpdates,
  addStaffUpdateReply
} = require('../controllers/staffPortal.controller');

// Apply auth and role middleware to all staff routes
router.use(authMiddleware);
router.use(roleMiddleware(['staff']));

// Dashboard endpoints
router.get('/dashboard/stats', getStaffDashboardStats);
router.get('/dashboard/recent-projects', getStaffRecentProjects);

// Project endpoints
router.get('/projects', getStaffProjects);
router.get('/projects/:id', getStaffProjectById);
router.get('/projects/:id/updates', getProjectUpdates);
router.post('/projects/:id/update', addProjectUpdate);
router.post('/projects/:id/updates/:updateId/reply', addStaffUpdateReply);

module.exports = router;
