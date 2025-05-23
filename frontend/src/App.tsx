import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingDetails from './pages/ListingDetails';
import BookingConfirmation from './pages/BookingConfirmation';
import UserProfile from './pages/UserProfile';
import UserBookings from './pages/UserBookings';
import Favorites from './pages/Favorites';
import BecomeHost from './pages/BecomeHost';

// Host pages
import HostDashboard from './pages/host/HostDashboard';
import AddListing from './pages/host/AddListing';
import EditListing from './pages/host/EditListing';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminListings from './pages/admin/Listings';
import AdminBookings from './pages/admin/Bookings';
import AdminUsers from './pages/admin/Users';
import AdminHosts from './pages/admin/Hosts';
import AdminHostApplications from './pages/admin/HostApplications';
import AdminPendingListings from './pages/admin/PendingListings';

// Protected route components
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import HostRoute from './components/auth/HostRoute';

// AppContent component that uses auth context
const AppContent = () => {
  const { loading } = useAuth();

  // Show nothing while auth is initializing to prevent flash
  if (loading) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-staynest-background font-staynest">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          
          {/* Protected user routes */}
          <Route
            path="/booking/confirm"
            element={
              <ProtectedRoute>
                <BookingConfirmation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <UserBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/become-host"
            element={
              <ProtectedRoute>
                <BecomeHost />
              </ProtectedRoute>
            }
          />
          
          {/* Host routes */}
          <Route
            path="/host/dashboard"
            element={
              <HostRoute>
                <HostDashboard />
              </HostRoute>
            }
          />
          <Route
            path="/host/add-listing"
            element={
              <HostRoute>
                <AddListing />
              </HostRoute>
            }
          />
          <Route
            path="/host/edit-listing/:id"
            element={
              <HostRoute>
                <EditListing />
              </HostRoute>
            }
          />
          
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <AdminRoute>
                <AdminListings />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <AdminRoute>
                <AdminBookings />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/hosts"
            element={
              <AdminRoute>
                <AdminHosts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/host-applications"
            element={
              <AdminRoute>
                <AdminHostApplications />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/pending-listings"
            element={
              <AdminRoute>
                <AdminPendingListings />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// Main App component that provides auth context
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
