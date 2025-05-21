import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface Booking {
  _id: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  user: {
    _id: string;
    name: string;
    email: string;
  };
  listing: {
    _id: string;
    title: string;
    location: string;
  };
}

const Bookings: React.FC = () => {
  const { token } = useAuth();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/admin/bookings`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setBookings(response.data);
        setFilteredBookings(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to load bookings');
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [token]);
  
  useEffect(() => {
    // Apply filters
    let result = bookings;
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(booking => booking.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(booking => 
        booking.user.name.toLowerCase().includes(term) ||
        booking.user.email.toLowerCase().includes(term) ||
        booking.listing.title.toLowerCase().includes(term) ||
        booking.listing.location.toLowerCase().includes(term)
      );
    }
    
    setFilteredBookings(result);
  }, [statusFilter, searchTerm, bookings]);
    const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      // This endpoint would need to be implemented in your backend
      await axios.put(
        `${API_URL}/admin/booking/${bookingId}`,
        { status: newStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Update local state
      const updatedBookings = bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus as 'confirmed' | 'cancelled' | 'completed' }
          : booking
      );
      
      setBookings(updatedBookings);
      
      // Show success message and clear any previous errors
      setSuccessMessage(`Booking status updated to ${newStatus} successfully`);
      setError(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error updating booking status:', err);
      setError(err.response?.data?.message || 'Failed to update booking status');
      setSuccessMessage(null);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
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
    // Only show a full error page for initial loading errors
  if (error && loading) {
    return (
      <div className="text-center p-6 font-staynest">
        <svg className="w-16 h-16 mx-auto text-staynest-pink mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-staynest-dark-gray mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-medium rounded-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
    return (
    <div className="font-staynest max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-semibold text-staynest-dark-gray">Manage Bookings</h1>
      </div>
      
      {/* Success notification */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
          <svg className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}
      
      {/* Error notification (for non-critical errors) */}
      {error && !loading && (
        <div className="mb-6 bg-red-50 border border-red-100 rounded-lg p-4 flex items-start">
          <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="mb-8 bg-white rounded-xl shadow-staynest p-6 border border-staynest-gray-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <label className="block text-sm font-medium text-staynest-dark-gray mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-staynest-light-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user, email, or listing"
                className="w-full pl-10 pr-4 py-3 border border-staynest-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-staynest-pink"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-staynest-dark-gray mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-staynest-pink"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-staynest border border-staynest-gray-border">
          <svg className="w-16 h-16 mx-auto text-staynest-light-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-staynest-dark-gray font-medium mb-2">No bookings found</p>
          <p className="text-staynest-light-gray">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-staynest overflow-hidden border border-staynest-gray-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-staynest-gray-border">
              <thead>
                <tr className="bg-staynest-background">
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Listing</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Guests</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-staynest-gray-border">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-staynest-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-staynest-dark-gray">
                      {booking._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-staynest-dark-gray">{booking.user.name}</div>
                      <div className="text-sm text-staynest-light-gray">{booking.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-staynest-dark-gray">{booking.listing.title}</div>
                      <div className="text-sm text-staynest-light-gray">{booking.listing.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-staynest-dark-gray">
                        {format(new Date(booking.startDate), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-staynest-light-gray">
                        to {format(new Date(booking.endDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-dark-gray">
                      {booking.guests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-staynest-dark-gray">
                      ₹{booking.totalPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        value={booking.status}
                        onChange={(e) => handleUpdateStatus(booking._id, e.target.value)}
                        className="text-sm border border-staynest-gray-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-staynest-pink"
                      >
                        <option value="confirmed">Confirm</option>
                        <option value="cancelled">Cancel</option>
                        <option value="completed">Complete</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
