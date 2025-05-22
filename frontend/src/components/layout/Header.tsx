import React, { useState, useEffect, FormEvent, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<string[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch all available locations from the backend
    const fetchLocations = async () => {
      try {
        const response = await axios.get(`${API_URL}/locations`);
        setLocations(response.data);
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };

    fetchLocations();

    // Add click outside listener to close suggestion box
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter locations based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredLocations([]);
      return;
    }

    const filtered = locations
      .filter((location) =>
        location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 suggestions

    setFilteredLocations(filtered);
  }, [searchQuery, locations]);

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?location=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location: string) => {
    setSearchQuery(location);
    navigate(`/?location=${encodeURIComponent(location)}`);
    setShowSuggestions(false);
  };

  return (
    <header className="bg-white border-b border-staynest-gray-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div>
            <Link to="/" className="flex items-center">
              <svg
                className="w-8 h-8 text-staynest-pink"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.5 12c0-6.627-5.373-12-12-12S-1.5 5.373-1.5 12s5.373 12 12 12 12-5.373 12-12zm-9.75-1.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm1.5 0c0 2.07-1.68 3.75-3.75 3.75-2.07 0-3.75-1.68-3.75-3.75s1.68-3.75 3.75-3.75c2.07 0 3.75 1.68 3.75 3.75z" />
              </svg>
              <span className="ml-2 text-staynest-pink font-bold text-xl font-staynest">
                StayNest
              </span>
            </Link>{" "}
          </div>
          {/* Middle search bar - only show on home page */}
          {location.pathname === "/" && (
            <div className="hidden md:block relative">
              <form
                onSubmit={handleSearch}
                className="flex items-center border border-staynest-gray-border rounded-full shadow-sm hover:shadow-md transition-shadow py-2 px-4"
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search by location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="outline-none text-sm text-staynest-dark-gray w-64 placeholder:text-staynest-light-gray"
                  aria-label="Search by location"
                  autoComplete="off"
                />
                <div className="border-l border-staynest-gray-border pl-4 ml-4">
                  <button
                    type="submit"
                    className="bg-staynest-pink rounded-full p-2 text-white flex items-center justify-center"
                    aria-label="Search"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Location suggestions */}
              {showSuggestions && filteredLocations.length > 0 && (
                <div
                  ref={suggestionRef}
                  className="absolute mt-2 w-full bg-white rounded-xl shadow-lg border border-staynest-gray-border z-10"
                >
                  <ul className="py-1">
                    {filteredLocations.map((location, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionClick(location)}
                          className="w-full text-left px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background transition-colors"
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-staynest-light-gray"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
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
                            {location}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center border border-staynest-gray-border rounded-full p-2 hover:shadow-md transition-shadow space-x-2"
            >
              <svg
                className="w-5 h-5 text-staynest-dark-gray"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="bg-gray-500 rounded-full w-8 h-8 flex items-center justify-center text-white">
                {user ? user.name.charAt(0).toUpperCase() : "G"}
              </div>
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-staynest border border-staynest-gray-border font-staynest">
                <div className="py-2">                {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-staynest-gray-border">
                        <p className="font-medium text-staynest-dark-gray">
                          {user.name}
                        </p>
                        <p className="text-sm text-staynest-light-gray">
                          {user.email}
                        </p>
                      </div>
                      
                      {/* Host Section */}
                      {user.isHost && (
                        <>
                          <div className="border-b border-staynest-gray-border my-1"></div>
                          <p className="px-4 py-1 text-xs font-medium text-staynest-light-gray">
                            Host Menu
                          </p>
                          <Link
                            to="/host/dashboard"
                            onClick={handleMenuItemClick}
                            className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                          </Link>
                          <Link
                            to="/host/add-listing"
                            onClick={handleMenuItemClick}
                            className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add New Listing
                          </Link>
                        </>
                      )}                      {/* Admin Section */}
                      {user.isAdmin && (
                        <>
                          <div className="border-b border-staynest-gray-border my-1"></div>
                          <p className="px-4 py-1 text-xs font-medium text-staynest-light-gray">
                            Admin Menu
                          </p>
                          <Link
                            to="/admin"
                            onClick={handleMenuItemClick}
                            className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                            </svg>
                            Dashboard
                          </Link>
                          <Link
                            to="/admin/host-applications"
                            onClick={handleMenuItemClick}
                            className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Host Applications
                          </Link>
                          <Link
                            to="/admin/pending-listings"
                            onClick={handleMenuItemClick}
                            className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Pending Listings
                          </Link>
                        </>
                      )}                      {/* Guest Menu */}
                      <div className="border-b border-staynest-gray-border my-1"></div>
                      <p className="px-4 py-1 text-xs font-medium text-staynest-light-gray">
                        Guest Menu
                      </p>
                      <Link
                        to="/bookings"
                        onClick={handleMenuItemClick}
                        className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        My Bookings
                      </Link>
                      <Link
                        to="/favorites"
                        onClick={handleMenuItemClick}
                        className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Favorites
                      </Link>                      {!user.isHost && !user.isAdmin && (
                        <Link
                          to="/become-host"
                          onClick={handleMenuItemClick}
                          className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Become a Host
                        </Link>
                      )}
                      {user.isHost && (
                        <Link
                          to="/host/dashboard"
                          onClick={handleMenuItemClick}
                          className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Host Dashboard
                        </Link>
                      )}{/* Account Settings */}
                      <div className="border-b border-staynest-gray-border my-1"></div>
                      <p className="px-4 py-1 text-xs font-medium text-staynest-light-gray">
                        Account Settings
                      </p>
                      <Link
                        to="/profile"
                        onClick={handleMenuItemClick}
                        className="flex items-center px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={handleMenuItemClick}
                        className="block px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        onClick={handleMenuItemClick}
                        className="block px-4 py-2 text-sm text-staynest-dark-gray hover:bg-staynest-background"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
