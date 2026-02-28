const multer = require('multer');
const path = require('path');
const { supabaseAdmin, BUCKET } = require('../utils/supabase');
const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const Client = require('../models/Client');

// ============================================================
// Multer — memory storage, 2MB limit, image types only
// ============================================================
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter,
});

// ============================================================
// Helper — resolve the correct Mongoose model from JWT role
// ============================================================
function resolveModel(role) {
  if (role === 'admin' || role === 'super_admin') return Admin;
  if (role === 'staff') return Staff;
  if (role === 'client') return Client;
  return null;
}

// ============================================================
// POST /api/users/profile-image
// Upload a new profile image (no overwrite — must delete first)
// ============================================================
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const userId = req.user.id;
    const role = req.user.role;

    const Model = resolveModel(role);
    if (!Model) {
      return res.status(403).json({ success: false, message: 'Unknown user role.' });
    }

    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent overwrite — must delete existing image first
    if (user.profileImagePath) {
      return res.status(400).json({
        success: false,
        message: 'Delete existing image before uploading a new one.',
      });
    }

    // Build storage path: profile-images/<userId>/profile.<ext>
    const ext = req.file.mimetype.split('/')[1]; // jpeg | png | webp
    const storagePath = `profile-images/${userId}/profile.${ext}`;

    // Upload to Supabase — upsert: false enforces no overwrite at storage level too
    const { error: uploadError } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('[Supabase Upload Error]', uploadError.message);
      return res.status(500).json({ success: false, message: 'Failed to upload image to storage.' });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Persist path and URL in DB
    user.profileImageUrl = publicUrl;
    user.profileImagePath = storagePath;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully.',
      profileImageUrl: publicUrl,
      profileImagePath: storagePath,
    });
  } catch (err) {
    console.error('[uploadProfileImage]', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};

// ============================================================
// DELETE /api/users/profile-image
// Delete the authenticated user's own profile image
// ============================================================
const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const Model = resolveModel(role);
    if (!Model) {
      return res.status(403).json({ success: false, message: 'Unknown user role.' });
    }

    const user = await Model.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.profileImagePath) {
      return res.status(400).json({ success: false, message: 'No profile image to delete.' });
    }

    // Enforce ownership — the stored path must belong to this userId's folder
    if (!user.profileImagePath.startsWith(`profile-images/${userId}/`)) {
      return res.status(403).json({ success: false, message: 'Access denied. Not your image.' });
    }

    // Delete from Supabase
    const { error: deleteError } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([user.profileImagePath]);

    if (deleteError) {
      console.error('[Supabase Delete Error]', deleteError.message);
      return res.status(500).json({ success: false, message: 'Failed to delete image from storage.' });
    }

    // Clear DB fields
    user.profileImageUrl = null;
    user.profileImagePath = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile image deleted successfully.',
    });
  } catch (err) {
    console.error('[deleteProfileImage]', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
};

module.exports = { upload, uploadProfileImage, deleteProfileImage };
