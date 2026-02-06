const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const clientRoutes = require('./client.routes');
const staffRoutes = require('./staff.routes');
const projectRoutes = require('./project.routes');
const dashboardRoutes = require('./dashboard.routes');
const paymentRoutes = require('./payment.routes');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.use('/dashboard', dashboardRoutes);
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);
router.use('/staff', staffRoutes);
router.use('/payments', paymentRoutes);

module.exports = router;
