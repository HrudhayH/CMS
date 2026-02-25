const Staff = require('../models/Staff');
const Project = require('../models/Project');
const Counter = require('../models/Counter');
const Roadmap = require('../models/Roadmap');
const ProjectComment = require('../models/ProjectComment');
const generatePassword = require('../utils/generatePassword');

const createStaff = async (req, res) => {
  try {
    const { name, email, phone, password, role, department } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ success: false, message: 'Staff with this email already exists.' });
    }

    // Use provided password or generate one
    const staffPassword = password || generatePassword();

    // Generate employeeCode
    const seq = await Counter.getNextSequence('staff');
    const employeeCode = `STF-${String(seq).padStart(4, '0')}`;

    const staff = await Staff.create({
      employeeCode,
      name,
      email,
      phone,
      password: staffPassword,
      role: role || '',
      department: department || ''
    });

    // Return staff without password
    const staffResponse = {
      _id: staff._id,
      employeeCode: staff.employeeCode,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      department: staff.department,
      status: staff.status,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      generatedPassword: !password ? staffPassword : undefined
    };

    res.status(201).json({ success: true, message: 'Staff created.', data: staffResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, department } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role !== undefined) updateData.role = role;
    if (department !== undefined) updateData.department = department;

    const staff = await Staff.findByIdAndUpdate(
      id,
      updateData,
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

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }

    // Cascade: remove staff from assigned projects
    await Project.updateMany(
      { assignedStaff: id },
      { $pull: { assignedStaff: id } }
    );

    // Cascade: delete staff's comments
    await ProjectComment.deleteMany({ sender: id, senderModel: 'Staff' });

    await Staff.findByIdAndDelete(id);

    res.json({ success: true, message: 'Staff and related data deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Use Active or Inactive.' });
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

// Get staff with pagination, search, and filters
const getStaff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search, status, role, department } = req.query;

    // Build query conditions
    const query = {};

    // Search across name, email, employeeCode
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { employeeCode: searchRegex }
      ];
    }

    // Filter by status
    if (status && ['Active', 'Inactive'].includes(status)) {
      query.status = status;
    }

    // Filter by role (partial match)
    if (role && role.trim()) {
      query.role = new RegExp(role.trim(), 'i');
    }

    // Filter by department (partial match)
    if (department && department.trim()) {
      query.department = new RegExp(department.trim(), 'i');
    }

    const [staff, total] = await Promise.all([
      Staff.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Staff.countDocuments(query)
    ]);

    // Fetch assigned project counts for these staff members
    const staffIds = staff.map(s => s._id);
    const projectCounts = await Project.aggregate([
      { $match: { assignedStaff: { $in: staffIds } } },
      { $unwind: '$assignedStaff' },
      { $match: { assignedStaff: { $in: staffIds } } },
      { $group: { _id: '$assignedStaff', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    projectCounts.forEach(pc => { countMap[pc._id.toString()] = pc.count; });

    const staffWithCounts = staff.map(s => ({
      ...s,
      projectCount: countMap[s._id.toString()] || 0
    }));

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: staffWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get all staff without pagination (for dropdowns)
const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ name: 1 }).lean();
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get single staff member by ID with assigned projects
const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id).lean();
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found.' });
    }

    const projects = await Project.find({ assignedStaff: id })
      .populate('assignedClients', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        staff,
        projects
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { createStaff, updateStaff, deleteStaff, updateStaffStatus, getStaff, getAllStaff, getStaffById };
