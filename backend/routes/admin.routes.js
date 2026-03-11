const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const checkPermission = require('../middlewares/checkPermission');
const { PERMISSIONS } = require('../config/permissions');
const clientRoutes = require('./client.routes');
const staffRoutes = require('./staff.routes');
const projectRoutes = require('./project.routes');
const dashboardRoutes = require('./dashboard.routes');
const paymentRoutes = require('./payment.routes');
const {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminPermissions,
  updateAdminPermissions
} = require('../controllers/admin.controller');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.use('/dashboard', checkPermission(PERMISSIONS.VIEW_DASHBOARD), dashboardRoutes);
router.use('/projects', checkPermission(PERMISSIONS.MANAGE_PROJECTS), projectRoutes);
router.use('/clients', checkPermission(PERMISSIONS.MANAGE_CLIENTS), clientRoutes);
router.use('/staff', checkPermission(PERMISSIONS.MANAGE_STAFF), staffRoutes);
router.use('/payments', checkPermission(PERMISSIONS.MANAGE_PAYMENTS), paymentRoutes);

// Admin management routes (super_admin only)
router.get('/admins', roleMiddleware(['super_admin']), getAdmins);
router.get('/admins/:id', roleMiddleware(['super_admin']), getAdminById);
router.post('/admins', roleMiddleware(['super_admin']), createAdmin);
router.put('/admins/:id', roleMiddleware(['super_admin']), updateAdmin);
router.delete('/admins/:id', roleMiddleware(['super_admin']), deleteAdmin);

// Dedicated permission management endpoints (super_admin only)
router.get('/admins/:id/permissions', roleMiddleware(['super_admin']), getAdminPermissions);
router.patch('/admins/:id/permissions', roleMiddleware(['super_admin']), updateAdminPermissions);

module.exports = router;
