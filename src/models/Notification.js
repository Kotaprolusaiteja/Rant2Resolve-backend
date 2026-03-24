const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['ISSUE_RESOLVED', 'APPLICATION_STATUS', 'ANNOUNCEMENT', 'OTHER'],
    default: 'OTHER'
  },
  relatedId: { 
    type: mongoose.Schema.Types.ObjectId,
    description: 'Reference to the issue, application, or announcement'
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  readAt: { 
    type: Date,
    default: null
  }
});

// Index for faster queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
