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
        <div className="text-xl">Loading dashboard...</div>
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
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Users</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.users}</p>
          <Link to="/admin/users" className="text-blue-600 hover:underline text-sm inline-block mt-2">
            View all users →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Listings</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.listings}</p>
          <Link to="/admin/listings" className="text-blue-600 hover:underline text-sm inline-block mt-2">
            Manage listings →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Bookings</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.bookings}</p>
          <Link to="/admin/bookings" className="text-blue-600 hover:underline text-sm inline-block mt-2">
            View all bookings →
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₹{stats.revenue}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/listings" className="block p-4 border rounded-md hover:bg-gray-50">
            <h3 className="font-medium">Add New Listing</h3>
            <p className="text-gray-500 text-sm">Create a new property listing</p>
          </Link>
          
          <Link to="/admin/users" className="block p-4 border rounded-md hover:bg-gray-50">
            <h3 className="font-medium">Manage Users</h3>
            <p className="text-gray-500 text-sm">View and manage user accounts</p>
          </Link>
          
          <Link to="/admin/bookings" className="block p-4 border rounded-md hover:bg-gray-50">
            <h3 className="font-medium">View Bookings</h3>
            <p className="text-gray-500 text-sm">Review all booking activity</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
