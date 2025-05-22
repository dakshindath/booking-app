import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { standardAmenities } from '../../data/amenities';

const API_URL = 'http://localhost:5000/api';

interface Listing {
  _id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  description: string;
  amenities: string[];
}

interface FormData {
  title: string;
  location: string;
  price: string;
  description: string;
  amenities: string[];
  imageUrl: string;
  images: string[];
}

const Listings: React.FC = () => {
  const { token } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  
  // Form state for creating/editing listings
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    location: '',
    price: '',
    description: '',
    amenities: [],
    imageUrl: '',
    images: []
  });
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    fetchListings();
  }, [token]);
  
  const fetchListings = async () => {
    try {
      const response = await axios.get(`${API_URL}/listings`);
      setListings(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('Failed to load listings. Please try again later.');
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For price field, store as string to maintain the input value as typed
    if (name === 'price') {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    }
  };
  
  const handleAddImage = () => {
    if (formData.imageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, formData.imageUrl.trim()],
        imageUrl: ''
      });
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
  };
    const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      price: '',
      description: '',
      amenities: [],
      imageUrl: '',
      images: []
    });
    setEditingListing(null);
  };
  
  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };
  
  const openEditForm = (listing: Listing) => {
    setEditingListing(listing);
    setFormData({
      title: listing.title,
      location: listing.location,
      price: listing.price.toString(),
      description: listing.description,
      amenities: listing.amenities,
      imageUrl: '',
      images: [...listing.images]
    });
    setShowForm(true);
  };
  
  const closeForm = () => {
    setShowForm(false);
    resetForm();
    setFormError(null);
    setFormSuccess(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    const listingData = {
      title: formData.title,
      location: formData.location,
      price: Number(formData.price),
      description: formData.description,
      amenities: formData.amenities,
      images: formData.images
    };
    
    try {
      if (editingListing) {
        // Update existing listing
        await axios.put(
          `${API_URL}/admin/listing/${editingListing._id}`,
          listingData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setFormSuccess('Listing updated successfully');
      } else {
        // Create new listing
        await axios.post(
          `${API_URL}/admin/listing`,
          listingData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setFormSuccess('Listing created successfully');
      }
      
      // Fetch updated listings
      fetchListings();
      
      // Reset form after a short delay
      setTimeout(() => {
        closeForm();
      }, 2000);
    } catch (err: any) {
      console.error('Error saving listing:', err);
      setFormError(err.response?.data?.message || 'Failed to save listing');
    }
  };
  
  const handleDeleteClick = (listing: Listing) => {
    setDeletingListing(listing);
    setShowDeleteModal(true);
  };
  const handleDeleteConfirm = async () => {
    if (!deletingListing) return;
    
    try {
      await axios.delete(
        `${API_URL}/admin/listing/${deletingListing._id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Update the listings state
      setListings(listings.filter(listing => listing._id !== deletingListing._id));
      setShowDeleteModal(false);
      setDeletingListing(null);
      
      // Set success message
      setFormSuccess('Listing deleted successfully');
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting listing:', err);
      setFormError(err.response?.data?.message || 'Failed to delete listing. Please try again.');
      setShowDeleteModal(false);
      setDeletingListing(null);
      
      // Clear error message after 3 seconds
      setTimeout(() => setFormError(null), 3000);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingListing(null);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-staynest">
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
      <div className="text-center p-6 font-staynest">
        <svg className="w-16 h-16 mx-auto text-staynest-pink mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-staynest-dark-gray mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-medium rounded-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="font-staynest max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-semibold text-staynest-dark-gray">Manage Listings</h1>
        <button
          onClick={openCreateForm}
          className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-medium rounded-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Listing
        </button>
      </div>
      
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-staynest border border-staynest-gray-border">
          <svg className="w-16 h-16 mx-auto text-staynest-light-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-staynest-dark-gray font-medium mb-2">No listings found</p>
          <p className="text-staynest-light-gray mb-6">Create your first property listing</p>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-medium rounded-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-10">
          {listings.map((listing) => (            <div key={listing._id} className="bg-white rounded-xl shadow-sm hover:shadow-staynest transition-shadow border border-staynest-gray-border overflow-hidden">
              <div className="md:flex">
                <div className="md:w-48 h-48 md:h-48 relative flex-shrink-0 bg-staynest-background overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <div className="h-full w-full">
                      <img 
                        src={listing.images[0]} 
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-staynest-background">
                      <svg className="w-10 h-10 text-staynest-light-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>              <div className="flex-grow px-6 py-4">
                <h3 className="text-lg font-semibold text-staynest-dark-gray">{listing.title}</h3>
                <p className="text-staynest-light-gray mb-2">{listing.location}</p>
                <p className="text-staynest-dark-gray font-medium">₹{listing.price.toLocaleString()} / night</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {listing.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-staynest-background text-staynest-dark-gray">
                      {amenity}
                    </span>
                  ))}
                  {listing.amenities.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-staynest-background text-staynest-dark-gray">
                      +{listing.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="md:w-48 flex-shrink-0 flex flex-row md:flex-col gap-2 p-4 md:p-6 md:border-l md:border-staynest-gray-border bg-white">
                <button
                  onClick={() => openEditForm(listing)}
                  className="flex-1 py-1 px-1 md:px-0 text-staynest-pink border border-staynest-pink rounded-lg hover:bg-staynest-pink hover:text-white transition-colors text-sm font-medium"
                >
                  Edit
                </button>                <button
                  onClick={() => handleDeleteClick(listing)}
                  className="flex-1 py-1 px-1 md:px-0 text-staynest-light-gray border border-staynest-light-gray rounded-lg hover:bg-staynest-light-gray hover:text-white transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Listing Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-staynest w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-staynest-dark-gray">
                  {editingListing ? 'Edit Listing' : 'Create New Listing'}
                </h2>
                <button
                  onClick={closeForm}
                  className="text-staynest-light-gray hover:text-staynest-dark-gray transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formError}</span>
                </div>
              )}
              
              {formSuccess && (
                <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-lg mb-6 flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{formSuccess}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-staynest-dark-gray">Listing Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-staynest-pink"
                      placeholder="Enter property title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-staynest-dark-gray">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-staynest-pink"
                      placeholder="Enter location"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-staynest-dark-gray">Price per night</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberInputChange}
                    className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-staynest-pink"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-staynest-dark-gray">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-staynest-pink h-32"
                    placeholder="Describe your property"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-staynest-dark-gray">Amenities</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 border border-staynest-gray-border rounded-lg">
                    {standardAmenities.map((amenity) => (
                      <label key={amenity} className="flex items-center space-x-2 cursor-pointer hover:bg-staynest-background/30 p-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={(e) => {
                            const updatedAmenities = e.target.checked
                              ? [...formData.amenities, amenity]
                              : formData.amenities.filter((a) => a !== amenity);
                            setFormData({ ...formData, amenities: updatedAmenities });
                          }}
                          className="form-checkbox h-4 w-4 text-staynest-pink rounded focus:ring-staynest-pink"
                        />
                        <span className="text-sm text-staynest-dark-gray">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-staynest-dark-gray">Images</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="flex-grow px-4 py-3 border border-r-0 border-staynest-gray-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-staynest-pink"
                      placeholder="Enter image URL"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-4 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white rounded-r-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
                    >
                      Add
                    </button>
                  </div>
                    {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm h-24">
                          <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-white text-staynest-red rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-staynest-gray-border">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-6 py-3 border border-staynest-gray-border text-staynest-dark-gray rounded-lg hover:bg-staynest-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white rounded-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
                  >
                    {editingListing ? 'Save Changes' : 'Create Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
        {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-staynest w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-staynest-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <button
                onClick={handleDeleteCancel}
                className="absolute top-4 right-4 text-staynest-light-gray hover:text-staynest-dark-gray"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-xl font-semibold text-center text-staynest-dark-gray mb-2">
                Delete Listing
              </h3>
              <p className="text-center text-staynest-light-gray mb-6">
                Are you sure you want to delete <span className="font-medium">"{deletingListing?.title}"</span>? This action cannot be undone and will permanently remove the listing.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDeleteCancel}
                  className="flex-1 py-3 text-staynest-dark-gray border border-staynest-gray-border rounded-lg hover:bg-staynest-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors"
                >
                  Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Listings;
