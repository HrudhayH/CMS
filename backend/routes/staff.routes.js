const express = require('express');
const router = express.Router();
const {
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  getStaff,
  getAllStaff,
  getStaffById
} = require('../controllers/staff.controller');

router.get('/', getStaff);
router.get('/all', getAllStaff);
router.get('/:id', getStaffById);
router.post('/', createStaff);
router.put('/:id', updateStaff);
router.delete('/:id', deleteStaff);
router.patch('/:id/status', updateStaffStatus);

module.exports = router;
