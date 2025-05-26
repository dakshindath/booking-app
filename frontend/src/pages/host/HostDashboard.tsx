import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

interface Listing {
  _id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  status: string;
  createdAt: string;
}

interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  listing: {
    _id: string;
    title: string;
    location: string;
    price: number;
    images: string[];
  };
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: "confirmed" | "cancelled" | "completed";
  createdAt: string;
}

const HostDashboard: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Dashboard stats
  const [stats, setStats] = useState({
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    totalBookings: 0,
    totalEarnings: 0,
    completedBookings: 0,
    activeBookings: 0,
    averageRating: 0,
  });

  // Add custom CSS animations
  useEffect(() => {
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
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.8;
        }
      }
      
      @keyframes shimmer {
        0% {
          background-position: -468px 0;
        }
        100% {
          background-position: 468px 0;
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
      
      .floating-btn {
        animation: float 3s ease-in-out infinite;
      }
      
      .pulse-animation {
        animation: pulse 2s ease-in-out infinite;
      }
      
      .shimmer {
        animation: shimmer 1.2s ease-in-out infinite;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 400% 100%;
      }
      
      .hover-lift {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      
      .hover-lift:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      
      .gradient-border {
        position: relative;
        background: linear-gradient(white, white) padding-box,
                    linear-gradient(145deg, #ec4899, #8b5cf6) border-box;
        border: 2px solid transparent;
      }
      
      .card-hover {
        transition: all 0.3s ease;
      }
      
      .card-hover:hover {
        transform: translateY(-8px);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
    `;
    document.head.appendChild(style);

    // Scroll to top functionality
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  // Function to delete a listing
  const deleteListing = useCallback(
    async (listingId: string) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this listing? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        setDeleteLoading(listingId);

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        await axios.delete(`${API_URL}/host/listings/${listingId}`, config);

        // Update listings state after successful deletion
        setListings(listings.filter((listing) => listing._id !== listingId));

        // Update stats
        setStats((prevStats) => ({
          ...prevStats,
          totalListings: prevStats.totalListings - 1,
          pendingListings:
            prevStats.pendingListings -
            (listings.find((l) => l._id === listingId)?.status === "pending"
              ? 1
              : 0),
          approvedListings:
            prevStats.approvedListings -
            (listings.find((l) => l._id === listingId)?.status === "approved"
              ? 1
              : 0),
        }));

        setDeleteLoading(null);
      } catch (err) {
        console.error("Error deleting listing:", err);
        setDeleteLoading(null);
        alert("Failed to delete listing. Please try again.");
      }
    },
    [token, listings]
  );
  useEffect(() => {
    const fetchHostData = async () => {
      try {
        if (!token) {
          navigate("/login");
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch host's listings
        const listingsResponse = await axios.get(
          `${API_URL}/host/listings`,
          config
        );
        setListings(listingsResponse.data);

        // Fetch host's bookings
        let bookingsData: Booking[] = [];
        try {
          const bookingsResponse = await axios.get(
            `${API_URL}/host/bookings`,
            config
          );          bookingsData = bookingsResponse.data;
        } catch (bookingErr) {
          console.log("No bookings found or error fetching bookings");
        }

        // Calculate statistics
        const totalListings = listingsResponse.data.length;
        const pendingListings = listingsResponse.data.filter(
          (listing: Listing) => listing.status === "pending"
        ).length;
        const approvedListings = listingsResponse.data.filter(
          (listing: Listing) => listing.status === "approved"
        ).length;

        // Calculate booking statistics
        const totalBookings = bookingsData.length;
        const completedBookings = bookingsData.filter(
          (booking: Booking) => booking.status === "completed"
        ).length;
        const activeBookings = bookingsData.filter(
          (booking: Booking) => booking.status === "confirmed"
        ).length;

        // Calculate total earnings from completed bookings
        const totalEarnings = bookingsData
          .filter((booking: Booking) => booking.status === "completed")
          .reduce(
            (sum: number, booking: Booking) => sum + booking.totalPrice,
            0
          );

        // Calculate response rate (placeholder - you could implement actual response tracking)
        const responseRate =
          totalBookings > 0
            ? Math.round(
                ((completedBookings + activeBookings) / totalBookings) * 100
              )
            : 100;

        setStats({
          totalListings,
          pendingListings,
          approvedListings,
          totalBookings,
          totalEarnings,
          completedBookings,
          activeBookings,
          averageRating: responseRate, // Using as response rate for now
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching host data:", err);
        setError("Failed to load your host dashboard. Please try again.");
        setLoading(false);
      }
    };

    fetchHostData();
  }, [token, navigate]);
  if (loading) {
    return (
      <div className="font-staynest min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Loading Header */}
          <div className="bg-gradient-to-r from-white via-pink-50 to-white rounded-3xl p-8 shadow-xl mb-8 border border-pink-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="space-y-4 flex-1">
                <div
                  className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer"
                  style={{ width: "300px" }}
                ></div>
                <div
                  className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer"
                  style={{ width: "250px" }}
                ></div>
              </div>
              <div className="mt-4 md:mt-0">
                <div
                  className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl shimmer"
                  style={{ width: "180px" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Loading Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-3 flex-1">
                    <div
                      className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer"
                      style={{ width: "80px" }}
                    ></div>
                    <div
                      className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer"
                      style={{ width: "60px" }}
                    ></div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full shimmer"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading Table */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <div
                className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer"
                style={{ width: "150px" }}
              ></div>
            </div>
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl shimmer"></div>
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer"
                      style={{ width: "60%" }}
                    ></div>
                    <div
                      className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer"
                      style={{ width: "40%" }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="font-staynest min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl p-12 shadow-xl border-2 border-red-100 text-center bounce-in">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-600"
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
            <h3 className="text-2xl font-bold text-red-800 mb-4">
              Something went wrong
            </h3>
            <p className="text-red-700 mb-8 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="font-staynest min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Animation */}
        <div className="bg-gradient-to-r from-white via-pink-50 to-white rounded-3xl p-8 shadow-xl mb-8 border border-pink-100 relative overflow-hidden fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 to-purple-600/5 pulse-animation"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mr-6 shadow-lg hover-lift">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Host Dashboard
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Manage your listings and grow your hosting business
                </p>
              </div>
            </div>
            <Link
              to="/host/add-listing"
              className="mt-6 md:mt-0 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add New Listing
            </Link>
          </div>
        </div>{" "}
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 slide-in-left">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 card-hover relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Total Listings
                </p>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {stats.totalListings}
                </h3>
                <div className="flex items-center mt-3">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {stats.pendingListings} pending • {stats.approvedListings}{" "}
                    approved
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
            </div>
          </div>{" "}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 card-hover relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Total Bookings
                </p>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {stats.totalBookings}
                </h3>
                <div className="flex items-center mt-3">
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {stats.activeBookings} active • {stats.completedBookings}{" "}
                    completed
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
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
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 card-hover relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Total Earnings
                </p>{" "}
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  ₹{stats.totalEarnings.toLocaleString("en-IN")}
                </h3>
                <div className="flex items-center mt-3">
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {stats.completedBookings} completed bookings
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 card-hover relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Response Rate
                </p>{" "}
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {stats.averageRating}%
                </h3>
                <div className="flex items-center mt-3">
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {stats.averageRating >= 90
                      ? "Excellent"
                      : stats.averageRating >= 70
                      ? "Good"
                      : "Needs Improvement"}
                  </span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>{" "}
        {/* Enhanced Listings Table */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden bounce-in">
          <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Your Listings
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Manage and monitor your property listings
                </p>
              </div>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                No listings yet
              </h3>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                Start your hosting journey by creating your first property
                listing
              </p>
              <Link
                to="/host/add-listing"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Your First Listing{" "}
              </Link>
            </div>
          ) : (
            <div>
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Listing
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date Added
                    </th>
                    <th className="px-8 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listings.map((listing, index) => (
                    <tr
                      key={listing._id}
                      className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-200"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 mr-4">
                            {listing.images && listing.images.length > 0 ? (
                              <img
                                className="h-16 w-16 rounded-xl object-cover shadow-md hover-lift"
                                src={listing.images[0]}
                                alt={listing.title}
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <svg
                                  className="w-8 h-8 text-gray-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              to={`/listings/${listing._id}`}
                              className="text-lg font-semibold text-gray-800 hover:text-pink-600 transition-colors duration-200"
                            >
                              {listing.title}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              Click to view details
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex items-center text-gray-600">
                          <svg
                            className="w-4 h-4 mr-2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {listing.location}
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-lg font-semibold text-gray-800">
                          ₹{listing.price}
                          <span className="text-sm font-normal text-gray-500">
                            /night
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            listing.status === "approved"
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                              : listing.status === "rejected"
                              ? "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200"
                              : "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200"
                          }`}
                        >
                          {listing.status.charAt(0).toUpperCase() +
                            listing.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-gray-600">
                        {new Date(listing.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            to={`/host/edit-listing/${listing._id}`}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
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
                                strokeWidth={1.5}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteListing(listing._id)}
                            disabled={deleteLoading === listing._id}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            {deleteLoading === listing._id ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Delete
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    </div>
  );
};

export default HostDashboard;
