import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  images: string[];
  amenities: string[];
  availability: Array<{
    start: string;
    end: string;
  }>;
}

const ListingDetails: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [showAllAmenities, setShowAllAmenities] = useState<boolean>(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`${API_URL}/listing/${id}`);
        setListing(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details. Please try again later.');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    if (listing && startDate && endDate) {
      const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      setTotalPrice(nights * listing.price);
    } else {
      setTotalPrice(0);
    }
  }, [listing, startDate, endDate]);

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!startDate || !endDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    // Navigate to booking confirmation with state
    navigate('/booking/confirm', {
      state: {
        listingId: listing?._id,
        listingTitle: listing?.title,
        startDate,
        endDate,
        guests,
        totalPrice
      }
    });
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
          className="px-6 py-3 bg-airbnb-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center p-6 font-airbnb">
        <p className="text-airbnb-dark-gray mb-4">Listing not found.</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-3 bg-airbnb-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="font-airbnb max-w-7xl mx-auto">
      {/* Listing Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-airbnb-dark-gray mb-2">{listing.title}</h1>
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-2 text-airbnb-dark-gray">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-airbnb-pink" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              <span className="ml-1 font-medium">4.96</span>
              <span className="mx-1">·</span>
              <span className="underline">84 reviews</span>
            </div>
            <span className="mx-1">·</span>
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <button className="flex items-center text-airbnb-dark-gray hover:underline">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <button className="flex items-center text-airbnb-dark-gray hover:underline">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Save
            </button>
          </div>
        </div>
      </div>
      
      {/* Image Gallery */}
