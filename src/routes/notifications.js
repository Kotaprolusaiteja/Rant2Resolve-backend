const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get unread count - MUST BE BEFORE :notificationId routes
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read - MUST BE BEFORE :notificationId routes
router.patch('/read-all', markAllAsRead);

// Get all notifications
router.get('/', getNotifications);

// Mark single notification as read
router.patch('/:notificationId/read', markAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

module.exports = router;
