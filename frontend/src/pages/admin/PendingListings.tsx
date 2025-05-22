import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface ListingHost {
  _id: string;
  name: string;
  email: string;
}

interface PendingListing {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  amenities: string[];
  host: ListingHost;
  createdAt: string;
  status: string;
}

const AdminPendingListings: React.FC = () => {
  const { token } = useAuth();
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingListings();
  }, [token]);

  const fetchPendingListings = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }      };

      const response = await axios.get(`${API_URL}/admin/listings/pending`, config);
      setListings(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pending listings:', err);
      setError('Failed to load pending listings. Please try again.');
      setLoading(false);
    }
  };

  const openRejectModal = (listing: PendingListing) => {
    setSelectedListing(listing);
    setRejectionReason('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedListing(null);
  };

  const handleListingAction = async (listingId: string, approve: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [listingId]: true }));
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }      };

      await axios.post(
        `${API_URL}/admin/listing/review`, 
        { 
          listingId, 
          approve,
          rejectionReason: approve ? '' : rejectionReason 
        }, 
        config
      );

      // Remove the listing from the list
      setListings(listings.filter(listing => listing._id !== listingId));
      
      setActionLoading(prev => ({ ...prev, [listingId]: false }));
      closeModal();
    } catch (err) {
      console.error('Error processing listing:', err);
      setActionLoading(prev => ({ ...prev, [listingId]: false }));
      alert('Failed to process listing. Please try again.');
    }
  };

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
          onClick={fetchPendingListings}
          className="px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-staynest-dark-gray mb-6">Pending Listings</h1>
      
      {listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-staynest-light-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-staynest-dark-gray text-lg font-medium mb-2">No Pending Listings</p>
          <p className="text-staynest-light-gray">There are no listings awaiting approval at this time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-staynest-gray-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-staynest-gray-border">
              <thead className="bg-staynest-background">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Listing
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Host
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Date Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-staynest-gray-border">
                {listings.map((listing) => (
                  <tr key={listing._id} className="hover:bg-staynest-background/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {listing.images && listing.images.length > 0 ? (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title} 
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-staynest-background"></div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-staynest-dark-gray">
                            {listing.title}
                          </div>
                          <div className="text-sm text-staynest-light-gray truncate max-w-xs">
                            {listing.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>                    <td className="px-6 py-4">
                      <div className="text-sm text-staynest-dark-gray">
                        {listing.host?.name || 'Unknown Host'}
                      </div>
                      <div className="text-sm text-staynest-light-gray">
                        {listing.host?.email || 'No email available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-dark-gray">
                      ₹{listing.price}/night
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-light-gray">
                      {listing.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-light-gray">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleListingAction(listing._id, true)}
                        disabled={actionLoading[listing._id]}
                        className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[listing._id] ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => openRejectModal(listing)}
                        disabled={actionLoading[listing._id]}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[listing._id] ? 'Processing...' : 'Reject'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {modalOpen && selectedListing && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-staynest-light-gray hover:text-staynest-dark-gray"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-bold text-staynest-dark-gray mb-4">
              Reject Listing
            </h3>
            <p className="text-staynest-light-gray mb-4">
              Please provide a reason for rejecting "{selectedListing.title}"
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter a reason for rejection that will be shared with the host"
              rows={4}
              className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink mb-4"
              required
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-staynest-gray-border text-staynest-dark-gray font-medium rounded-lg hover:bg-staynest-background"
              >
                Cancel
              </button>
              <button
                onClick={() => handleListingAction(selectedListing._id, false)}
                disabled={!rejectionReason.trim() || actionLoading[selectedListing._id]}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading[selectedListing._id] ? 'Processing...' : 'Reject Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingListings;
