import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface Listing {
  _id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  description: string;
  avgRating: number;
  reviewsCount: number;
}

const Favorites: React.FC = () => {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };        const response = await axios.get(`${API_URL}/favorites`, config);
        // Filter out any null listings with proper type guard
        const validFavorites = response.data.filter((listing: Listing | null): listing is Listing => 
          listing !== null && listing._id != null
        );
        setFavorites(validFavorites);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load your favorite listings. Please try again later.');
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  const handleRemoveFavorite = async (listingId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.delete(`${API_URL}/favorites/${listingId}`, config);
 
      setFavorites(favorites.filter(listing => listing._id !== listingId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove from favorites. Please try again.');
    }
  };

  // Component for a single listing card
  const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
    return (
      <Link to={`/listings/${listing._id}`} className="group block relative">
        <div className="space-y-2">
          {/* Image carousel */}
          <div className="relative aspect-[1/1] sm:aspect-[4/3] overflow-hidden rounded-xl">
            {listing.images && listing.images.length > 0 ? (
              <>
                <img 
                  src={listing.images[0]} 
                  alt={listing.title} 
                  className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                
                <button 
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white bg-opacity-40 backdrop-blur-sm flex items-center justify-center text-staynest-pink transition-colors focus:outline-none"
                  onClick={(e) => handleRemoveFavorite(listing._id, e)}
                >
                  <svg className="w-5 h-5 fill-current drop-shadow-sm" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                {/* Navigation dots */}
                {listing.images.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5">
                    {listing.images.slice(0, 5).map((_, idx) => (
                      <span 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === 0 ? 'bg-white' : 'bg-white/50'}`}
                      ></span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-staynest-background">
                <span className="text-staynest-light-gray">No image available</span>
              </div>
            )}
          </div>
          
        
          <div className="space-y-1 px-0.5">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-staynest-dark-gray line-clamp-1">{listing.title}</h3>
              <div className="flex items-center ml-2 shrink-0">
                <svg className="w-4 h-4 text-staynest-pink" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span className="ml-1 text-staynest-dark-gray">
                  {listing.avgRating > 0 ? listing.avgRating.toFixed(1) : 'New'}
                </span>
              </div>
            </div>
            
            {/* Location with icon */}
            <div className="flex items-center text-staynest-light-gray text-sm">
              <svg className="w-3 h-3 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{listing.location}</span>
            </div>
            
            {/* Description preview */}
            <p className="text-staynest-light-gray text-sm line-clamp-1 mt-0.5">
              {listing.description && listing.description.substring(0, 60)}...
            </p>
            
            {/* Price with emphasis */}
            <p className="mt-1.5 flex items-baseline">
              <span className="font-semibold text-staynest-dark-gray">₹{listing.price.toLocaleString()}</span> 
              <span className="text-staynest-light-gray text-sm ml-1">/night</span>
            </p>
          </div>
        </div>
      </Link>
    );
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
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-gradient-to-r from-staynest-pink to-staynest-red text-white font-medium rounded-lg hover:from-staynest-red hover:to-staynest-pink transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="font-staynest max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-staynest-dark-gray">Your Favorite Listings</h1>
        <p className="mt-2 text-staynest-light-gray">Your saved places all in one spot</p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center p-12 bg-staynest-background rounded-2xl">
          <svg className="w-16 h-16 mx-auto text-staynest-light-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-staynest-dark-gray text-lg font-medium mb-2">No favorites yet</p>
          <p className="text-staynest-light-gray mb-6">Start adding listings to your favorites to see them here</p>
          <Link to="/" className="px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors">
            Explore Listings
          </Link>
        </div>
      ) : (        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
