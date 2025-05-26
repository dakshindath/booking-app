import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const scrollbarHideStyles = `
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;

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

const Home: React.FC = () => {  
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [topRatedListings, setTopRatedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleListings, setVisibleListings] = useState<number>(8);  
  const [favorites, setFavorites] = useState<{ [key: string]: boolean }>({});
  const { token } = useAuth();
  const location = useLocation();
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const locationParam = searchParams.get('location');
        
        let url = `${API_URL}/listings`;
        if (locationParam) {
          url = `${API_URL}/listings?location=${encodeURIComponent(locationParam)}`;
        }
        
        const response = await axios.get(url);
        const fetchedListings = response.data;
        
        setAllListings(fetchedListings);
        
        // Create featured listings (random selection)
        const randomListings = [...fetchedListings].sort(() => 0.5 - Math.random()).slice(0, 8);
        setFeaturedListings(randomListings);
          // Create top-rated listings
        const topRated = [...fetchedListings]
          .filter(listing => listing.avgRating > 0)
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 8);
        setTopRatedListings(topRated);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  // Fetch favorite listings
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;
      
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };        const response = await axios.get(`${API_URL}/favorites`, config);
        const favoritesMap: { [key: string]: boolean } = {};
        
        // Filter out null values and ensure proper typing
        const validListings = response.data.filter((listing: Listing | null): listing is Listing => 
          listing !== null && listing._id != null
        );
        
        validListings.forEach((listing: Listing) => {
          favoritesMap[listing._id] = true;
        });
        
        setFavorites(favoritesMap);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };
    
    fetchFavorites();
  }, [token]);

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
  }  // Component for a single listing card
  const ListingCard: React.FC<{ listing: Listing }> = ({ listing }) => {
    const { token } = useAuth();
    const isFavorite = favorites[listing._id] || false;

    const toggleFavorite = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!token) {
        // Redirect to login if not logged in
        window.location.href = '/login';
        return;
      }
      
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        if (isFavorite) {
          // Remove from favorites
          await axios.delete(`${API_URL}/favorites/${listing._id}`, config);
          setFavorites(prev => {
            const updated = {...prev};
            delete updated[listing._id];
            return updated;
          });
        } else {
          // Add to favorites
          await axios.post(`${API_URL}/favorites`, { listingId: listing._id }, config);
          setFavorites(prev => ({
            ...prev,
            [listing._id]: true
          }));
        }
      } catch (err) {
        console.error('Error toggling favorite:', err);
      }
    };

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
                {/* Favorite button */}
                <button 
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white bg-opacity-40 backdrop-blur-sm flex items-center justify-center ${isFavorite ? 'text-staynest-pink' : 'text-white'} hover:text-staynest-pink transition-colors focus:outline-none`}
                  onClick={toggleFavorite}
                >
                  <svg 
                    className="w-5 h-5 drop-shadow-sm" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill={isFavorite ? "currentColor" : "none"}
                  >
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
          
          {/* Listing info with improved layout */}
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
  // Component for a horizontal list of listings with horizontal scroll
  const ListingRow: React.FC<{ 
    title: string; 
    listings: Listing[]; 
    viewAllLink?: string;
    subtitle?: string;
  }> = ({ 
    title, 
    listings, 
    viewAllLink,
    subtitle   }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    return (
      <section className="mb-12 relative">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-staynest-dark-gray">{title}</h2>
            {subtitle && (
              <p className="text-staynest-light-gray mt-1">{subtitle}</p>
            )}
          </div>          {viewAllLink && (
            <Link 
              to={viewAllLink} 
              className="text-staynest-dark-gray font-medium text-sm flex items-center group hover:text-staynest-pink transition-colors"
            >
              Show more
              <svg 
                className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
          {listings.length > 0 ? (
          <div className="relative">
            <div 
              ref={scrollContainerRef} 
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-0 -ml-4 -mr-4 px-4 pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >              {listings.map((listing) => (
                <div 
                  key={listing._id} 
                  className="flex-none w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-8px)] lg:w-[calc(25%-8px)] px-2 snap-start first:pl-0 last:pr-4"
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
              
              {/* Add a final empty element to allow scrolling to the last item */}
              <div className="flex-none w-4"></div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 bg-staynest-background rounded-xl">
            <p className="text-staynest-light-gray">No listings available</p>
          </div>
        )}
      </section>
    );
  };
  // Function to handle loading more listings
  const handleLoadMore = () => {
    // Increase the number of visible listings
    setVisibleListings(prev => Math.min(prev + 8, allListings.length));
  };

  return (
    <div className="font-staynest max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyles }} />      {/* Category filters removed as requested */}
      
      {loading ? (
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
      ) : error ? (
        <div className="text-center p-12">
          <svg className="w-16 h-16 mx-auto text-staynest-pink mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-staynest-dark-gray mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : allListings.length === 0 ? (
        <div className="text-center p-12 bg-staynest-background rounded-2xl">
          <svg className="w-16 h-16 mx-auto text-staynest-light-gray mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-7m-6 0a1 1 0 00-1 1v7" />
          </svg>
          <p className="text-staynest-dark-gray text-lg font-medium mb-2">No listings found</p>
          <p className="text-staynest-light-gray mb-6">Try adjusting your search or filters</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors">
            Refresh Results
          </button>
        </div>
      ) : (
        <>
          {/* Featured Listings */}
          <ListingRow 
            title="Featured Stays" 
            subtitle="Our hand-picked selection of amazing stay"
            listings={featuredListings} 
          />
            {/* Top Rated Listings */}
          <ListingRow 
            title="Top Rated Stays" 
            subtitle="Highly rated by guests"
            listings={topRatedListings} 
          />
          
          {/* All Listings with Show More functionality */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-staynest-dark-gray mb-6">All Places to Stay</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allListings.slice(0, visibleListings).map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>            {allListings.length > visibleListings && (
              <div className="text-center mt-8">
                <button 
                  onClick={handleLoadMore}
                  className="bg-white shadow-lg rounded-full w-12 h-12 flex items-center justify-center hover:scale-105 hover:shadow-xl transition-all border border-staynest-gray-border mx-auto"
                  aria-label="Show more listings"
                >
                  <svg className="w-5 h-5 text-staynest-dark-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
