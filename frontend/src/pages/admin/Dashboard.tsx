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
    <div className="font-staynest max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-semibold text-staynest-dark-gray">Admin Dashboard</h1>
        <div className="mt-4 md:mt-0">
          <Link 
            to="/admin/listings" 
            className="inline-flex items-center px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Listing
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-staynest transition-shadow p-6 border border-staynest-gray-border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-staynest-light-gray">Total Users</h3>
              <p className="text-2xl font-semibold text-staynest-dark-gray">{stats.users}</p>
            </div>
          </div>
          <Link to="/admin/users" className="text-staynest-pink text-sm font-medium hover:underline flex items-center">
            View details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm hover:shadow-staynest transition-shadow p-6 border border-staynest-gray-border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-staynest-light-gray">Total Listings</h3>
              <p className="text-2xl font-semibold text-staynest-dark-gray">{stats.listings}</p>
            </div>
          </div>
          <Link to="/admin/listings" className="text-staynest-pink text-sm font-medium hover:underline flex items-center">
            View details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm hover:shadow-staynest transition-shadow p-6 border border-staynest-gray-border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-staynest-light-gray">Total Bookings</h3>
              <p className="text-2xl font-semibold text-staynest-dark-gray">{stats.bookings}</p>
            </div>
          </div>
          <Link to="/admin/bookings" className="text-staynest-pink text-sm font-medium hover:underline flex items-center">
            View details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm hover:shadow-staynest transition-shadow p-6 border border-staynest-gray-border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-staynest-pink bg-opacity-10 rounded-lg">
              <svg className="w-6 h-6 text-staynest-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-staynest-light-gray">Total Revenue</h3>
              <p className="text-2xl font-semibold text-staynest-dark-gray">₹{stats.revenue}</p>
            </div>
          </div>
          <span className="text-staynest-light-gray text-sm">
            From non-cancelled bookings
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-staynest-gray-border">
          <h2 className="text-lg font-semibold mb-6 text-staynest-dark-gray">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/listings" className="flex items-center p-3 hover:bg-staynest-background rounded-lg transition-colors">
              <div className="p-2 bg-staynest-pink rounded-lg mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-staynest-dark-gray">Add New Listing</h3>
                <p className="text-sm text-staynest-light-gray">Create and manage property listings</p>
              </div>
            </Link>
            
            <Link to="/admin/users" className="flex items-center p-3 hover:bg-staynest-background rounded-lg transition-colors">
              <div className="p-2 bg-blue-500 rounded-lg mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-staynest-dark-gray">Manage Users</h3>
                <p className="text-sm text-staynest-light-gray">View and manage user accounts</p>
              </div>
            </Link>
            
            <Link to="/admin/bookings" className="flex items-center p-3 hover:bg-staynest-background rounded-lg transition-colors">
              <div className="p-2 bg-green-500 rounded-lg mr-4">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-staynest-dark-gray">Manage Bookings</h3>
                <p className="text-sm text-staynest-light-gray">Review and update booking status</p>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-6 border border-staynest-gray-border">
          <h2 className="text-lg font-semibold mb-6 text-staynest-dark-gray">Platform Overview</h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-staynest-dark-gray">User growth</span>
              <div className="h-2 w-2/3 bg-staynest-background rounded-full overflow-hidden">
                <div className="h-full bg-staynest-pink rounded-full" style={{ width: `${Math.min(100, stats.users * 2)}%` }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-staynest-dark-gray">Booking</span>
              <div className="h-2 w-2/3 bg-staynest-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: stats.listings > 0 ? `${Math.min(100, (stats.bookings / stats.listings) * 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-staynest-dark-gray">Avg. revenue per booking</span>
              <div className="h-2 w-2/3 bg-staynest-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: stats.bookings > 0 ? `${Math.min(100, (stats.revenue / stats.bookings) / 100)}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
