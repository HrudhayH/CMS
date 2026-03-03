const express = require('express');
const router = express.Router();
const { adminLogin, staffLogin } = require('../controllers/auth.controller');
const { clientLogin } = require('../controllers/clientPortal.controller');

router.post('/admin/login', adminLogin);
router.post('/staff/login', staffLogin);
router.post('/client/login', clientLogin);

module.exports = router;
