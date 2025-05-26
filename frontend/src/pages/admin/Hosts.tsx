import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

interface Host {
  _id: string;
  name: string;
  email: string;
  hostSince: string;
  hostInfo: {
    phone: string;
    address: string;
    bio: string;
  };
  isAdmin: boolean;
  avatar?: string;
}

const Hosts: React.FC = () => {
  const { token } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Add custom CSS animations matching Users page
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

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Effect to handle modal close events
  useEffect(() => {
    if (!showConfirmModal) return;

    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";

    // Handle click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowConfirmModal(false);
      }
    };

    // Handle escape key to close
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowConfirmModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [showConfirmModal]);
  const fetchHosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/hosts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHosts(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching hosts:", err);
      setError("Failed to load hosts data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHosts();
  }, [token, fetchHosts]);
  const revokeHostStatus = useCallback(
    async (hostId: string) => {
      try {
        setActionLoading(hostId);
        setSuccessMessage(null);
        await axios.put(
          `${API_URL}/admin/host/${hostId}/revoke`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setSuccessMessage("Host status revoked successfully");
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);

        // Refresh the hosts list
        fetchHosts();
      } catch (err: any) {
        console.error("Error revoking host status:", err);
        setError(err.response?.data?.message || "Failed to revoke host status");
      } finally {
        setActionLoading(null);
      }
    },
    [token, fetchHosts]
  );
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy");
  };

  const filteredHosts = searchTerm
    ? hosts.filter(
        (host) =>
          host.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          host.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : hosts;
  const handleRevokeClick = (
    hostId: string,
    hostName: string,
    isAdmin: boolean
  ) => {
    if (isAdmin) {
      setError("Cannot revoke host status from admin users");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSelectedHost({ id: hostId, name: hostName });
    setShowConfirmModal(true);
  };

  const confirmRevoke = () => {
    if (selectedHost) {
      revokeHostStatus(selectedHost.id);
      setShowConfirmModal(false);
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
          <div className="h-16 bg-gray-300 rounded-xl"></div>
        </div>
        {/* Enhanced Loading Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="bg-gray-100 p-6">
            <div className="grid grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-8 grid grid-cols-6 gap-4 items-center">
                <div className="flex items-center space-x-4">
                  <div className="h-14 w-14 bg-gray-300 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-8 bg-gray-300 rounded-full w-20"></div>
                <div className="h-8 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Loading Stats Footer */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
  }

  if (error && !hosts.length) {
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
      <div className="bg-gradient-to-r from-white via-pink-50 to-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 border border-pink-100 relative overflow-hidden">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Host Management
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Manage host accounts and permissions with ease
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span>Total: {hosts.length} hosts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Enhanced Search Section */}
      <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
            placeholder="Search by name or email..."
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
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600">
            Found {filteredHosts.length} host
            {filteredHosts.length !== 1 ? "s" : ""} matching "{searchTerm}"
          </div>
        )}
      </div>{" "}
      {error && (
        <div
          className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm relative fade-in-up"
          role="alert"
        >
          <div className="flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-red-500"
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
            <span className="block sm:inline font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 transition-colors duration-200 hover:text-red-900"
          >
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
          </button>
        </div>
      )}
      {successMessage && (
        <div
          className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-sm relative fade-in-up"
          role="alert"
        >
          <div className="flex items-center">
            <svg
              className="w-6 h-6 mr-3 text-green-500"
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
            <span className="block sm:inline font-medium">
              {successMessage}
            </span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 transition-colors duration-200 hover:text-green-900"
          >
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
          </button>{" "}
        </div>
      )}
      {filteredHosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No hosts found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? "Try adjusting your search terms"
                : "No hosts have been registered yet"}
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
                  <th className="px-8 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center">
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
                      <span>Host</span>
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
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
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span>Email</span>
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
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
                      <span>Host Since</span>
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
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
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <span>Phone</span>
                    </div>
                  </th>
                  <th className="px-8 py-6 text-left text-xs text-gray-700 uppercase tracking-wider font-bold">
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
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                          />
                        </svg>
                      </div>
                      <span>Role</span>
                    </div>
                  </th>
                  <th className="px-8 py-6 text-right text-xs text-gray-700 uppercase tracking-wider font-bold">
                    <div className="flex items-center justify-end space-x-2">
                      <span>Actions</span>
                      <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-rose-500 rounded-lg flex items-center justify-center">
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHosts.map((host, index) => (
                  <tr
                    key={host._id}
                    className="hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 transition-all duration-300 group fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 h-14 w-14 relative">
                          {host.avatar ? (
                            <img
                              src={host.avatar}
                              alt=""
                              className="h-14 w-14 rounded-xl object-cover shadow-lg border-2 border-white group-hover:border-pink-200 transition-all duration-300 group-hover:scale-110"
                            />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-all duration-300">
                              {host.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                            {host.name}
                          </div>
                          <div className="text-sm text-gray-500">Host</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-gray-700 font-medium">
                          {host.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span className="text-gray-700 font-medium">
                          {host.hostSince ? formatDate(host.hostSince) : "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-gray-700 font-medium">
                          {host.hostInfo?.phone || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 border border-pink-200">
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4"
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
                            <span>Host</span>
                          </div>
                        </span>
                        {host.isAdmin && (
                          <span className="px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full shadow-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                />
                              </svg>
                              <span>Admin</span>
                            </div>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                      {host.isAdmin ? (
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold rounded-lg border border-green-200">
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Admin Protected
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            handleRevokeClick(host._id, host.name, host.isAdmin)
                          }
                          disabled={actionLoading === host._id}
                          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-all duration-200 group border border-gray-200 hover:border-red-200"
                        >
                          {actionLoading === host._id ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600"
                                xmlns="http://www.w3.org/2000/svg"
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
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-2 group-hover:animate-pulse"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Revoke Host
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>{" "}
        </div>
      )}
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="floating-btn w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          title="Scroll to top"
        >
          <svg
            className="w-6 h-6 group-hover:scale-110 transition-transform duration-200"
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
      </div>
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-staynest backdrop-blur-sm fade-in-up">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all bounce-in"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-white to-pink-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Confirm Revocation
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              <div className="py-2">
                <div className="bg-red-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-center text-gray-800 mb-3 text-lg font-medium">
                  Revoke Host Status
                </p>
                <p className="text-center text-gray-700 mb-4">
                  Are you sure you want to revoke host status for{" "}
                  <span className="font-bold text-pink-600">
                    {selectedHost?.name}
                  </span>
                  ?
                </p>
                <p className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                  This will prevent them from hosting properties and managing
                  their listings. This action cannot be easily undone.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmRevoke}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-sm hover:shadow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Revoke Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hosts;
