import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { format, isPast } from 'date-fns';
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
  );  const [activeTab, setActiveTab] = useState<string>('upcoming');
  
  const updateBookingStatus = useCallback(async (bookingId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await axios.put(
        `${API_URL}/booking/${bookingId}`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Update the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId ? { ...booking, status } : booking
        )
      );
      
      setSuccessMessage('Booking status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
      setTimeout(() => setError(null), 3000);
    }
  }, [token]);
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {        const response = await axios.get(
          `${API_URL}/booking`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const bookingsData = response.data;
        
        // Check for bookings that should be marked as completed
        // (past bookings with 'confirmed' status)
        const today = new Date();
        for (const booking of bookingsData) {
          if (
            booking.status === 'confirmed' && 
            isPast(new Date(booking.endDate)) &&
            !isPast(new Date(today.setDate(today.getDate() - 30))) // Within last 30 days
          ) {
            await updateBookingStatus(booking._id, 'completed');
          }
        }
        
        setBookings(bookingsData);
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
  }, [user, token, successMessage, updateBookingStatus]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border border-red-100';
      case 'completed':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-staynest">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-staynest-gray-border h-10 w-10"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-staynest-gray-border rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-staynest-gray-border rounded"></div>
              <div className="h-4 bg-staynest-gray-border rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 font-staynest">
        <svg className="w-16 h-16 mx-auto text-staynest-pink mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-staynest-dark-gray mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const today = new Date();
  const upcomingBookings = bookings.filter(booking => 
    new Date(booking.endDate) >= today && booking.status !== 'cancelled'
  );
  const pastBookings = bookings.filter(booking => 
    new Date(booking.endDate) < today || booking.status === 'cancelled'
  );
  
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="font-staynest max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-staynest-dark-gray">Trips</h1>
      
      {successMessage && (
        <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1">{successMessage}</div>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-green-700 hover:text-green-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Tabs */}
      <div className="border-b border-staynest-gray-border mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-4 px-2 font-medium text-base ${
              activeTab === 'upcoming'
                ? 'border-b-2 border-staynest-dark-gray text-staynest-dark-gray'
                : 'text-staynest-light-gray'
            }`}
          >
            Upcoming
            {upcomingBookings.length > 0 && (
              <span className="ml-2 bg-staynest-pink text-white rounded-full px-2 py-px text-xs">
                {upcomingBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-4 px-2 font-medium text-base ${
              activeTab === 'past'
                ? 'border-b-2 border-staynest-dark-gray text-staynest-dark-gray'
                : 'text-staynest-light-gray'
            }`}
          >
            Past
          </button>
        </div>
      </div>
      
      {displayedBookings.length === 0 ? (
        <div className="text-center py-12 bg-staynest-background rounded-xl">
          <svg className="w-16 h-16 mx-auto text-staynest-light-gray mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-staynest-dark-gray text-lg font-medium mb-2">No {activeTab} trips</p>
          <p className="text-staynest-light-gray mb-6">Time to start planning your next adventure</p>
          <Link to="/" className="px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors">
            Explore StayNest
          </Link>
        </div>
      ) : (        <div className="grid grid-cols-1 gap-6">
          {displayedBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-staynest-gray-border">              <div className="md:flex">
                <div className="md:w-1/3 h-48 md:h-52 relative bg-staynest-background overflow-hidden">
                  {booking.listing.images && booking.listing.images.length > 0 ? (
                    <div className="h-full">
                      <img 
                        src={booking.listing.images[0]} 
                        alt={booking.listing.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-staynest-background">
                      <span className="text-staynest-light-gray">No image</span>
                    </div>
                  )}                 
                 
                </div>                
                  <div className="p-6 md:w-2/3">                  
                    <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-sm font-medium text-staynest-light-gray">
                        {format(new Date(booking.startDate), 'MMM d')} - {format(new Date(booking.endDate), 'MMM d, yyyy')}
                      </span>
                      <h3 className="text-lg font-medium text-staynest-dark-gray mt-1">{booking.listing.title}</h3>
                      <p className="text-staynest-light-gray text-sm mt-1">{booking.listing.location}</p>
                    </div>
                    <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>                    <div className="mt-5 flex flex-wrap items-center justify-between">
                    <div className="space-y-2 mb-4 md:mb-0">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-staynest-dark-gray mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-staynest-dark-gray text-sm">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-staynest-dark-gray mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-staynest-dark-gray font-medium">₹{booking.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                      <div>
                      {booking.status === 'confirmed' && new Date(booking.startDate) > today && (
                        <Link 
                          to={`/listings/${booking.listing._id}`}
                          className="inline-block px-6 py-2.5 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-medium rounded-lg hover:shadow-md transition-all"
                        >
                          View Details
                        </Link>
                      )}
                      {booking.status === 'completed' && (
                        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                          <Link 
                            to={`/listings/${booking.listing._id}#reviews`}
                            className="inline-block px-6 py-2.5 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-all text-center"
                          >
                            Leave a Review
                          </Link>
                          <Link 
                            to={`/listings/${booking.listing._id}`}
                            className="inline-block px-6 py-2.5 border border-staynest-dark-gray text-staynest-dark-gray font-medium rounded-lg hover:bg-staynest-background transition-all text-center"
                          >
                            Book Again
                          </Link>
                        </div>
                      )}
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
