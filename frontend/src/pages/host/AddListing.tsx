import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { standardAmenities } from '../../data/amenities';

const API_URL = 'http://localhost:5000/api';

interface FormData {
  title: string;
  description: string;
  price: number | string;
  location: string;
  images: string[];
  amenities: string[];
}

const AddListing: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    location: '',
    images: [''],
    amenities: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated and is a host
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Redirect non-host users to home page
    if (user && !user.isHost) {
      navigate('/');
    }
  }, [token, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (index: number, value: string) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = value;
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const addImageField = () => {
    setFormData({
      ...formData,
      images: [...formData.images, '']
    });
  };

  const removeImageField = (index: number) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages.length ? updatedImages : ['']
    });
  };
  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        navigate('/login');
        return;
      }

      // Validate form data
      if (!formData.title || !formData.description || !formData.price || !formData.location) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Filter out empty image and amenity fields
      const images = formData.images.filter(img => img.trim() !== '');
      const amenities = formData.amenities.filter(amenity => amenity.trim() !== '');

      const listingData = {
        ...formData,
        price: Number(formData.price),
        images,
        amenities
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.post(`${API_URL}/listing`, listingData, config);
      
      // Redirect to host dashboard on success
      navigate('/host/dashboard', { 
        state: { 
          listingCreated: true,
          listingId: response.data._id
        } 
      });
    } catch (err: any) {
      console.error('Error creating listing:', err);
      setError(err.response?.data?.message || 'Failed to create listing');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-staynest-dark-gray mb-2">Add New Listing</h1>
      <p className="text-staynest-light-gray mb-8">
        Create a new property listing to share with guests
      </p>

      <div className="bg-white rounded-xl shadow-lg border border-staynest-gray-border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="border-b border-staynest-gray-border pb-6">
            <h2 className="text-xl font-semibold text-staynest-dark-gray mb-4">Basic Information</h2>
            
            <div className="mb-4">
              <label htmlFor="title" className="block text-staynest-dark-gray font-medium mb-2">
                Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink"
                placeholder="Give your place a catchy title"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-staynest-dark-gray font-medium mb-2">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink"
                placeholder="Describe your place in detail"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-staynest-dark-gray font-medium mb-2">
                  Price per night (₹)*
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink"
                  placeholder="Price per night"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-staynest-dark-gray font-medium mb-2">
                  Location*
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink"
                  placeholder="City, State, Country"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="border-b border-staynest-gray-border pb-6">
            <h2 className="text-xl font-semibold text-staynest-dark-gray mb-4">Images</h2>
            <p className="text-staynest-light-gray mb-4">
              Add image URLs for your property. The first image will be used as the main image.
            </p>

            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center mb-3">
                <input
                  type="text"
                  value={image}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  className="flex-grow px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink"
                  placeholder="Image URL"
                />
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={formData.images.length === 1}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addImageField}
              className="mt-2 flex items-center text-staynest-pink hover:text-staynest-red transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Image
            </button>
          </div>          {/* Amenities */}          <div>
            <h2 className="text-xl font-semibold text-staynest-dark-gray mb-4">Amenities</h2>
            <p className="text-staynest-light-gray mb-4">
              Select all the amenities your property offers
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2 border border-staynest-gray-border rounded-lg">
              {standardAmenities.map((amenity) => (                <label key={amenity} className="flex items-center space-x-2 cursor-pointer hover:bg-staynest-background/30 p-2 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                    className="form-checkbox h-4 w-4 text-staynest-pink rounded focus:ring-staynest-pink border-staynest-gray-border"
                  />
                  <span className="text-sm text-staynest-dark-gray">{amenity}</span>
                </label>
              ))}
            </div>
            {formData.amenities.length === 0 && (
              <p className="text-red-500 text-sm mt-2">Please select at least one amenity</p>
            )}
          </div>

          <div className="pt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/host/dashboard')}
              className="px-6 py-3 border border-staynest-gray-border text-staynest-dark-gray font-medium rounded-lg hover:bg-staynest-background mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-medium rounded-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddListing;
