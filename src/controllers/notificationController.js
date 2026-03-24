const Notification = require('../models/Notification_Supabase');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`📨 Fetching notifications for user: ${userId}`);
    const notifications = await Notification.findByUserId(userId, 50);

    console.log(`✅ Found ${notifications.length} notifications`);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadNotifications = await Notification.findUnread(userId);
    const count = unreadNotifications.length;

    res.status(200).json({ success: true, unreadCount: count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.markAsRead(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedNotifications = await Notification.markAllAsRead(userId);

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // First check if notification exists and belongs to user
    const notification = await Notification.findById(notificationId);
    if (!notification || notification.user_id !== userId) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.delete(notificationId);

    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// Create a notification (internal use only)
exports.createNotification = async (userId, title, message, type, relatedId = null) => {
  try {
    console.log(`✉️  Creating notification for user ${userId}:`, { title, message, type });
    const notification = await Notification.create({
      user_id: userId,
      title,
      message,
      type,
      related_id: relatedId,
      is_read: false
    });
    console.log(`✅ Notification created:`, notification.id);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};
