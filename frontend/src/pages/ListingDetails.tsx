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
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-6">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center p-6">
        <p>Listing not found.</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
        <p className="text-gray-600 mb-4">{listing.location}</p>
        
        {/* Image Gallery */}
        <div className="mb-6">
          {listing.images && listing.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.images.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden h-64">
                  <img 
                    src={image} 
                    alt={`${listing.title} - image ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-lg">
              <span className="text-gray-400">No images available</span>
            </div>
          )}
        </div>
        
        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-line">{listing.description}</p>
        </div>
        
        {/* Amenities */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Amenities</h2>
          {listing.amenities && listing.amenities.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {listing.amenities.map((amenity, index) => (
                <li key={index} className="flex items-center">
                  <span className="mr-2">✓</span> {amenity}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No amenities listed</p>
          )}
        </div>
      </div>
      
      {/* Booking Form */}
      <div className="md:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
          <h2 className="text-xl font-semibold mb-4">₹{listing.price} <span className="text-gray-500 text-base">per night</span></h2>
          
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate || new Date()}
                  placeholderText="Select date"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
              ))}
            </select>
          </div>
          
          {totalPrice > 0 && (
            <div className="mb-4 p-4 border-t border-b">
              <div className="flex justify-between mb-2">
                <span>₹{listing.price} × {Math.ceil(((endDate?.getTime() || 0) - (startDate?.getTime() || 0)) / (1000 * 60 * 60 * 24))} nights</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          )}
          
          <button
            onClick={handleBooking}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {user ? 'Book Now' : 'Log in to book'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;
