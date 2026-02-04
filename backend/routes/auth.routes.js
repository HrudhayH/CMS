const express = require('express');
const router = express.Router();
const { adminLogin, staffLogin } = require('../controllers/auth.controller');

router.post('/admin/login', adminLogin);
router.post('/staff/login', staffLogin);

module.exports = router;
