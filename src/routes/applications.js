const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  applyForOpportunity,
  getStudentApplications,
  getAllApplications,
  updateApplicationStatus,
  deleteApplication,
  checkApplicationStatus,
} = require('../controllers/applicationController');

const router = express.Router();

// Student routes
router.post('/:opportunityId/apply', protect, authorize('STUDENT'), applyForOpportunity);
router.get('/student/my-applications', protect, authorize('STUDENT'), getStudentApplications);
router.get('/opportunity/:opportunityId/status', protect, authorize('STUDENT'), checkApplicationStatus);

// Admin routes
router.get('/', protect, authorize('ADMIN'), getAllApplications);
router.patch('/:id/status', protect, authorize('ADMIN'), updateApplicationStatus);
router.delete('/:id', protect, authorize('ADMIN'), deleteApplication);

module.exports = router;
