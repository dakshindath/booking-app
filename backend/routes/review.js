const express = require('express');
const { auth } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// Create a review
router.post('/review', auth, reviewController.createReview);

// Get all reviews for a listing
router.get('/reviews/listing/:listingId', reviewController.getListingReviews);

// Get all reviews by a user
router.get('/reviews/user/:userId', auth, reviewController.getUserReviews);

// Update a review
router.put('/review/:id', auth, reviewController.updateReview);

// Delete a review
router.delete('/review/:id', auth, reviewController.deleteReview);

module.exports = router;
