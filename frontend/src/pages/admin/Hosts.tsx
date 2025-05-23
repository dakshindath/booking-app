import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

// Define animation keyframes for fadeIn and scaleIn
const fadeInKeyframes = `@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`;
const scaleInKeyframes = `@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;

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
}

const Hosts: React.FC = () => {
  const { token } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState<{ id: string; name: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Add CSS animations to the document
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      ${fadeInKeyframes}
      .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
      ${scaleInKeyframes}
      .animate-scaleIn { animation: scaleIn 0.3s ease-in-out; }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Effect to handle modal close events
  useEffect(() => {
    if (!showConfirmModal) return;
    
    // Prevent scrolling when modal is open
    document.body.style.overflow = 'hidden';
    
    // Handle click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowConfirmModal(false);
      }
    };

    // Handle escape key to close
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowConfirmModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showConfirmModal]);const fetchHosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/hosts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Hosts data from API:', response.data);
      setHosts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching hosts:', err);
      setError('Failed to load hosts data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchHosts();
  }, [token, fetchHosts]);
  const revokeHostStatus = useCallback(async (hostId: string) => {
    try {
      setActionLoading(hostId);
      setSuccessMessage(null);
        await axios.put(`${API_URL}/admin/host/${hostId}/revoke`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSuccessMessage('Host status revoked successfully');
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Refresh the hosts list
      fetchHosts();
    } catch (err: any) {
      console.error('Error revoking host status:', err);
      setError(err.response?.data?.message || 'Failed to revoke host status');
    } finally {
      setActionLoading(null);
    }
  }, [token, fetchHosts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const handleRevokeClick = (hostId: string, hostName: string, isAdmin: boolean) => {
    if (isAdmin) {
      setError('Cannot revoke host status from admin users');
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
      <div className="flex justify-center items-center h-96 font-staynest">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-staynest-pink mb-4"></div>
          <div className="text-staynest-dark-gray font-medium">Loading host data...</div>
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
  return (
    <div className="font-staynest max-w-6xl mx-auto p-4 md:p-6">
      <div className="bg-gradient-to-r from-white to-staynest-background rounded-2xl p-4 md:p-8 shadow-md mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-staynest-dark-gray">Host Management</h1>
            <p className="text-staynest-light-gray mt-2">Manage host accounts and permissions</p>
          </div>
        </div>
      </div>        {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow-sm relative animate-fadeIn" role="alert">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="block sm:inline font-medium">{error}</span>
          </div>
          <button 
            onClick={() => setError(null)} 
            className="absolute top-0 bottom-0 right-0 px-4 py-3 transition-colors duration-200 hover:text-red-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
        {successMessage && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-sm relative animate-fadeIn" role="alert">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="block sm:inline font-medium">{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage(null)} 
            className="absolute top-0 bottom-0 right-0 px-4 py-3 transition-colors duration-200 hover:text-green-900"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-staynest-gray-border hover:shadow-lg transition-all duration-300">
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold text-staynest-dark-gray mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-staynest-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            All Hosts <span className="text-staynest-pink ml-2">({hosts.length})</span>
          </h2>
          
          <div className="overflow-x-auto rounded-lg border border-staynest-gray-border">
            <table className="min-w-full divide-y divide-staynest-gray-border">
              <thead className="bg-gradient-to-r from-staynest-background to-white">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">
                    Host Since
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>              <tbody className="bg-white divide-y divide-staynest-gray-border">
                {hosts.map((host) => (
                  <tr key={host._id} className="hover:bg-staynest-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-staynest-background rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-staynest-pink">{host.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-staynest-dark-gray">{host.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-staynest-light-gray">{host.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-staynest-light-gray">{host.hostSince ? formatDate(host.hostSince) : 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-staynest-light-gray">{host.hostInfo?.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-staynest-pink to-pink-500 text-white shadow-sm">
                        Host
                      </span>
                      {host.isAdmin && (
                        <span className="ml-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-sm">
                          Admin
                        </span>
                      )}
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-light-gray">
                      {host.isAdmin ? (
                        <div className="flex items-center">
                          <button
                            disabled={true}
                            className="px-4 py-2 rounded-lg text-white text-xs font-medium bg-gray-300 cursor-not-allowed opacity-70"
                          >
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              Revoke Host
                            </span>
                          </button>
                          <span className="ml-2 text-xs text-gray-500 italic">(Admin protected)</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRevokeClick(host._id, host.name, host.isAdmin)}
                          disabled={actionLoading === host._id}
                          className="group px-4 py-2 rounded-lg text-white text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          {actionLoading === host._id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                              Revoke Host
                            </span>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-staynest backdrop-blur-sm animate-fadeIn">
          <div 
            ref={modalRef}
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all animate-scaleIn"
          >
            <div className="px-6 py-4 border-b border-staynest-gray-border flex justify-between items-center bg-gradient-to-r from-white to-staynest-background">
              <h3 className="text-lg font-bold text-staynest-dark-gray flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Confirm Revocation
              </h3>
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="text-staynest-light-gray hover:text-staynest-dark-gray focus:outline-none transition-colors duration-200 p-1 hover:bg-staynest-background rounded-full"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-6 py-6">
              <div className="py-2">
                <div className="bg-red-50 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-center text-staynest-dark-gray mb-3 text-lg font-medium">
                  Revoke Host Status
                </p>
                <p className="text-center text-staynest-dark-gray mb-4">
                  Are you sure you want to revoke host status for <span className="font-bold text-staynest-pink">{selectedHost?.name}</span>?
                </p>
                <p className="text-center text-sm text-staynest-light-gray bg-staynest-background p-3 rounded-lg border border-staynest-gray-border">
                  This will prevent them from hosting properties and managing their listings. This action cannot be easily undone.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-staynest-gray-border flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2 text-sm font-medium text-staynest-dark-gray bg-white border border-staynest-gray-border rounded-lg hover:bg-staynest-background transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-staynest-gray-border"
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