<div className="mb-8 relative">
  {listing.images && listing.images.length > 0 ? (
    <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden h-[60vh]">
      {/* Main large image (left side) */}
      <div className="col-span-1 row-span-1 h-full relative overflow-hidden">
        <img 
          src={listing.images[0]} 
          alt='img' 
          className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      {/* Right side grid of 4 smaller images */}
      <div className="col-span-1 grid grid-cols-2 grid-rows-2 gap-2 h-full">
        {listing.images.slice(1, 5).map((image, index) => (
          <div key={index + 1} className="relative overflow-hidden">
            <img 
              src={image} 
              alt='img' 
              className="absolute inset-0 w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
        
        {/* If less than 5 images, fill with placeholders */}
        {Array.from({ length: Math.max(0, 5 - listing.images.length) }).map((_, index) => (
          <div key={`placeholder-${index}`} className="bg-airbnb-background" />
        ))}
      </div>
    </div>
  ) : (
    <div className="w-full h-64 flex items-center justify-center bg-airbnb-background rounded-xl">
      <span className="text-airbnb-light-gray">No images available</span>
    </div>
  )}
  
  {/* Show all photos button */}
  {listing.images && listing.images.length > 0 && (
    <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md font-medium text-sm text-airbnb-dark-gray flex items-center hover:shadow-lg transition-shadow">
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
      Show all photos
    </button>
  )}
</div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {/* Host Info */}
          <div className="flex justify-between items-center pb-6 border-b border-airbnb-gray-border mb-6">
            <div>
              <h2 className="text-xl font-semibold text-airbnb-dark-gray">Entire home hosted by John</h2>
              <p className="text-airbnb-light-gray">4 guests · 2 bedrooms · 2 beds · 2 baths</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-gray-300 overflow-hidden">
              <img 
                src="https://avatar.iran.liara.run/username?username=Host" 
                alt="Host" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Amenities highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pb-6 border-b border-airbnb-gray-border">
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 mt-1 text-airbnb-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-airbnb-dark-gray">Self check-in</h3>
                <p className="text-sm text-airbnb-light-gray">Check yourself in with the lockbox.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 mt-1 text-airbnb-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h3 className="font-medium text-airbnb-dark-gray">Great location</h3>
                <p className="text-sm text-airbnb-light-gray">95% of recent guests gave the location a 5-star rating.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 mt-1 text-airbnb-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-medium text-airbnb-dark-gray">Free cancellation</h3>
                <p className="text-sm text-airbnb-light-gray">Cancel before check-in for a partial refund.</p>
              </div>
            </div>
          </div>
            {/* Description */}
          <div className="mb-8 pb-8 border-b border-airbnb-gray-border">
            <div className="text-base text-airbnb-dark-gray whitespace-pre-line">
              <p className={showFullDescription ? "" : "line-clamp-3"}>{listing.description}</p>
            </div>
            <button 
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-4 font-medium text-airbnb-dark-gray underline flex items-center hover:opacity-80"
            >
              {showFullDescription ? "Show less" : "Show more"}
              <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={showFullDescription ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                />
              </svg>
            </button>
          </div>
            {/* Amenities */}
          <div className="mb-8 pb-8 border-b border-airbnb-gray-border">
            <h2 className="text-xl font-semibold mb-4 text-airbnb-dark-gray">What this place offers</h2>
            {listing.amenities && listing.amenities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.amenities.slice(0, showAllAmenities ? listing.amenities.length : 6).map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-5 h-5 mr-4 text-airbnb-dark-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-airbnb-dark-gray">{amenity}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-airbnb-light-gray">No amenities listed</p>
            )}
            {listing.amenities && listing.amenities.length > 6 && (
              <button 
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-6 px-6 py-2 border border-airbnb-dark-gray rounded-lg font-medium text-airbnb-dark-gray hover:bg-gray-50 flex items-center"
              >
                {showAllAmenities ? "Show less amenities" : "Show all amenities"}
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={showAllAmenities ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-white p-6 rounded-xl shadow-airbnb border border-airbnb-gray-border">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-airbnb-dark-gray">₹{listing.price} <span className="text-base font-normal text-airbnb-light-gray">night</span></h2>
              <div className="flex items-center">
                <svg className="w-4 h-4 text-airbnb-pink" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span className="ml-1 text-sm font-medium">4.96</span>
                <span className="text-airbnb-light-gray mx-1">·</span>
                <span className="text-sm text-airbnb-light-gray underline">84 reviews</span>
              </div>
            </div>
            
            <div className="border border-airbnb-gray-border rounded-t-lg overflow-hidden">
              <div className="grid grid-cols-2">
                <div className="p-3 border-r border-b border-airbnb-gray-border">
                  <label className="block text-xs font-semibold text-airbnb-dark-gray mb-1">CHECK-IN</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    placeholderText="Add date"
                    className="w-full border-none p-0 text-sm focus:ring-0 text-airbnb-dark-gray"
                  />
                </div>
                <div className="p-3 border-b border-airbnb-gray-border">
                  <label className="block text-xs font-semibold text-airbnb-dark-gray mb-1">CHECKOUT</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    placeholderText="Add date"
                    className="w-full border-none p-0 text-sm focus:ring-0 text-airbnb-dark-gray"
                  />
                </div>
              </div>
              <div className="p-3">
                <label className="block text-xs font-semibold text-airbnb-dark-gray mb-1">GUESTS</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full border-none p-0 text-sm focus:ring-0 text-airbnb-dark-gray"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={handleBooking}
              className="w-full mt-4 bg-gradient-to-r from-airbnb-pink to-airbnb-red text-white py-3 rounded-lg font-medium hover:from-airbnb-red hover:to-airbnb-pink transition-colors"
            >
              {user ? 'Reserve' : 'Log in to book'}
            </button>
            
            {user && <p className="text-center mt-2 text-sm text-airbnb-light-gray">You won't be charged yet</p>}
            
            {totalPrice > 0 && (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-airbnb-dark-gray">
                  <span className="underline">₹{listing.price} × {Math.ceil(((endDate?.getTime() || 0) - (startDate?.getTime() || 0)) / (1000 * 60 * 60 * 24))} nights</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-airbnb-dark-gray">
                  <span className="underline">Service fee</span>
                  <span>₹{Math.round(totalPrice * 0.15)}</span>
                </div>
                <div className="pt-4 mt-4 border-t border-airbnb-gray-border flex justify-between font-semibold text-airbnb-dark-gray">
                  <span>Total before taxes</span>
                  <span>₹{totalPrice + Math.round(totalPrice * 0.15)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
