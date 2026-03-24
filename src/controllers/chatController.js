const ChatMessage = require('../models/ChatMessage_Supabase');

// Save a new message
exports.saveMessage = async (req, res) => {
  try {
    const { message, senderId, senderName, role } = req.body;

    if (!message || !senderId || !senderName || !role) {
      return res.status(400).json({
        success: false,
        message: 'All fields (message, senderId, senderName, role) are required'
      });
    }

    const newMessage = await ChatMessage.create({
      message,
      sender_id: senderId,
      sender_name: senderName,
      role,
      likes: 0,
      liked_by: []
    });

    res.status(201).json({
      success: true,
      message: 'Message saved successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving message',
      error: error.message
    });
  }
};

// Get all messages with pagination (latest first)
exports.getMessages = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const messages = await ChatMessage.findAll(parseInt(limit), parseInt(skip));

    // Reverse to show chronological order (oldest to newest)
    const orderedMessages = messages.reverse();

    // For total count, we can use the length of messages as approximation
    // or implement a separate count method if needed
    const totalCount = messages.length + parseInt(skip);

    res.status(200).json({
      success: true,
      data: orderedMessages,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching messages',
      error: error.message 
    });
  }
};

// Like or unlike a message
exports.likeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required' 
      });
    }

    // Find the message
    const message = await ChatMessage.findById(id);
    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    // Check if user already liked
    const alreadyLiked = message.likedBy.includes(userId);

    if (alreadyLiked) {
      // Unlike: remove userId from likedBy
      message.likedBy = message.likedBy.filter(id => id !== userId);
      message.likes = Math.max(0, message.likes - 1);
    } else {
      // Like: add userId to likedBy
      message.likedBy.push(userId);
      message.likes += 1;
    }

    await message.save();

    res.status(200).json({ 
      success: true, 
      data: {
        messageId: message._id,
        likes: message.likes,
        liked: !alreadyLiked,
        likedBy: message.likedBy
      }
    });
  } catch (error) {
    console.error('Error liking message:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error liking message',
      error: error.message 
    });
  }
};

// Clear all messages (for testing/admin purposes)
exports.clearMessages = async (req, res) => {
  try {
    await ChatMessage.deleteMany({});
    res.status(200).json({ 
      success: true, 
      message: 'All messages cleared' 
    });
  } catch (error) {
    console.error('Error clearing messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error clearing messages',
      error: error.message 
    });
  }
};
