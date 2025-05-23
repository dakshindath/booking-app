import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface Stats {
  users: number;
  listings: number;
  bookings: number;
  revenue: number;
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();
  
  const [stats, setStats] = useState<Stats>({
    users: 0,
    listings: 0,
    bookings: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user count
        const usersResponse = await axios.get(`${API_URL}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch listings
        const listingsResponse = await axios.get(`${API_URL}/listings`);
        
        // Fetch bookings
        const bookingsResponse = await axios.get(`${API_URL}/admin/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Calculate total revenue from bookings
        const totalRevenue = bookingsResponse.data
          .filter((booking: any) => booking.status !== 'cancelled')
          .reduce((sum: number, booking: any) => sum + booking.totalPrice, 0);
        
        setStats({
          users: usersResponse.data.length,
          listings: listingsResponse.data.length,
          bookings: bookingsResponse.data.length,
          revenue: totalRevenue
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [token]);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-staynest-pink mb-4"></div>
          <div className="text-staynest-dark-gray font-medium">Loading dashboard data...</div>
          <div className="mt-6 w-64">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-staynest-gray-border rounded w-3/4 mx-auto"></div>
              <div className="h-8 bg-staynest-gray-border rounded"></div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-8 bg-staynest-gray-border rounded col-span-1"></div>
                <div className="h-8 bg-staynest-gray-border rounded col-span-2"></div>
              </div>
              <div className="h-8 bg-staynest-gray-border rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 shadow-sm max-w-md w-full">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-staynest-dark-gray text-center mb-2">Dashboard Error</h2>
          <p className="text-staynest-dark-gray mb-6 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full px-6 py-3 bg-gradient-to-r from-staynest-pink to-pink-500 text-white font-medium rounded-lg hover:from-pink-500 hover:to-staynest-pink transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="font-staynest max-w-6xl mx-auto p-4 md:p-6">
      <div className="bg-gradient-to-r from-white to-staynest-background rounded-2xl p-4 md:p-8 shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-staynest-dark-gray">Admin Dashboard</h1>
            <p className="text-staynest-light-gray mt-2">Manage your booking platform efficiently</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              to="/admin/listings" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-staynest-pink to-pink-500 text-white font-medium rounded-lg hover:from-pink-500 hover:to-staynest-pink transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Listing
            </Link>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-staynest-gray-border group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-staynest-light-gray">Total Users</h3>
              <p className="text-3xl font-bold text-staynest-dark-gray">{stats.users.toLocaleString()}</p>
            </div>
          </div>
          <Link to="/admin/users" className="text-blue-500 text-sm font-medium hover:underline flex items-center">
            View details
            <svg className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-staynest-gray-border group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-staynest-light-gray">Total Listings</h3>
              <p className="text-3xl font-bold text-staynest-dark-gray">{stats.listings.toLocaleString()}</p>
            </div>
          </div>
          <Link to="/admin/listings" className="text-green-500 text-sm font-medium hover:underline flex items-center">
            View details
            <svg className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-staynest-gray-border group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-staynest-light-gray">Total Bookings</h3>
              <p className="text-3xl font-bold text-staynest-dark-gray">{stats.bookings.toLocaleString()}</p>
            </div>
          </div>
          <Link to="/admin/bookings" className="text-purple-500 text-sm font-medium hover:underline flex items-center">
            View details
            <svg className="w-4 h-4 ml-1 group-hover:ml-2 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-gradient-to-br from-white to-pink-50 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-staynest-gray-border group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors duration-300">
              <svg className="w-6 h-6 text-staynest-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-staynest-light-gray">Total Revenue</h3>
              <p className="text-3xl font-bold text-staynest-dark-gray">₹{stats.revenue.toLocaleString()}</p>
            </div>
          </div>
          <span className="text-staynest-light-gray text-sm flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            From non-cancelled bookings
          </span>
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-staynest-gray-border hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-semibold mb-6 text-staynest-dark-gray flex items-center">
            <svg className="w-5 h-5 mr-2 text-staynest-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/admin/listings" className="flex items-center p-3 hover:bg-staynest-background rounded-lg transition-colors transform hover:-translate-y-1 duration-300">
              <div className="p-2 bg-gradient-to-r from-staynest-pink to-pink-500 rounded-lg mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-staynest-dark-gray">Add New Listing</h3>
                <p className="text-sm text-staynest-light-gray">Create and manage property listings</p>
              </div>
            </Link>
            
            <Link to="/admin/users" className="flex items-center p-3 hover:bg-staynest-background rounded-lg transition-colors transform hover:-translate-y-1 duration-300">
              <div className="p-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-staynest-dark-gray">Manage Users</h3>
                <p className="text-sm text-staynest-light-gray">View and manage user accounts</p>
              </div>
            </Link>
            
            <Link to="/admin/bookings" className="flex items-center p-3 hover:bg-staynest-background rounded-lg transition-colors transform hover:-translate-y-1 duration-300">
              <div className="p-2 bg-gradient-to-r from-green-400 to-green-600 rounded-lg mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-staynest-dark-gray">Manage Bookings</h3>
                <p className="text-sm text-staynest-light-gray">Review and update booking status</p>
              </div>
            </Link>
            
            <Link to="/admin/host-applications" className="flex items-center p-3 hover:bg-staynest-background rounded-lg transition-colors transform hover:-translate-y-1 duration-300">
              <div className="p-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-staynest-dark-gray">Host Applications</h3>
                <p className="text-sm text-staynest-light-gray">Review and approve host applications</p>
              </div>
            </Link>
            
            <Link to="/admin/pending-listings" className="flex items-center p-3 hover:bg-staynest-background rounded-lg transition-colors transform hover:-translate-y-1 duration-300">
              <div className="p-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-staynest-dark-gray">Pending Listings</h3>
                <p className="text-sm text-staynest-light-gray">Review and approve listing submissions</p>
              </div>
            </Link>
          </div>
        </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-staynest-gray-border hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-semibold mb-6 text-staynest-dark-gray flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Platform Overview
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-staynest-dark-gray font-medium">User growth</span>
                <span className="text-sm font-medium text-staynest-pink">{Math.min(100, stats.users * 2)}%</span>
              </div>
              <div className="h-3 w-full bg-staynest-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-staynest-pink to-pink-500 rounded-full shadow-inner"
                  style={{ width: `${Math.min(100, stats.users * 2)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-staynest-dark-gray font-medium">Booking rate</span>
                <span className="text-sm font-medium text-green-500">
                  {stats.listings > 0 ? Math.min(100, Math.round((stats.bookings / stats.listings) * 100)) : 0}%
                </span>
              </div>
              <div className="h-3 w-full bg-staynest-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-inner" 
                  style={{ width: stats.listings > 0 ? `${Math.min(100, (stats.bookings / stats.listings) * 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-staynest-dark-gray font-medium">Avg. revenue per booking</span>
                <span className="text-sm font-medium text-blue-500">
                  ₹{stats.bookings > 0 ? Math.round(stats.revenue / stats.bookings).toLocaleString() : 0}
                </span>
              </div>
              <div className="h-3 w-full bg-staynest-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-inner" 
                  style={{ width: stats.bookings > 0 ? `${Math.min(100, (stats.revenue / stats.bookings) / 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-staynest-gray-border">
              <div className="flex flex-wrap justify-between">
                <div className="text-center px-4 py-2">
                  <p className="text-xl font-bold text-staynest-dark-gray">{stats.bookings > 0 ? (stats.revenue / stats.bookings).toFixed(2) : 0}</p>
                  <p className="text-xs text-staynest-light-gray">Avg. Revenue</p>
                </div>
                <div className="text-center px-4 py-2">
                  <p className="text-xl font-bold text-green-500">{stats.listings > 0 ? (stats.bookings / stats.listings).toFixed(2) : 0}</p>
                  <p className="text-xs text-staynest-light-gray">Bookings per Listing</p>
                </div>
                <div className="text-center px-4 py-2">
                  <p className="text-xl font-bold text-staynest-pink">{stats.users > 0 ? (stats.bookings / stats.users).toFixed(2) : 0}</p>
                  <p className="text-xs text-staynest-light-gray">Bookings per User</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;