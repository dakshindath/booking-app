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

  // Add custom CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: .5;
        }
      }
      
      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          opacity: 1;
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes float {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
      }
      
      @keyframes shimmer {
        0% {
          background-position: -200px 0;
        }
        100% {
          background-position: calc(200px + 100%) 0;
        }
      }
      
      .fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .slide-in-left {
        animation: slideInLeft 0.5s ease-out forwards;
      }
      
      .bounce-in {
        animation: bounceIn 0.6s ease-out forwards;
      }
      
      .floating {
        animation: float 3s ease-in-out infinite;
      }
      
      .shimmer {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200px 100%;
        animation: shimmer 1.5s infinite;
      }
      
      .glass-effect {
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.9);
      }
      
      .gradient-border {
        position: relative;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24);
        background-size: 400% 400%;
        animation: gradientShift 4s ease infinite;
      }
      
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Loading Header */}
          <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 border border-pink-100 animate-pulse">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-2xl shimmer"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-300 rounded w-64 shimmer"></div>
                    <div className="h-4 bg-gray-300 rounded w-48 shimmer"></div>
                  </div>
                </div>
              </div>
              <div className="mt-6 lg:mt-0">
                <div className="h-12 bg-gray-300 rounded-xl w-48 shimmer"></div>
              </div>
            </div>
          </div>

          {/* Enhanced Loading Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl shimmer"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-300 rounded w-20 shimmer"></div>
                    <div className="h-8 bg-gray-300 rounded w-16 shimmer"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-24 shimmer"></div>
              </div>
            ))}
          </div>

          {/* Enhanced Loading Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-32 mb-6 shimmer"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg shimmer"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-32 shimmer"></div>
                      <div className="h-3 bg-gray-300 rounded w-24 shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-36 mb-6 shimmer"></div>
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-300 rounded w-24 shimmer"></div>
                      <div className="h-4 bg-gray-300 rounded w-12 shimmer"></div>
                    </div>
                    <div className="h-3 bg-gray-300 rounded-full w-full shimmer"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-3xl shadow-2xl border border-red-100 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center floating">
            <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Dashboard Error</h3>
          <p className="text-gray-600 mb-8">{error}</p>          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Animation */}
        <div className="bg-gradient-to-r from-white via-pink-50 to-white rounded-3xl p-8 shadow-2xl mb-8 border border-pink-100 relative overflow-hidden fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-purple-600/5 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl floating">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Admin Dashboard
                    </h1>
                    <p className="text-gray-600 text-lg mt-1">Manage your booking platform efficiently</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 lg:mt-0">
                <Link 
                  to="/admin/listings" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <svg className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Listing
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-blue-100 group bounce-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Users</h3>
                <p className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {stats.users.toLocaleString()}
                </p>
              </div>
            </div>
            <Link to="/admin/users" className="text-blue-600 text-sm font-semibold hover:text-blue-700 flex items-center group">
              View details
              <svg className="w-4 h-4 ml-2 group-hover:ml-3 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-green-100 group bounce-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Listings</h3>
                <p className="text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                  {stats.listings.toLocaleString()}
                </p>
              </div>
            </div>
            <Link to="/admin/listings" className="text-green-600 text-sm font-semibold hover:text-green-700 flex items-center group">
              View details
              <svg className="w-4 h-4 ml-2 group-hover:ml-3 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-purple-100 group bounce-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Bookings</h3>
                <p className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                  {stats.bookings.toLocaleString()}
                </p>
              </div>
            </div>
            <Link to="/admin/bookings" className="text-purple-600 text-sm font-semibold hover:text-purple-700 flex items-center group">
              View details
              <svg className="w-4 h-4 ml-2 group-hover:ml-3 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 border border-pink-100 group bounce-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-4 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                  ₹{stats.revenue.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center text-green-600 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              From confirmed bookings
            </div>
          </div>
        </div>        {/* Enhanced Quick Actions & Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Modern Quick Actions */}
          <div className="bg-gradient-to-br from-white via-pink-50 to-white rounded-3xl shadow-2xl p-8 border border-pink-100 relative overflow-hidden slide-in-left">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-purple-600/5 animate-pulse"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg floating">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                Quick Actions
              </h2>
              
              <div className="space-y-4">
                <Link to="/admin/listings" className="group flex items-center p-5 bg-gradient-to-r from-white to-pink-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-pink-100">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-pink-600 transition-colors">Add New Listing</h3>
                    <p className="text-gray-600 text-sm">Create and manage property listings</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link to="/admin/users" className="group flex items-center p-5 bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-blue-100">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">Manage Users</h3>
                    <p className="text-gray-600 text-sm">View and manage user accounts</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link to="/admin/bookings" className="group flex items-center p-5 bg-gradient-to-r from-white to-green-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-green-100">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-green-600 transition-colors">Manage Bookings</h3>
                    <p className="text-gray-600 text-sm">Review and update booking status</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                  <Link to="/admin/host-applications" className="group flex items-center p-5 bg-gradient-to-r from-white to-purple-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-purple-100">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-purple-600 transition-colors">Host Applications</h3>
                    <p className="text-gray-600 text-sm">Review and approve host applications</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link to="/admin/hosts" className="group flex items-center p-5 bg-gradient-to-r from-white to-orange-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-orange-100">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-orange-600 transition-colors">Manage Hosts</h3>
                    <p className="text-gray-600 text-sm">View and manage host accounts</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link to="/admin/pending-listings" className="group flex items-center p-5 bg-gradient-to-r from-white to-teal-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-teal-100">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mr-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-teal-600 transition-colors">Pending Listings</h3>
                    <p className="text-gray-600 text-sm">Review and approve listing submissions</p>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced Platform Overview */}
          <div className="bg-gradient-to-br from-white via-blue-50 to-white rounded-3xl shadow-2xl p-8 border border-blue-100 relative overflow-hidden slide-in-left" style={{animationDelay: '0.2s'}}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 animate-pulse"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-8 text-gray-800 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 shadow-lg floating" style={{animationDelay: '0.5s'}}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                Platform Analytics
              </h2>
              
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-800 font-semibold text-lg">User Growth</span>
                    <span className="text-lg font-bold text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                      {Math.min(100, stats.users * 2)}%
                    </span>
                  </div>
                  <div className="h-4 w-full bg-pink-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-500 to-rose-600 rounded-full shadow-lg transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(100, stats.users * 2)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-800 font-semibold text-lg">Booking Success Rate</span>
                    <span className="text-lg font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                      {stats.listings > 0 ? Math.min(100, Math.round((stats.bookings / stats.listings) * 100)) : 0}%
                    </span>
                  </div>
                  <div className="h-4 w-full bg-green-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg transition-all duration-1000 ease-out" 
                      style={{ width: stats.listings > 0 ? `${Math.min(100, (stats.bookings / stats.listings) * 100)}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-800 font-semibold text-lg">Revenue Performance</span>
                    <span className="text-lg font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      ₹{stats.bookings > 0 ? Math.round(stats.revenue / stats.bookings).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-blue-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-lg transition-all duration-1000 ease-out" 
                      style={{ width: stats.bookings > 0 ? `${Math.min(100, (stats.revenue / stats.bookings) / 100)}%` : '0%' }}
                    ></div>
                  </div>
                </div>
                
                {/* Enhanced Statistics Footer */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <p className="text-2xl font-bold text-pink-600 mb-2">
                        {stats.bookings > 0 ? (stats.revenue / stats.bookings).toFixed(2) : 0}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">Avg. Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        {stats.listings > 0 ? (stats.bookings / stats.listings).toFixed(2) : 0}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">Bookings/Listing</p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        {stats.users > 0 ? (stats.bookings / stats.users).toFixed(2) : 0}
                      </p>
                      <p className="text-xs text-gray-600 font-medium">Bookings/User</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <Link 
            to="/admin/listings"
            className="group w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 floating"
          >
            <svg className="w-8 h-8 text-white group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;