const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addReview,
  getReviews,
  deleteReview
} = require('../controllers/reviewController');

// Javne rute
router.get('/:playroomId', getReviews);

// Privatne rute
router.post('/:playroomId', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;