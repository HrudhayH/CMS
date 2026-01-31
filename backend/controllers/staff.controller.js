const Staff = require('../models/Staff');

const createStaff = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ success: false, message: 'Staff with this email already exists.' });
    }

    const staff = await Staff.create({ name, email });
    res.status(201).json({ success: true, message: 'Staff created.', data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const staff = await Staff.findByIdAndUpdate(
      id,
      { name, email },
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }

    res.json({ success: true, message: 'Staff updated.', data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findByIdAndDelete(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }

    res.json({ success: true, message: 'Staff deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Paused', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use Active, Paused, or Completed.' });
    }

    const staff = await Staff.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }

    res.json({ success: true, message: 'Staff status updated.', data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { createStaff, updateStaff, deleteStaff, updateStaffStatus, getAllStaff };
