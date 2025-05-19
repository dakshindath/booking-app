import React, { useState } from 'react';
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

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Access the booking information passed from the listing details page
  const state = location.state as BookingState;
  
  if (!state || !state.listingId) {
    return (
      <div className="text-center p-8">
        <p className="text-xl mb-4">Booking information not found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
      
      // If successful, navigate to the bookings page
      navigate('/bookings', { state: { success: true, bookingId: response.data._id } });
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || 'Failed to complete booking. Please try again.');
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Confirm Your Booking</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-700"
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-xl font-semibold mb-2">{listingTitle}</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-gray-600">Check-in</p>
            <p className="font-medium">{format(new Date(startDate), 'MMM dd, yyyy')}</p>
          </div>
          <div>
            <p className="text-gray-600">Check-out</p>
            <p className="font-medium">{format(new Date(endDate), 'MMM dd, yyyy')}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">Guests</p>
          <p className="font-medium">{guests} {guests === 1 ? 'guest' : 'guests'}</p>
        </div>
      </div>
      
      <div className="mb-8 border-t border-b py-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Total Price</h3>
          <p className="text-xl font-bold">₹{totalPrice}</p>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} nights
        </p>
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Back
        </button>
        <button
          onClick={handleConfirmBooking}
          className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
