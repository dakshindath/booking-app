import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-airbnb-gray-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div>
            <Link to="/" className="flex items-center">
              <svg
                className="w-8 h-8 text-airbnb-pink"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.5 12c0-6.627-5.373-12-12-12S-1.5 5.373-1.5 12s5.373 12 12 12 12-5.373 12-12zm-9.75-1.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm1.5 0c0 2.07-1.68 3.75-3.75 3.75-2.07 0-3.75-1.68-3.75-3.75s1.68-3.75 3.75-3.75c2.07 0 3.75 1.68 3.75 3.75z" />
              </svg>
              <span className="ml-2 text-airbnb-pink font-bold text-xl font-airbnb">
                airbnb
              </span>
            </Link>
          </div>

          {/* Middle search bar */}
          <div className="hidden md:flex items-center border border-airbnb-gray-border rounded-full shadow-sm hover:shadow-md transition-shadow py-2 px-4 divide-x divide-gray-300">
            <span className="pr-4 font-medium text-sm">Anywhere</span>
            <span className="px-4 font-medium text-sm">Any week</span>
            <div className="pl-4 flex items-center">
              <span className="text-airbnb-light-gray text-sm">Add guests</span>
              <button className="ml-2 bg-airbnb-pink rounded-full p-2 text-white">
                <svg
                  viewBox="0 0 32 32"
                  className="w-4 h-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M13 24a1 1 0 0 1-.71-.29l-8-8a1 1 0 0 1 1.42-1.42l7.29 7.3 7.29-7.3a1 1 0 0 1 1.42 1.42l-8 8A1 1 0 0 1 13 24z" />
                </svg>
              </button>
            </div>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center border border-airbnb-gray-border rounded-full p-2 hover:shadow-md transition-shadow space-x-2"
            >
              <svg
                className="w-5 h-5 text-airbnb-dark-gray"
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
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-airbnb border border-airbnb-gray-border font-airbnb">
                <div className="py-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-airbnb-gray-border">
                        <p className="font-medium text-airbnb-dark-gray">
                          {user.name}
                        </p>
                        <p className="text-sm text-airbnb-light-gray">
                          {user.email}
                        </p>{" "}
                      </div>{" "}
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          onClick={handleMenuItemClick}
                          className="block px-4 py-2 text-sm text-airbnb-dark-gray hover:bg-airbnb-background"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      {!user.isAdmin && (
                        <Link
                          to="/bookings"
                          onClick={handleMenuItemClick}
                          className="block px-4 py-2 text-sm text-airbnb-dark-gray hover:bg-airbnb-background"
                        >
                          My Bookings
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={handleMenuItemClick}
                        className="block px-4 py-2 text-sm text-airbnb-dark-gray hover:bg-airbnb-background"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-airbnb-dark-gray hover:bg-airbnb-background"
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={handleMenuItemClick}
                        className="block px-4 py-2 text-sm text-airbnb-dark-gray hover:bg-airbnb-background"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        onClick={handleMenuItemClick}
                        className="block px-4 py-2 text-sm text-airbnb-dark-gray hover:bg-airbnb-background"
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
