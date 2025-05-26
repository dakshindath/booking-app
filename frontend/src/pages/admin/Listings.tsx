import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { standardAmenities } from "../../data/amenities";

const API_URL = "http://localhost:5000/api";

interface Listing {
  _id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  description: string;
  amenities: string[];
  bookingCount?: number;
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
    title: "",
    location: "",
    price: "",
    description: "",
    amenities: [],
    imageUrl: "",
    images: [],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError("Failed to load listings. Please try again later.");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For price field, store as string to maintain the input value as typed
    if (name === "price") {
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
        imageUrl: "",
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
      title: "",
      location: "",
      price: "",
      description: "",
      amenities: [],
      imageUrl: "",
      images: [],
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
      imageUrl: "",
      images: [...listing.images],
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
      images: formData.images,
    };

    try {
      if (editingListing) {
        // Update existing listing
        await axios.put(
          `${API_URL}/admin/listing/${editingListing._id}`,
          listingData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFormSuccess("Listing updated successfully");
      } else {
        // Create new listing
        await axios.post(`${API_URL}/admin/listing`, listingData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormSuccess("Listing created successfully");
      }

      // Fetch updated listings
      fetchListings();

      // Reset form after a short delay
      setTimeout(() => {
        closeForm();
      }, 2000);
    } catch (err: any) {
      console.error("Error saving listing:", err);
      setFormError(err.response?.data?.message || "Failed to save listing");
    }
  };

  const handleDeleteClick = (listing: Listing) => {
    setDeletingListing(listing);
    setShowDeleteModal(true);
  };
  const handleDeleteConfirm = async () => {
    if (!deletingListing) return;

    try {
      await axios.delete(`${API_URL}/admin/listing/${deletingListing._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the listings state
      setListings(
        listings.filter((listing) => listing._id !== deletingListing._id)
      );
      setShowDeleteModal(false);
      setDeletingListing(null);

      // Set success message
      setFormSuccess("Listing deleted successfully");
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (err: any) {
      console.error("Error deleting listing:", err);
      setFormError(
        err.response?.data?.message ||
          "Failed to delete listing. Please try again."
      );
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
      <div className="font-staynest max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-transparent rounded-lg w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="md:flex">
                <div className="md:w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                <div className="flex-grow p-6 space-y-4">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-transparent rounded w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-transparent rounded w-1/2"></div>
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-transparent rounded w-32"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-transparent rounded-full w-16"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-transparent rounded-full w-20"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-transparent rounded-full w-14"></div>
                  </div>
                </div>
                <div className="md:w-48 p-6 space-y-3">
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-transparent rounded"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-transparent rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 font-staynest">
        <svg
          className="w-16 h-16 mx-auto text-staynest-pink mb-4"
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
    <div className="font-staynest max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-staynest-pink/5 to-staynest-red/5 rounded-2xl p-8 mb-8 border border-staynest-pink/10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-staynest-dark-gray mb-2">
              Property Listings
            </h1>
            <p className="text-staynest-light-gray text-lg">
              Manage and oversee all property listings on the platform
            </p>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-staynest-dark-gray font-medium">
                  {listings.length} Total Listings
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={openCreateForm}
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-semibold rounded-xl hover:from-staynest-red hover:to-staynest-pink transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg
              className="w-5 h-5 mr-3 transition-transform group-hover:rotate-90 duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add New Listing
          </button>
        </div>
      </div>{" "}
      {listings.length === 0 ? (
        <div className="text-center py-20 bg-gradient-to-br from-white to-staynest-background/30 rounded-2xl shadow-lg border-2 border-dashed border-staynest-pink/20">
          <div className="max-w-md mx-auto">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-staynest-pink/10 to-staynest-red/10 rounded-full"></div>
              </div>
              <svg
                className="w-16 h-16 mx-auto text-staynest-pink relative z-10 mt-4"
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
            <h3 className="text-2xl font-bold text-staynest-dark-gray mb-3">
              No Properties Yet
            </h3>
            <p className="text-staynest-light-gray text-lg mb-8 leading-relaxed">
              Start building your property portfolio by creating your first
              listing. Showcase amazing places for travelers to discover.
            </p>
            <button
              onClick={openCreateForm}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-semibold rounded-xl hover:from-staynest-red hover:to-staynest-pink transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5 mr-3 transition-transform group-hover:rotate-90 duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Create Your First Listing
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 mb-10">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-staynest-gray-border/50 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="md:flex">
                {/* Enhanced Image Section */}
                <div className="md:w-56 h-56 md:h-56 relative flex-shrink-0 bg-gradient-to-br from-staynest-background to-staynest-pink/10 overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <div className="h-full w-full relative">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                      {/* Image overlay with gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Image count indicator */}
                      {listing.images.length > 1 && (
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                          <svg
                            className="w-3 h-3 inline mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {listing.images.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-staynest-background to-staynest-pink/5">
                      <div className="text-center">
                        <svg
                          className="w-12 h-12 text-staynest-light-gray mx-auto mb-2"
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
                        <span className="text-xs text-staynest-light-gray">
                          No Image
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Content Section */}
                <div className="flex-grow p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-staynest-dark-gray group-hover:text-staynest-pink transition-colors duration-300 leading-tight">
                        {listing.title}
                      </h3>
                    </div>

                    <div className="flex items-center text-staynest-light-gray mb-3">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="text-sm">{listing.location}</span>
                    </div>

                    <div className="flex items-center mb-4">
                      <span className="text-2xl font-bold text-staynest-dark-gray">
                        ₹{listing.price.toLocaleString()}
                      </span>
                      <span className="text-staynest-light-gray ml-2">
                        / night
                      </span>
                    </div>

                    {/* Enhanced Amenities */}
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.slice(0, 4).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-staynest-pink/10 to-staynest-red/10 text-staynest-dark-gray border border-staynest-pink/20 hover:from-staynest-pink/20 hover:to-staynest-red/20 transition-colors"
                        >
                          {amenity}
                        </span>
                      ))}
                      {listing.amenities.length > 4 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-staynest-light-gray/20 text-staynest-light-gray border border-staynest-light-gray/30">
                          +{listing.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Section */}
                <div className="md:w-52 flex-shrink-0 p-6 md:border-l md:border-staynest-gray-border/30 bg-gradient-to-b from-white to-staynest-background/20">
                  <div className="flex flex-col gap-3 h-full justify-center">
                    <button
                      onClick={() => openEditForm(listing)}
                      className="group/btn w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-staynest-pink/10 to-staynest-red/10 text-staynest-pink border border-staynest-pink/30 rounded-xl hover:from-staynest-pink hover:to-staynest-red hover:text-white transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <svg
                        className="w-4 h-4 mr-2 transition-transform group-hover/btn:rotate-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit Listing
                    </button>

                    <button
                      onClick={() => handleDeleteClick(listing)}
                      className="group/btn w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300 text-sm font-semibold shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <svg
                        className="w-4 h-4 mr-2 transition-transform group-hover/btn:scale-110"
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
                      Delete
                    </button>

                    {/* Property stats */}
                    <div className="mt-3 pt-3 border-t border-staynest-gray-border/30">
                      <div className="text-xs text-staynest-light-gray text-center">
                        {" "}
                        <div className="flex justify-between items-center mt-1">
                          <span>Bookings</span>
                          <span className="font-medium text-green-600">
                            {listing.bookingCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}        </div>
      )}
      {/* Enhanced Listing Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-staynest-pink/5 to-staynest-red/5 px-8 py-6 border-b border-staynest-gray-border/30">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-staynest-dark-gray">
                    {editingListing
                      ? "Edit Property Listing"
                      : "Create New Property Listing"}
                  </h2>
                  <p className="text-staynest-light-gray mt-1">
                    {editingListing
                      ? "Update your property details"
                      : "Add a new property to your portfolio"}
                  </p>
                </div>
                <button
                  onClick={closeForm}
                  className="p-2 text-staynest-light-gray hover:text-staynest-dark-gray hover:bg-white/50 rounded-xl transition-all duration-200 group"
                >
                  <svg
                    className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200"
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
            </div>

            {/* Modal Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              {" "}
              {/* Enhanced Alert Messages */}
              {formError && (
                <div className="bg-gradient-to-r from-red-50 to-red-50/70 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start shadow-sm">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 mr-3 mt-0.5 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                    <h4 className="font-medium mb-1">Error occurred</h4>
                    <span className="text-sm">{formError}</span>
                  </div>
                </div>
              )}
              {formSuccess && (
                <div className="bg-gradient-to-r from-green-50 to-green-50/70 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-start shadow-sm">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 mr-3 mt-0.5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Success!</h4>
                    <span className="text-sm">{formSuccess}</span>
                  </div>                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gradient-to-r from-staynest-background/30 to-white p-6 rounded-xl border border-staynest-gray-border/20">
                  <h3 className="text-lg font-semibold text-staynest-dark-gray mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-staynest-pink"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {" "}
                    <div className="group">
                      <label className="flex items-center text-sm font-semibold mb-3 text-staynest-dark-gray">
                        <svg
                          className="w-4 h-4 mr-2 text-staynest-pink"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        Property Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-staynest-gray-border rounded-xl focus:outline-none focus:ring-2 focus:ring-staynest-pink/50 focus:border-staynest-pink transition-all duration-200 group-hover:border-staynest-pink/50"
                        placeholder="e.g., Luxury Beachfront Villa with Ocean View"
                        required
                      />
                    </div>{" "}
                    <div className="group">
                      <label className="flex items-center text-sm font-semibold mb-3 text-staynest-dark-gray">
                        <svg
                          className="w-4 h-4 mr-2 text-staynest-pink"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-staynest-gray-border rounded-xl focus:outline-none focus:ring-2 focus:ring-staynest-pink/50 focus:border-staynest-pink transition-all duration-200 group-hover:border-staynest-pink/50"
                        placeholder="e.g., Goa, India"
                        required
                      />
                    </div>
                  </div>{" "}
                  <div className="mt-6 group">
                    <label className="flex items-center text-sm font-semibold mb-3 text-staynest-dark-gray">
                      <svg
                        className="w-4 h-4 mr-2 text-staynest-pink"
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
                      Price per night (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-staynest-light-gray font-medium">
                        ₹
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleNumberInputChange}
                        className="w-full pl-8 pr-4 py-3 border border-staynest-gray-border rounded-xl focus:outline-none focus:ring-2 focus:ring-staynest-pink/50 focus:border-staynest-pink transition-all duration-200 group-hover:border-staynest-pink/50"
                        placeholder="5000"
                        required
                      />
                    </div>
                  </div>
                </div>{" "}
                {/* Description Section */}
                <div className="bg-gradient-to-r from-white to-staynest-background/30 p-6 rounded-xl border border-staynest-gray-border/20">
                  <h3 className="text-lg font-semibold text-staynest-dark-gray mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-staynest-pink"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Property Description
                  </h3>
                  <div className="group">
                    <label className="block text-sm font-semibold mb-3 text-staynest-dark-gray">
                      Tell guests what makes your property special
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-staynest-gray-border rounded-xl focus:outline-none focus:ring-2 focus:ring-staynest-pink/50 focus:border-staynest-pink transition-all duration-200 group-hover:border-staynest-pink/50 h-40 resize-none"
                      placeholder="Describe your property's unique features, amenities, and what makes it a perfect place to stay. Include details about the location, nearby attractions, and any special experiences guests can enjoy..."
                      required
                    ></textarea>
                    <div className="mt-2 text-xs text-staynest-light-gray">
                      Tip: Include details about location, nearby attractions,
                      and what makes your property unique
                    </div>
                  </div>
                </div>
                {/* Amenities Section */}
                <div className="bg-gradient-to-r from-staynest-background/30 to-white p-6 rounded-xl border border-staynest-gray-border/20">
                  <h3 className="text-lg font-semibold text-staynest-dark-gray mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-staynest-pink"
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
                    Property Amenities
                    <span className="ml-auto text-sm font-normal text-staynest-light-gray">
                      {formData.amenities.length} selected
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-4 bg-white rounded-xl border border-staynest-gray-border/30">
                    {standardAmenities.map((amenity) => (
                      <label
                        key={amenity}
                        className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                          formData.amenities.includes(amenity)
                            ? "bg-gradient-to-r from-staynest-pink/10 to-staynest-red/10 border border-staynest-pink/30 text-staynest-dark-gray"
                            : "hover:bg-staynest-background/50 border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={(e) => {
                            const updatedAmenities = e.target.checked
                              ? [...formData.amenities, amenity]
                              : formData.amenities.filter((a) => a !== amenity);
                            setFormData({
                              ...formData,
                              amenities: updatedAmenities,
                            });
                          }}
                          className="form-checkbox h-4 w-4 text-staynest-pink rounded focus:ring-staynest-pink border-staynest-gray-border"
                        />
                        <span className="text-sm font-medium text-staynest-dark-gray">
                          {amenity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>{" "}
                {/* Images Section */}
                <div className="bg-gradient-to-r from-white to-staynest-background/30 p-6 rounded-xl border border-staynest-gray-border/20">
                  <h3 className="text-lg font-semibold text-staynest-dark-gray mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-staynest-pink"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Property Images
                    <span className="ml-auto text-sm font-normal text-staynest-light-gray">
                      {formData.images.length} image
                      {formData.images.length !== 1 ? "s" : ""} added
                    </span>
                  </h3>

                  <div className="group">
                    <label className="block text-sm font-semibold mb-3 text-staynest-dark-gray">
                      Add image URL
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        className="flex-grow px-4 py-3 border border-staynest-gray-border rounded-xl focus:outline-none focus:ring-2 focus:ring-staynest-pink/50 focus:border-staynest-pink transition-all duration-200 group-hover:border-staynest-pink/50"
                        placeholder="https://example.com/image.jpg"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white rounded-xl hover:from-staynest-red hover:to-staynest-pink transition-all duration-300 shadow-sm hover:shadow-md font-semibold flex items-center"
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Add
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-staynest-light-gray">
                      Add high-quality images that showcase your property's best
                      features
                    </div>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative group rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-32 bg-staynest-background"
                        >                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/200x150?text=Invalid+Image";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            {index + 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-white text-red-600 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md hover:bg-red-50 hover:scale-110"
                          >
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
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Enhanced Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-staynest-gray-border/30">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="px-8 py-3 border border-staynest-gray-border text-staynest-dark-gray rounded-xl hover:bg-staynest-background/50 transition-all duration-300 font-semibold flex items-center justify-center"
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white rounded-xl hover:from-staynest-red hover:to-staynest-pink transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center transform hover:-translate-y-0.5"
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
                        d={
                          editingListing
                            ? "M5 13l4 4L19 7"
                            : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                        }
                      />
                    </svg>
                    {editingListing ? "Update Property" : "Create Property"}
                  </button>
                </div>
              </form>
            </div>
          </div>        </div>
      )}
      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-slideUp overflow-hidden">
            <div className="p-8">
              {/* Close button */}
              <button
                onClick={handleDeleteCancel}
                className="absolute top-4 right-4 text-staynest-light-gray hover:text-staynest-dark-gray hover:bg-staynest-background/50 rounded-xl p-2 transition-all duration-200 group"
              >
                <svg
                  className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200"
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

              {/* Warning Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-100 rounded-full animate-ping"></div>
                  <div className="relative bg-gradient-to-r from-red-50 to-red-100 rounded-full p-4">
                    <svg
                      className="w-8 h-8 text-red-600"
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
                </div>
              </div>

              {/* Modal Content */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-staynest-dark-gray mb-3">
                  Delete Property
                </h3>
                <p className="text-staynest-light-gray mb-2 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-staynest-dark-gray">
                    "{deletingListing?.title}"
                  </span>
                  ?
                </p>
                <p className="text-sm text-red-600 mb-8 bg-red-50 p-3 rounded-lg border border-red-200">
                  ⚠️ This action cannot be undone and will permanently remove
                  the listing from the platform.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDeleteCancel}
                    className="flex-1 px-6 py-3 text-staynest-dark-gray border border-staynest-gray-border rounded-xl hover:bg-staynest-background/50 transition-all duration-300 font-semibold flex items-center justify-center"
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
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center transform hover:-translate-y-0.5"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Listings;
