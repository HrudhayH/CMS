const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const {
  addProjectComment,
  getProjectComments,
  updateCommentStatus,
  deleteProjectComment
} = require('../controllers/projectComment.controller');

// GET /projects/:id/comments - Get all comments for a project
router.get('/projects/:id/comments', authMiddleware, getProjectComments);

// POST /projects/:id/comments - Add a new comment
router.post('/projects/:id/comments', authMiddleware, addProjectComment);

// PATCH /comments/:commentId/status - Update comment status
router.patch('/comments/:commentId/status', authMiddleware, updateCommentStatus);

// DELETE /comments/:commentId - Delete a comment
router.delete('/comments/:commentId', authMiddleware, deleteProjectComment);

module.exports = router;
