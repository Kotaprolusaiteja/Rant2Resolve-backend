const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  message: { type: String, required: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'ADMIN'], required: true },
  timestamp: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }], // Array of user IDs who liked this message
  createdAt: { type: Date, default: Date.now, index: true }
});

// Index for efficient sorting by timestamp
chatMessageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
