import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

const API_URL = 'http://localhost:5000/api';

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsProps {
  listingId: string;
}

const StarRating = ({ rating }: { rating: number }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg 
        key={i} 
        className={`w-4 h-4 ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`} 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  }
  return <div className="flex">{stars}</div>;
};

const Reviews: React.FC<ReviewsProps> = ({ listingId }) => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [userBookings, setUserBookings] = useState<any[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Fetch reviews for this listing
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_URL}/reviews/listing/${listingId}`);
        setReviews(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
        setLoading(false);
      }
    };

    fetchReviews();
  }, [listingId]);

  // If user is logged in, check if they have completed bookings for this listing
  useEffect(() => {
    if (user && token) {
      const fetchUserBookings = async () => {
        try {
          // Use the /booking endpoint which uses the token to identify the user
          const response = await axios.get(`${API_URL}/booking`, {
            headers: { Authorization: `Bearer ${token}` }
          });
            // Filter for completed bookings for this listing
          const completedBookingsForListing = response.data.filter(
            (booking: any) => 
              booking.listing && 
              booking.listing._id === listingId && 
              booking.status === 'completed'
          );
          
          setUserBookings(completedBookingsForListing);
        } catch (err) {
          console.error('Error fetching user bookings:', err);
        }
      };
      
      fetchUserBookings();
    }
  }, [user, token, listingId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    if (userBookings.length === 0) {
      setFormError('You can only review properties where you have completed a stay');
      return;
    }
    
    // Check if the user has already reviewed this property
    const userReview = reviews.find(review => review.user._id === user?.id);
    if (userReview) {
      setFormError('You have already submitted a review for this property');
      return;
    }
    
    try {
      // Find the first completed booking to use as the booking ID
      const bookingId = userBookings[0]._id;
      
      await axios.post(`${API_URL}/review`, 
        { 
          bookingId, 
          rating: userRating, 
          comment: userComment 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh reviews
      const response = await axios.get(`${API_URL}/reviews/listing/${listingId}`);
      setReviews(response.data);
      
      // Reset form
      setUserRating(5);
      setUserComment('');
      setShowReviewForm(false);
      setFormSuccess('Review submitted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setFormError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const renderRatingInput = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setUserRating(star)}
            className="focus:outline-none"
          >
            <svg 
              className={`w-8 h-8 ${star <= userRating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition-colors`}
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="mt-8 animate-pulse py-4">Loading reviews...</div>;
  }

  if (error) {
    return <div className="mt-8 text-red-500">{error}</div>;
  }

  return (
    <div className="mt-8 border-t border-staynest-gray-border pt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-staynest-dark-gray flex items-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
          {reviews.length > 0 ? (
            <>
              {(reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)} · {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </>
          ) : (
            'No reviews yet'
          )}
        </h3>
        
        {user && userBookings.length > 0 && !reviews.some(review => review.user._id === user.id) && (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-4 py-2 bg-staynest-pink text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Leave a Review
          </button>
        )}
      </div>
      
      {formSuccess && (
        <div className="bg-green-50 text-green-800 rounded-lg p-4 mb-6">
          {formSuccess}
        </div>
      )}
      
      {showReviewForm && (
        <div className="bg-staynest-background p-6 rounded-xl mb-8">
          <h4 className="text-lg font-medium mb-4">Share your experience</h4>
          
          {formError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-staynest-dark-gray mb-2">Rating</label>
              {renderRatingInput()}
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-staynest-dark-gray mb-2">
                Your Review
              </label>
              <textarea
                id="comment"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                className="w-full border border-staynest-gray-border rounded-lg p-3 min-h-[100px]"
                placeholder="Share the details of your experience at this property"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="px-4 py-2 border border-staynest-gray-border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-staynest-pink text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
      
      {reviews.length === 0 ? (
        <p className="text-staynest-light-gray py-4">No reviews yet. Be the first to leave a review!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review._id} className="border-b border-staynest-gray-border pb-4 last:border-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  {review.user.avatar ? (
                    <img
                      src={review.user.avatar}
                      alt={review.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-staynest-pink text-white flex items-center justify-center text-xl font-medium">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium text-staynest-dark-gray">{review.user.name}</h4>
                  <div className="text-sm text-staynest-light-gray mb-2">
                    {format(new Date(review.createdAt), 'MMMM yyyy')}
                  </div>
                  
                  <div className="mb-2">
                    <StarRating rating={review.rating} />
                  </div>
                  
                  <p className="text-staynest-dark-gray">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
