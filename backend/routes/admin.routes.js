const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const clientRoutes = require('./client.routes');
const staffRoutes = require('./staff.routes');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.use('/clients', clientRoutes);
router.use('/staff', staffRoutes);

module.exports = router;
