
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userRole: String,
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['MEDICAL', 'ACADEMIC', 'HOSTEL', 'FINANCE', 'TECHNICAL', 'OTHERS'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'CANCELLED'], 
    default: 'OPEN' 
  },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: String,
  reactions: { type: Number, default: 0 },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);
