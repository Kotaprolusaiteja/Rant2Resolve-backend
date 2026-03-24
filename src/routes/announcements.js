const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createAnnouncement,
  getAllAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

const router = express.Router();

// Public routes
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Admin only routes
router.post('/', protect, authorize('ADMIN'), createAnnouncement);
router.put('/:id', protect, authorize('ADMIN'), updateAnnouncement);
router.delete('/:id', protect, authorize('ADMIN'), deleteAnnouncement);

module.exports = router;
