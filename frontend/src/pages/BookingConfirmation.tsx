import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

const API_URL = "http://localhost:5000/api";

interface BookingState {
  listingId: string;
  listingTitle: string;
  startDate: Date;
  endDate: Date;
  guests: number;
  totalPrice: number;
}

interface Listing {
  _id: string;
  title: string;
  images: string[];
  avgRating: number;
  reviewsCount: number;
}

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  // Access the booking information passed from the listing details page
  const state = location.state as BookingState;

  // Fetch listing details to get image
  useEffect(() => {
    if (state && state.listingId) {
      const fetchListing = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/listing/${state.listingId}`
          );
          setListing(response.data);
        } catch (err) {
          console.error("Error fetching listing details:", err);
        }
      };

      fetchListing();
    }
  }, [state]);

  if (!state || !state.listingId) {
    return (
      <div className="text-center p-8 font-staynest">
        <svg
          className="w-16 h-16 mx-auto text-staynest-pink mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xl mb-4 text-staynest-dark-gray">
          Booking information not found.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-medium rounded-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const { listingId, listingTitle, startDate, endDate, guests, totalPrice } =
    state;
  const handleConfirmBooking = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/booking`,
        {
          listingId,
          startDate,
          endDate,
          guests,
          totalPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/bookings", {
        state: { success: true, bookingId: response.data._id },
      });
    } catch (err: any) {
      console.error("Booking error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to complete booking. Please try again."
      );
      setLoading(false);
    }
  };
  const nights = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const serviceFee = Math.round(totalPrice * 0.15);
  const cleaningFee = 150;
  const totalWithFees = totalPrice + cleaningFee + serviceFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50 py-8 px-4 font-staynest">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <svg
              className="w-8 h-8 text-white"
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
            Review Your Booking
          </h1>
          <p className="text-gray-600 text-lg">
            Almost there! Please review your booking details before confirming
          </p>
        </div>
        {/* Enhanced Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-red-600"
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
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-red-800 mb-1">
                    Booking Error
                  </h4>
                  <p className="text-red-700">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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
          </div>
        )}{" "}
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Trip Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Trip Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Your Trip Details
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h4 className="font-semibold text-gray-800">Dates</h4>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {format(new Date(startDate), "MMM d")} –{" "}
                    {format(new Date(endDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {nights} {nights === 1 ? "night" : "nights"}
                  </p>
                </div>                <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-6 border border-gray-100">
                  <div className="flex items-center mb-3">
                    <svg
                      className="w-5 h-5 text-green-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <h4 className="font-semibold text-gray-800">Guests</h4>
                  </div>
                  <p className="text-gray-600 font-medium">
                    {guests} {guests === 1 ? "guest" : "guests"}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Payment Information
                </h3>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                    <svg
                      className="w-6 h-6 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Credit or Debit Card
                    </p>
                    <p className="text-sm text-gray-600">
                      We'll charge your card once you confirm
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center justify-between text-gray-700">
                  <span className="font-medium">Exchange Rate:</span>
                  <span className="font-semibold">1 USD = 74.5 INR</span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Cancellation Policy
                </h3>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-green-600 mt-0.5 mr-3 flex-shrink-0"
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
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      <span className="font-semibold text-green-700">
                        Free cancellation
                      </span>{" "}
                      before {format(new Date(startDate), "MMM d, yyyy")}.
                      Cancel before check-in for a partial refund.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>{" "}
          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-8 hover:shadow-2xl transition-shadow">
              {/* Listing Preview */}
              <div className="flex space-x-4 mb-8">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                  <img
                    src={listing?.images?.[0]}
                    alt={listingTitle}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium mb-1">
                    Entire home
                  </p>
                  <h4 className="font-semibold text-gray-800 leading-tight mb-2 line-clamp-2">
                    {listingTitle}
                  </h4>
                  <div className="flex items-center">
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                      <svg
                        className="w-4 h-4 text-yellow-500 mr-1"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>{" "}
                      <span className="text-sm font-semibold text-gray-700">
                        {listing?.avgRating && listing.avgRating > 0
                          ? listing.avgRating.toFixed(1)
                          : "New"}
                      </span>
                    </div>{" "}
                    {listing?.reviewsCount && listing.reviewsCount > 0 && (
                      <>
                        <span className="text-gray-400 mx-2">·</span>
                        <span className="text-sm text-gray-600">
                          {listing.reviewsCount}{" "}
                          {listing.reviewsCount === 1 ? "review" : "reviews"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    Price Details
                  </h4>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-700">
                      ₹{Math.round(totalPrice / nights)} × {nights}{" "}
                      {nights === 1 ? "night" : "nights"}
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                    <span className="text-gray-700">Cleaning fee</span>
                    <span className="font-semibold text-gray-800">
                      ₹{cleaningFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                    <span className="text-gray-700">Service fee</span>
                    <span className="font-semibold text-gray-800">
                      ₹{serviceFee.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                    <span className="text-lg font-bold text-gray-800">
                      Total (INR)
                    </span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                      ₹{totalWithFees.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-4 mt-8">
                <button
                  onClick={handleConfirmBooking}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:hover:scale-100"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    </div>
                  ) : (
                    "Confirm & Pay"
                  )}
                </button>

                <button
                  onClick={() => navigate(-1)}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <div>
                    <p className="text-sm text-green-800 font-medium">
                      Secure Payment
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
