import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

interface Booking {
  _id: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: "confirmed" | "cancelled" | "completed";
  user: {
    _id: string;
    name: string;
    email: string;
  };
  listing: {
    _id: string;
    title: string;
    location: string;
  } | null;
}

const Bookings: React.FC = () => {
  const { token } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Filtering
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Add custom CSS animations
  React.useEffect(() => {
    const style = document.createElement("style");
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
      
      .fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
      
      .slide-in-left {
        animation: slideInLeft 0.5s ease-out forwards;
      }
      
      .hover-lift:hover {
        transform: translateY(-2px);
      }
      
      .glass-effect {
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.8);
      }
      
      .pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      .bounce-in {
        animation: bounceIn 0.6s ease-out forwards;
      }
      
      .floating-btn {
        animation: float 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    // Scroll to top functionality
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      document.head.removeChild(style);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookings(response.data);
        setFilteredBookings(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings");
        setLoading(false);
      }
    };

    fetchBookings();
  }, [token]);

  useEffect(() => {
    // Apply filters
    let result = bookings;

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((booking) => booking.status === statusFilter);
    }
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (booking) =>
          booking.user.name.toLowerCase().includes(term) ||
          booking.user.email.toLowerCase().includes(term) ||
          (booking.listing &&
            booking.listing.title.toLowerCase().includes(term)) ||
          (booking.listing &&
            booking.listing.location.toLowerCase().includes(term))
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
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      const updatedBookings = bookings.map((booking) =>
        booking._id === bookingId
          ? {
              ...booking,
              status: newStatus as "confirmed" | "cancelled" | "completed",
            }
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
      console.error("Error updating booking status:", err);
      setError(
        err.response?.data?.message || "Failed to update booking status"
      );
      setSuccessMessage(null);

      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  if (loading) {
    return (
      <div className="font-staynest max-w-7xl mx-auto p-4 md:p-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50">
        {/* Enhanced Loading Header */}
        <div className="bg-gradient-to-r from-white to-pink-50 rounded-3xl p-6 md:p-8 shadow-xl mb-8 border border-pink-100 animate-pulse">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                <div className="h-8 bg-gray-300 rounded w-64"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-48"></div>
            </div>
            <div className="mt-6 lg:mt-0">
              <div className="h-12 bg-gray-300 rounded-xl w-48"></div>
            </div>
          </div>
        </div>
        {/* Enhanced Loading Search */}
        <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
            </div>
            <div className="w-full md:w-48">
              <div className="h-4 bg-gray-300 rounded w-12 mb-2"></div>
              <div className="h-12 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
        {/* Enhanced Loading Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="bg-gray-100 p-6">
            <div className="grid grid-cols-8 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 grid grid-cols-8 gap-4 items-center">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 rounded w-32"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-28"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-8"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
                <div className="h-8 bg-gray-300 rounded-full w-20"></div>
                <div className="h-8 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Loading Stats Footer */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-gray-300 rounded-xl mx-auto mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-12 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-20 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } // Only show a full error page for initial loading errors
  if (error && loading) {
    return (
      <div className="font-staynest max-w-7xl mx-auto p-4 md:p-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-red-100 max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="font-staynest max-w-7xl mx-auto p-4 md:p-6 min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50">
      {/* Enhanced Header with Animation */}
      <div className="bg-gradient-to-r from-white via-pink-50 to-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 border border-pink-100 relative overflow-hidden fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-purple-600/5 animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Booking Management
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Monitor and manage all property bookings
              </p>
            </div>
            <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Total: {bookings.length} bookings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Success notification */}
      {successMessage && (
        <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 flex items-start shadow-lg bounce-in">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-green-800 mb-1">
              Success!
            </h4>
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}
      {/* Error notification */}
      {error && !loading && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 flex items-start shadow-lg bounce-in">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-red-800 mb-1">Error</h4>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      {/* Enhanced Search Section */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 slide-in-left">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-grow">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <span>Search Bookings</span>
              </div>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="h-6 w-6 text-pink-500 group-focus-within:text-pink-600 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user, email, or listing..."
                className="pl-14 w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all duration-300 bg-gray-50 focus:bg-white text-lg placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-pink-500 transition-colors duration-200 group"
                >
                  <div className="p-2 rounded-full hover:bg-pink-50 transition-colors">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>

          <div className="w-full md:w-64">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <span>Filter Status</span>
              </div>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all duration-300 bg-gray-50 focus:bg-white text-lg"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            Found {filteredBookings.length} booking
            {filteredBookings.length !== 1 ? "s" : ""} matching "{searchTerm}"
          </div>
        )}
      </div>{" "}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100 hover-lift">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-pink-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Try adjusting your search terms or filters"
                : "No bookings have been made yet"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 via-pink-50 to-purple-50">
                <tr>
                  <th className="px-6 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                          />
                        </svg>
                      </div>
                      <span>Booking ID</span>
                    </div>
                  </th>
                  <th className="px-6 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <span>Guest</span>
                    </div>
                  </th>
                  <th className="px-6 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <span>Property</span>
                    </div>
                  </th>
                  <th className="px-6 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span>Dates</span>
                    </div>
                  </th>
                  <th className="px-6 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <span>Guests</span>
                    </div>
                  </th>
                  <th className="px-6 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                          />
                        </svg>
                      </div>
                      <span>Price</span>
                    </div>
                  </th>
                  <th className="px-6 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <span>Status</span>
                    </div>
                  </th>
                  <th className="px-6 py-6 text-right text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-slate-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </div>
                      <span>Actions</span>{" "}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking, index) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 group"
                    style={{
                      animationName: "fadeInUp",
                      animationDuration: "0.6s",
                      animationTimingFunction: "ease-out",
                      animationFillMode: "forwards",
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mr-3">
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            #{booking._id.substring(0, 8)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {booking._id.substring(8, 16)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-lg font-bold text-green-600">
                            {booking.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {booking.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mr-4">
                          <svg
                            className="w-6 h-6 text-purple-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 max-w-xs truncate">
                            {booking.listing
                              ? booking.listing.title
                              : "Listing Unavailable"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.listing ? booking.listing.location : "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mr-4">
                          <svg
                            className="w-6 h-6 text-yellow-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {format(
                              new Date(booking.startDate),
                              "MMM dd, yyyy"
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            to{" "}
                            {format(new Date(booking.endDate), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-lg font-bold text-teal-600">
                            {booking.guests}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">
                            Guest{booking.guests !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center mr-4">
                          <svg
                            className="w-6 h-6 text-emerald-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            ₹{booking.totalPrice.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            Total Amount
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-lg transform transition-all duration-200 hover:scale-105 ${
                          booking.status === "confirmed"
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                            : booking.status === "cancelled"
                            ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200"
                            : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            booking.status === "confirmed"
                              ? "bg-green-500"
                              : booking.status === "cancelled"
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                        ></div>
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap text-right">
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          handleUpdateStatus(booking._id, e.target.value)
                        }
                        className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 transition-all duration-300 text-sm font-medium hover:shadow-lg transform hover:scale-105"
                      >
                        <option value="confirmed">Confirm</option>
                        <option value="cancelled">Cancel</option>{" "}
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
      {/* Enhanced Statistics Footer */}
      <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 fade-in-up">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg flex items-center justify-center mr-3">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          Booking Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {bookings.filter((b) => b.status === "confirmed").length}
            </div>
            <div className="text-sm text-green-700 font-medium">Confirmed</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {bookings.filter((b) => b.status === "completed").length}
            </div>
            <div className="text-sm text-blue-700 font-medium">Completed</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-1">
              {bookings.filter((b) => b.status === "cancelled").length}
            </div>
            <div className="text-sm text-red-700 font-medium">Cancelled</div>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>{" "}
            <div className="text-2xl font-bold text-purple-600 mb-1">
              ₹
              {bookings
                .filter(
                  (b) => b.status === "confirmed" || b.status === "completed"
                )
                .reduce((sum, b) => sum + b.totalPrice, 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-purple-700 font-medium">
              Total Revenue
            </div>
          </div>
        </div>
      </div>
      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 floating-btn z-50 flex items-center justify-center"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Bookings;
