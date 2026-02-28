const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  upload,
  uploadProfileImage,
  deleteProfileImage,
} = require('../controllers/profileImage.controller');

// All routes require a valid JWT (any role: admin, super_admin, staff, client)
router.use(authMiddleware);

/**
 * POST /api/users/profile-image
 * Upload profile image for the authenticated user.
 * - userId is always taken from req.user.id (JWT) — never from params
 * - Returns 400 if image already exists (must delete first)
 */
router.post('/', (req, res, next) => {
  upload.single('profileImage')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
}, uploadProfileImage);

/**
 * DELETE /api/users/profile-image
 * Delete the authenticated user's own profile image.
 * - Ownership enforced via stored path prefix matching userId
 */
router.delete('/', deleteProfileImage);

module.exports = router;
