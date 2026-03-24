const express = require('express');
const { protect } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

const router = express.Router();

// Save a new message
router.post('/message', chatController.saveMessage);

// Get all messages
router.get('/messages', chatController.getMessages);

// Like or unlike a message (requires authentication)
router.post('/messages/:id/like', protect, chatController.likeMessage);

// Clear all messages (for testing/admin purposes)
router.delete('/clear', chatController.clearMessages);

module.exports = router;
