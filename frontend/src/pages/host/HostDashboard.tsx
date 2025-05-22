import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface Listing {
  _id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  status: string;
  createdAt: string;
}

const HostDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    totalBookings: 0,
    totalEarnings: 0,
  });

  // Function to delete a listing
  const deleteListing = async (listingId: string) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(listingId);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`${API_URL}/host/listings/${listingId}`, config);
      
      // Update listings state after successful deletion
      setListings(listings.filter(listing => listing._id !== listingId));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalListings: prevStats.totalListings - 1,
        pendingListings: prevStats.pendingListings - (listings.find(l => l._id === listingId)?.status === 'pending' ? 1 : 0),
        approvedListings: prevStats.approvedListings - (listings.find(l => l._id === listingId)?.status === 'approved' ? 1 : 0),
      }));

      setDeleteLoading(null);
    } catch (err) {
      console.error('Error deleting listing:', err);
      setDeleteLoading(null);
      alert('Failed to delete listing. Please try again.');
    }
  };

  useEffect(() => {
    const fetchHostData = async () => {
      try {      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

        // Fetch host's listings
        const listingsResponse = await axios.get(`${API_URL}/host/listings`, config);
        setListings(listingsResponse.data);
        
        // Calculate statistics
        const totalListings = listingsResponse.data.length;
        const pendingListings = listingsResponse.data.filter((listing: Listing) => listing.status === 'pending').length;
        const approvedListings = listingsResponse.data.filter((listing: Listing) => listing.status === 'approved').length;
        
        // In a real app, we would fetch booking data too
        // For now, we'll just use placeholder values
        setStats({
          totalListings,
          pendingListings,
          approvedListings,
          totalBookings: 0, // Placeholder
          totalEarnings: 0, // Placeholder
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching host data:', err);
        setError('Failed to load your host dashboard. Please try again.');
        setLoading(false);
      }
    };

    fetchHostData();
  }, [token, user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
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
      <div className="text-center p-6">
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-staynest-dark-gray">Host Dashboard</h1>
          <p className="text-staynest-light-gray">Manage your listings and bookings</p>
        </div>
        <Link
          to="/host/add-listing"
          className="mt-4 md:mt-0 px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Listing
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-md p-6 border border-staynest-gray-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-staynest-light-gray text-sm">Total Listings</p>
              <h3 className="text-2xl font-bold text-staynest-dark-gray mt-1">{stats.totalListings}</h3>
            </div>
            <div className="bg-pink-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-staynest-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-xs text-staynest-light-gray">
              {stats.pendingListings} pending, {stats.approvedListings} approved
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-staynest-gray-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-staynest-light-gray text-sm">Total Bookings</p>
              <h3 className="text-2xl font-bold text-staynest-dark-gray mt-1">{stats.totalBookings}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-staynest-gray-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-staynest-light-gray text-sm">Total Earnings</p>
              <h3 className="text-2xl font-bold text-staynest-dark-gray mt-1">₹{stats.totalEarnings}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-staynest-gray-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-staynest-light-gray text-sm">Response Rate</p>
              <h3 className="text-2xl font-bold text-staynest-dark-gray mt-1">100%</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl shadow-md border border-staynest-gray-border overflow-hidden">
        <div className="p-6 border-b border-staynest-gray-border">
          <h2 className="text-xl font-semibold text-staynest-dark-gray">Your Listings</h2>
        </div>

        {listings.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-staynest-light-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p className="text-staynest-dark-gray text-lg font-medium mb-4">No listings yet</p>
            <p className="text-staynest-light-gray mb-6">Create your first listing to start hosting</p>
            <Link
              to="/host/add-listing"
              className="px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Create a Listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-staynest-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Listing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Date Added</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-staynest-light-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-staynest-gray-border">
                {listings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-staynest-background/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {listing.images && listing.images.length > 0 ? (
                            <img className="h-10 w-10 rounded-md object-cover" src={listing.images[0]} alt={listing.title} />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-staynest-background"></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link to={`/listings/${listing._id}`} className="text-sm font-medium text-staynest-dark-gray hover:text-staynest-pink">
                            {listing.title}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-light-gray">
                      {listing.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-light-gray">
                      ₹{listing.price}/night
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${listing.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          listing.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-light-gray">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/host/edit-listing/${listing._id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </Link>
                      <button 
                        onClick={() => deleteListing(listing._id)}
                        disabled={deleteLoading === listing._id}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === listing._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
