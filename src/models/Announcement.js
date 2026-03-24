const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['URGENT', 'INFO', 'EVENT'],
      required: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

announcementSchema.index({ publishDate: -1 });
announcementSchema.index({ category: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
