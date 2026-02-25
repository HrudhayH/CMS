const ProjectComment = require('../models/ProjectComment');
const Project = require('../models/Project');

// Add comment to project
exports.addProjectComment = async (req, res) => {
  try {
    const { id } = req.params; // Project ID
    const { message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role; // 'client' or 'staff'

    // Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // Verify user has access to this project
    let isAuthorized = false;
    if (userRole === 'client') {
      const project = await Project.findOne({ _id: id, assignedClients: userId });
      isAuthorized = !!project;
    } else if (userRole === 'staff') {
      const project = await Project.findOne({ _id: id, assignedStaff: userId });
      isAuthorized = !!project;
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Get sender name
    let senderName = '';
    let senderModel = '';
    if (userRole === 'client') {
      const Client = require('../models/Client');
      const client = await Client.findById(userId).select('name');
      senderName = client?.name || 'Unknown Client';
      senderModel = 'Client';
    } else if (userRole === 'staff') {
      const Staff = require('../models/Staff');
      const staff = await Staff.findById(userId).select('name');
      senderName = staff?.name || 'Unknown Staff';
      senderModel = 'Staff';
    }

    // Create comment
    const comment = new ProjectComment({
      project: id,
      sender: userId,
      senderModel,
      senderName,
      message: message.trim(),
      status: 'Open'
    });

    await comment.save();

    // Populate sender details for response
    await comment.populate('sender', 'name email');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully.',
      data: comment
    });
  } catch (error) {
    console.error('[addProjectComment] Error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get all comments for a project
exports.getProjectComments = async (req, res) => {
  try {
    const { id } = req.params; // Project ID
    const userId = req.user.id;
    const userRole = req.user.role;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Verify user has access to this project
    let isAuthorized = false;
    if (userRole === 'client') {
      const project = await Project.findOne({ _id: id, assignedClients: userId });
      isAuthorized = !!project;
    } else if (userRole === 'staff') {
      const project = await Project.findOne({ _id: id, assignedStaff: userId });
      isAuthorized = !!project;
    }

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Fetch comments
    const [comments, total] = await Promise.all([
      ProjectComment.find({ project: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'name email')
        .lean(),
      ProjectComment.countDocuments({ project: id })
    ]);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[getProjectComments] Error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Update comment status
exports.updateCommentStatus = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    if (!['Open', 'Responded', 'Closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const comment = await ProjectComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    // Only staff can update comment status
    if (req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Only staff can update comment status.' });
    }

    // Verify staff has access to the project
    const project = await Project.findOne({ _id: comment.project, assignedStaff: userId });
    if (!project) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    comment.status = status;
    await comment.save();

    res.json({
      success: true,
      message: 'Comment status updated.',
      data: comment
    });
  } catch (error) {
    console.error('[updateCommentStatus] Error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Delete comment (only by sender or admin)
exports.deleteProjectComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await ProjectComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    // Only sender or staff can delete
    if (comment.sender.toString() !== userId && req.user.role !== 'staff') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment.' });
    }

    await ProjectComment.findByIdAndDelete(commentId);

    res.json({
      success: true,
      message: 'Comment deleted successfully.'
    });
  } catch (error) {
    console.error('[deleteProjectComment] Error:', error);
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};
