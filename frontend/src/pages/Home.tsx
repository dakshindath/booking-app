import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// API URL
const API_URL = 'http://localhost:5000/api';

interface Listing {
  _id: string;
  title: string;
  location: string;
  price: number;
  images: string[];
  description: string;
}

const Home: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
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
      <div className="text-center p-6">
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
  }  return (
    <div className="font-airbnb max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Listings section */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h2 className="text-2xl font-bold text-airbnb-dark-gray mb-4 md:mb-0">Places to stay</h2>
        </div>
        
        {listings.length === 0 ? (
          <div className="text-center p-12 bg-airbnb-background rounded-2xl">
            <svg className="w-16 h-16 mx-auto text-airbnb-light-gray mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-7m-6 0a1 1 0 00-1 1v7" />
            </svg>
            <p className="text-airbnb-dark-gray text-lg font-medium mb-2">No listings found</p>
            <p className="text-airbnb-light-gray mb-6">Try adjusting your search or filters</p>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-airbnb-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors">
              Refresh Results
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {listings.map((listing) => (
              <Link to={`/listings/${listing._id}`} key={listing._id} className="group block relative">
                {/* Card container */}
                <div className="space-y-3">
                  {/* Image carousel */}
                  <div className="relative aspect-square overflow-hidden rounded-2xl">
                    {listing.images && listing.images.length > 0 ? (
                      <>
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title} 
                          className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        />
                        {/* Favorite button */}
                        <button className="absolute top-3 right-3 text-white hover:text-airbnb-pink transition-colors focus:outline-none">
                          <svg className="w-7 h-7 stroke-2 filter drop-shadow-md" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                        {/* Navigation dots for multiple images */}
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
                      <div className="w-full h-full flex items-center justify-center bg-airbnb-background">
                        <span className="text-airbnb-light-gray">No image available</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Listing info */}
                  <div className="space-y-1 px-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-airbnb-dark-gray line-clamp-1">{listing.location}</h3>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-airbnb-dark-gray" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <span className="ml-1 text-airbnb-dark-gray">4.9</span>
                      </div>
                    </div>
                    <p className="text-airbnb-light-gray text-sm line-clamp-1">{listing.title}</p>
                    <p className="text-airbnb-light-gray text-sm">2 nights · Jun 1-3</p>
                    <p className="mt-1">
                      <span className="font-semibold text-airbnb-dark-gray">₹{listing.price.toLocaleString()}</span> 
                      <span className="text-airbnb-dark-gray"> night</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
