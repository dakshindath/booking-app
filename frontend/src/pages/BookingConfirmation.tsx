import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface BookingState {
  listingId: string;
  listingTitle: string;
  startDate: Date;
  endDate: Date;
  guests: number;
  totalPrice: number;
}

interface Listing {
  _id: string;
  title: string;
  images: string[];
  avgRating: number;
  reviewsCount: number;
}

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
    // Access the booking information passed from the listing details page
  const state = location.state as BookingState;
  
  // Fetch listing details to get image
  useEffect(() => {
    if (state && state.listingId) {
      const fetchListing = async () => {
        try {
          const response = await axios.get(`${API_URL}/listing/${state.listingId}`);
          setListing(response.data);
        } catch (err) {
          console.error('Error fetching listing details:', err);
        }
      };
      
      fetchListing();
    }
  }, [state]);
  
  if (!state || !state.listingId) {
    return (
      <div className="text-center p-8 font-staynest">
        <svg className="w-16 h-16 mx-auto text-staynest-pink mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xl mb-4 text-staynest-dark-gray">Booking information not found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-medium rounded-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  const { listingId, listingTitle, startDate, endDate, guests, totalPrice } = state;
    const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(
        `${API_URL}/booking`,
        {
          listingId,
          startDate,
          endDate,
          guests,
          totalPrice
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      navigate('/bookings', { state: { success: true, bookingId: response.data._id } });
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to complete booking. Please try again.');
      setLoading(false);
    }
  };
  
  const nights = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
  const serviceFee = Math.round(totalPrice * 0.15);
  const cleaningFee = 150;
  const totalWithFees = totalPrice + cleaningFee + serviceFee;
  
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-staynest font-staynest my-8">
      <h2 className="text-2xl font-semibold mb-8 text-staynest-dark-gray">Review your booking</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">{error}</div>
            <button 
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-staynest-dark-gray">Your trip</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-staynest-dark-gray">Dates</h4>
                <p className="text-staynest-light-gray">
                  {format(new Date(startDate), 'MMM d')} – {format(new Date(endDate), 'MMM d, yyyy')}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-staynest-dark-gray">Guests</h4>
                <p className="text-staynest-light-gray">{guests} {guests === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-staynest-gray-border pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-staynest-dark-gray">Payment details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <svg className="w-10 h-10 text-staynest-dark-gray mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
                <div>
                  <p className="font-medium text-staynest-dark-gray">Credit or debit card</p>
                  <p className="text-sm text-staynest-light-gray">We'll charge your card once you confirm</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-staynest-dark-gray">
                <span>Exchange rate:</span>
                <span>1 USD = 74.5 INR</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-staynest-gray-border pt-6">
            <h3 className="text-lg font-semibold mb-4 text-staynest-dark-gray">Cancellation policy</h3>
            <p className="text-staynest-light-gray">Free cancellation before {format(new Date(startDate), 'MMM d')}. Cancel before check-in on {format(new Date(startDate), 'MMM d, yyyy')} for a partial refund.</p>
          </div>
        </div>
        
        <div>
          <div className="bg-white border border-staynest-gray-border rounded-xl p-6 shadow-sm sticky top-28">            <div className="flex space-x-4 mb-6">
              <div className="w-24 h-24 bg-staynest-background rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src={listing?.images?.[0] }
                  alt={listingTitle}
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                  }}
                />
              </div>
              <div>
                <p className="text-sm text-staynest-light-gray">Entire home</p>
                <h4 className="font-medium text-staynest-dark-gray">{listingTitle}</h4>                <div className="flex items-center mt-1">
                  <svg className="w-3 h-3 text-staynest-pink" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>                  <span className="ml-1 text-xs font-medium text-staynest-dark-gray">
                    {listing?.avgRating ? (listing.avgRating > 0 ? listing.avgRating.toFixed(1) : 'New') : 'New'}
                  </span>
                  {listing?.reviewsCount && listing.reviewsCount > 0 && (
                    <>
                      <span className="text-staynest-light-gray mx-1 text-xs">·</span>
                      <span className="text-xs text-staynest-light-gray">
                        {listing.reviewsCount} {listing.reviewsCount === 1 ? 'review' : 'reviews'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="border-t border-staynest-gray-border pt-4 mb-4">
              <h4 className="font-semibold text-lg mb-3 text-staynest-dark-gray">Price details</h4>
              <div className="space-y-3 mb-4">                <div className="flex justify-between text-staynest-dark-gray">
                  <span>₹{Math.round(totalPrice / nights)} × {nights} nights</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-staynest-dark-gray">
                  <span>Cleaning fee</span>
                  <span>₹{cleaningFee}</span>
                </div>
                <div className="flex justify-between text-staynest-dark-gray">
                  <span>Service fee</span>
                  <span>₹{serviceFee}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-staynest-gray-border flex justify-between font-semibold text-staynest-dark-gray">
                <span>Total (INR)</span>
                <span>₹{totalWithFees}</span>
              </div>
            </div>
            
            <div className="flex justify-between space-x-4 mt-6">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 px-1 py-2 border border-staynest-dark-gray text-staynest-dark-gray font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-gradient-to-r from-staynest-pink to-staynest-red text-white py-2 rounded-lg font-medium hover:from-staynest-red hover:to-staynest-pink transition-colors disabled:opacity-70"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
