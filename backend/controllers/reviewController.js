const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const mongoose = require('mongoose');

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    
    // Verify the booking exists and belongs to the current user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    if (booking.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }
    
    // Check if booking is completed (can only review completed stays)
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed stays' });
    }
    
    // Check if review already exists for this booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists for this booking' });
    }
    
    // Create the review
    const review = new Review({
      user: req.user.id,
      listing: booking.listing,
      booking: bookingId,
      rating,
      comment
    });
    
    await review.save();
    
    // Update the listing average rating
    await updateListingRating(booking.listing);
    
    res.status(201).json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reviews for a listing
exports.getListingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
      
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get reviews by user
exports.getUserReviews = async (req, res) => {
  try {
    if (req.user.id !== req.params.userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const reviews = await Review.find({ user: req.params.userId })
      .populate('listing', 'title images')
      .sort({ createdAt: -1 });
      
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Find the review and check if it belongs to the user
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }
    
    // Update the review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    
    await review.save();
    
    // Update the listing average rating
    await updateListingRating(review.listing);
    
    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    // Find the review and check if it belongs to the user
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.user.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    const listingId = review.listing;
    
    await review.deleteOne();
    
    // Update the listing average rating
    await updateListingRating(listingId);
    
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update listing rating
async function updateListingRating(listingId) {
  try {
    const result = await Review.aggregate([
      { $match: { listing: new mongoose.Types.ObjectId(listingId) } },
      { 
        $group: { 
          _id: '$listing', 
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    if (result.length > 0) {
      await Listing.findByIdAndUpdate(listingId, { 
        avgRating: parseFloat(result[0].avgRating.toFixed(1)),
        reviewsCount: result[0].count
      });
    } else {
      // No reviews left, reset rating
      await Listing.findByIdAndUpdate(listingId, { 
        avgRating: 0,
        reviewsCount: 0
      });
    }
  } catch (err) {
    console.error('Error updating listing rating:', err);
    throw err;
  }
}
