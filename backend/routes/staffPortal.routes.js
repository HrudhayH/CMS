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
  getStaffProfile,
  getStaffDashboardStats,
  getStaffRecentProjects,
  getStaffProjects,
  getStaffProjectById,
  addProjectUpdate,
  getProjectUpdates,
  addStaffUpdateReply,
  updateDeploymentLinks
} = require('../controllers/staffPortal.controller');
const {
  getRoadmap,
  createRoadmap,
  addPhase,
  updatePhase,
  addMilestone,
  updateMilestone,
  deletePhase
} = require('../controllers/roadmap.controller');

// Apply auth and role middleware to all staff routes
router.use(authMiddleware);
router.use(roleMiddleware(['staff']));

// Profile endpoint
router.get('/profile', getStaffProfile);

// Dashboard endpoints
router.get('/dashboard/stats', getStaffDashboardStats);
router.get('/dashboard/recent-projects', getStaffRecentProjects);

// Project endpoints
router.get('/projects', getStaffProjects);
router.get('/projects/:id', getStaffProjectById);
router.get('/projects/:id/updates', getProjectUpdates);
router.post('/projects/:id/update', addProjectUpdate);
router.put('/projects/:id/deployment-links', updateDeploymentLinks);
router.post('/projects/:id/updates/:updateId/reply', addStaffUpdateReply);

// Roadmap Endpoints
router.get('/projects/:id/roadmap', getRoadmap);
router.post('/projects/:id/roadmap', createRoadmap);
router.post('/projects/:id/roadmap/phases', addPhase);
router.put('/projects/:id/roadmap/phases/:phaseId', updatePhase);
router.delete('/projects/:id/roadmap/phases/:phaseId', deletePhase);
router.post('/projects/:id/roadmap/phases/:phaseId/milestones', addMilestone);
router.put('/projects/:id/roadmap/phases/:phaseId/milestones/:milestoneId', updateMilestone);

module.exports = router;
