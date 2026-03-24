
const express = require('express');
const router = express.Router();
const { 
  createIssue, 
  getIssues, 
  getIssueById, 
  addReply, 
  updateStatus 
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getIssues)
  .post(authorize('STUDENT'), createIssue);

router.route('/:id')
  .get(getIssueById);

router.post('/:id/replies', addReply);

router.patch('/:id/status', authorize('ADMIN'), updateStatus);

module.exports = router;
