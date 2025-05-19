import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface Booking {
  _id: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  listing: {
    _id: string;
    title: string;
    location: string;
    images: string[];
  };
}

const UserBookings: React.FC = () => {
  const { user, token } = useAuth();
  const location = useLocation();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.success 
      ? 'Booking confirmed successfully!' 
      : null
  );

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get(
          `${API_URL}/booking/${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load your bookings. Please try again later.');
        setLoading(false);
      }
    };

    fetchBookings();
    
    // Clear success message after 5 seconds
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [user, token, successMessage]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-6">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <span>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="float-right text-green-700"
          >
            &times;
          </button>
        </div>
      )}
      
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You don't have any bookings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/4 h-48 md:h-auto bg-gray-300 overflow-hidden">
                  {booking.listing.images && booking.listing.images.length > 0 ? (
                    <img 
                      src={booking.listing.images[0]} 
                      alt={booking.listing.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-6 md:w-3/4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold mb-2">{booking.listing.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{booking.listing.location}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-500 text-sm">Check-in</p>
                      <p>{format(new Date(booking.startDate), 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Check-out</p>
                      <p>{format(new Date(booking.endDate), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500 text-sm">Guests</p>
                      <p>{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">Total Price</p>
                      <p className="font-bold">₹{booking.totalPrice}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings;
