const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} = require('../controllers/opportunityController');

const router = express.Router();

// Public routes
router.get('/', getAllOpportunities);
router.get('/:id', getOpportunityById);

// Admin only routes
router.post('/', protect, authorize('ADMIN'), createOpportunity);
router.put('/:id', protect, authorize('ADMIN'), updateOpportunity);
router.delete('/:id', protect, authorize('ADMIN'), deleteOpportunity);

module.exports = router;
