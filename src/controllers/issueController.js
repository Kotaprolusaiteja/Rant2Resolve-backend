
const Issue = require('../models/Issue_Supabase');
const { createNotification } = require('./notificationController');
const { getIO } = require('../config/io');

exports.createIssue = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const issue = await Issue.create({
      title,
      description,
      category,
      student_id: req.user.id,
      student_name: req.user.name || 'Anonymous'
    });

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIssues = async (req, res) => {
  try {
    let issues;
    if (req.user.role !== 'ADMIN') {
      issues = await Issue.findByStudentId(req.user.id);
    } else {
      issues = await Issue.findAll();
    }

    res.status(200).json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    // Check access
    if (req.user.role !== 'ADMIN' && issue.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this issue' });
    }

    res.status(200).json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const newReply = {
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      content,
      timestamp: new Date().toISOString()
    };

    const updatedIssue = await Issue.addReply(req.params.id, newReply);

    res.status(200).json({ success: true, data: updatedIssue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    // Find and update issue
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const previousStatus = issue.status;

    // Update status
    const updatedIssue = await Issue.update(req.params.id, { status });

    // Send notification if status changed to RESOLVED
    if (status === 'RESOLVED' && previousStatus !== 'RESOLVED') {
      try {
        const notification = await createNotification(
          issue.student_id,
          'Issue Resolved',
          `Your issue "${issue.title}" has been resolved.`,
          'ISSUE_RESOLVED',
          issue.id
        );

        // Emit socket event to notify student in real-time
        const io = getIO();
        if (io) {
          console.log(`🔔 Sending notification to user: ${issue.student_id}`);
          io.to(`user_notifications_${issue.student_id}`).emit('new_notification', {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            isRead: notification.is_read,
            createdAt: notification.created_at
          });
        } else {
          console.warn('⚠️ Socket.io instance not available');
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification creation fails
      }
    }

    res.status(200).json({ success: true, data: updatedIssue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

