const Admin = require('../models/Admin');
const { ALL_PERMISSIONS } = require('../config/permissions');

// Get all admins (super_admin only)
const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get single admin by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id).select('-password').lean();
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Create admin (super_admin only)
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists.' });
    }

    // Only super_admin can create another super_admin
    const adminRole = role === 'super_admin' && req.user.role === 'super_admin' ? 'super_admin' : 'admin';

    // Validate and filter permissions
    const validPermissions = Array.isArray(permissions)
      ? permissions.filter(p => ALL_PERMISSIONS.includes(p))
      : [];

    const admin = await Admin.create({
      name: name || '',
      email,
      password,
      role: adminRole,
      permissions: adminRole === 'super_admin' ? [] : validPermissions
    });

    const adminResponse = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };

    res.status(201).json({ success: true, message: 'Admin created.', data: adminResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Update admin (super_admin only)
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, permissions } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    // Prevent demoting yourself
    if (id === req.user.id && role && role !== admin.role) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    if (name !== undefined) admin.name = name;
    if (email !== undefined) admin.email = email;
    if (password) admin.password = password; // Will be hashed by pre-save hook
    if (role && req.user.role === 'super_admin') admin.role = role;

    // Update permissions (validate against allowed list)
    if (permissions !== undefined) {
      const validPermissions = Array.isArray(permissions)
        ? permissions.filter(p => ALL_PERMISSIONS.includes(p))
        : [];
      admin.permissions = admin.role === 'super_admin' ? [] : validPermissions;
    }

    await admin.save();

    const adminResponse = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt
    };

    res.json({ success: true, message: 'Admin updated.', data: adminResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get permissions for a single admin (super_admin only)
const getAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id).select('role permissions').lean();
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    res.json({ success: true, data: { role: admin.role, permissions: admin.permissions || [] } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Update permissions only for an admin (super_admin only)
const updateAdminPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'permissions must be an array.' });
    }

    const admin = await Admin.findById(id).select('role permissions');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    // Prevent modifying a super_admin's permissions
    if (admin.role === 'super_admin') {
      return res.status(400).json({ success: false, message: 'Super Admins have full access — their permissions cannot be modified.' });
    }

    // Validate each permission against the allowed list
    const validPermissions = permissions.filter(p => ALL_PERMISSIONS.includes(p));

    admin.permissions = validPermissions;
    await admin.save();

    res.json({ success: true, message: 'Permissions updated.', data: { permissions: admin.permissions } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Delete admin (super_admin only)
const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself.' });
    }

    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    res.json({ success: true, message: 'Admin deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { getAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, getAdminPermissions, updateAdminPermissions };
