import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

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

const Listings: React.FC = () => {
  const { token } = useAuth();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for creating/editing listings
  const [showForm, setShowForm] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    description: '',
    amenities: '',
    imageUrl: '',
    images: [] as string[]
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
    setFormData({ ...formData, [name]: value });
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
      amenities: '',
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
      amenities: listing.amenities.join(', '),
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
      amenities: formData.amenities.split(',').map(item => item.trim()).filter(item => item),
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
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await axios.delete(
          `${API_URL}/admin/listing/${id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        // Update the listings state
        setListings(listings.filter(listing => listing._id !== id));
      } catch (err) {
        console.error('Error deleting listing:', err);
        alert('Failed to delete listing');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-airbnb">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-airbnb-gray-border h-10 w-10"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-airbnb-gray-border rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-airbnb-gray-border rounded"></div>
              <div className="h-4 bg-airbnb-gray-border rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center p-6 font-airbnb">
        <svg className="w-16 h-16 mx-auto text-airbnb-pink mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-airbnb-dark-gray mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-gradient-to-r from-airbnb-pink to-airbnb-red text-white font-medium rounded-lg hover:from-airbnb-red hover:to-airbnb-pink transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="font-airbnb max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-semibold text-airbnb-dark-gray">Manage Listings</h1>
        <button
          onClick={openCreateForm}
          className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-airbnb-pink to-airbnb-red text-white font-medium rounded-lg hover:from-airbnb-red hover:to-airbnb-pink transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Listing
        </button>
      </div>
      
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-airbnb border border-airbnb-gray-border">
          <svg className="w-16 h-16 mx-auto text-airbnb-light-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-airbnb-dark-gray font-medium mb-2">No listings found</p>
          <p className="text-airbnb-light-gray mb-6">Create your first property listing</p>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-airbnb-pink to-airbnb-red text-white font-medium rounded-lg hover:from-airbnb-red hover:to-airbnb-pink transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 mb-10">
          {listings.map((listing) => (            <div key={listing._id} className="bg-white rounded-xl shadow-sm hover:shadow-airbnb transition-shadow border border-airbnb-gray-border overflow-hidden">
              <div className="md:flex">
                <div className="md:w-48 h-48 md:h-48 relative flex-shrink-0 bg-airbnb-background overflow-hidden">
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
                    <div className="w-full h-full flex items-center justify-center bg-airbnb-background">
                      <svg className="w-10 h-10 text-airbnb-light-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>              <div className="flex-grow px-6 py-4">
                <h3 className="text-lg font-semibold text-airbnb-dark-gray">{listing.title}</h3>
                <p className="text-airbnb-light-gray mb-2">{listing.location}</p>
                <p className="text-airbnb-dark-gray font-medium">₹{listing.price.toLocaleString()} / night</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {listing.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-airbnb-background text-airbnb-dark-gray">
                      {amenity}
                    </span>
                  ))}
                  {listing.amenities.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-airbnb-background text-airbnb-dark-gray">
                      +{listing.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="md:w-48 flex-shrink-0 flex flex-row md:flex-col gap-2 p-4 md:p-6 md:border-l md:border-airbnb-gray-border bg-white">
                <button
                  onClick={() => openEditForm(listing)}
                  className="flex-1 py-1 px-1 md:px-0 text-airbnb-pink border border-airbnb-pink rounded-lg hover:bg-airbnb-pink hover:text-white transition-colors text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(listing._id)}
                  className="flex-1 py-1 px-1 md:px-0 text-airbnb-light-gray border border-airbnb-light-gray rounded-lg hover:bg-airbnb-light-gray hover:text-white transition-colors text-sm font-medium"
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
          <div className="bg-white rounded-xl shadow-airbnb w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-airbnb-dark-gray">
                  {editingListing ? 'Edit Listing' : 'Create New Listing'}
                </h2>
                <button
                  onClick={closeForm}
                  className="text-airbnb-light-gray hover:text-airbnb-dark-gray transition-colors"
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
                    <label className="block text-sm font-medium mb-2 text-airbnb-dark-gray">Listing Title</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
                      placeholder="Enter property title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-airbnb-dark-gray">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
                      placeholder="Enter location"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-airbnb-dark-gray">Price per night (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberInputChange}
                    className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
                    placeholder="0.00"
                    // min="0"
                    // step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-airbnb-dark-gray">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink h-32"
                    placeholder="Describe your property"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-airbnb-dark-gray">Amenities (comma-separated)</label>
                  <input
                    type="text"
                    name="amenities"
                    value={formData.amenities}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
                    placeholder="WiFi, Kitchen, Pool, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-airbnb-dark-gray">Images</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="flex-grow px-4 py-3 border border-r-0 border-airbnb-gray-border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
                      placeholder="Enter image URL"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-4 py-3 bg-gradient-to-r from-airbnb-pink to-airbnb-red text-white rounded-r-lg hover:from-airbnb-red hover:to-airbnb-pink transition-colors"
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
                            className="absolute top-2 right-2 bg-white text-airbnb-red rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
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
                
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-airbnb-gray-border">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-6 py-3 border border-airbnb-gray-border text-airbnb-dark-gray rounded-lg hover:bg-airbnb-background transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-airbnb-pink to-airbnb-red text-white rounded-lg hover:from-airbnb-red hover:to-airbnb-pink transition-colors"
                  >
                    {editingListing ? 'Save Changes' : 'Create Listing'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Listings;
