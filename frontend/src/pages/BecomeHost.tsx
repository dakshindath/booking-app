import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const BecomeHost: React.FC = () => {
  const { user, token, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    bio: '',
    identification: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);  useEffect(() => {
    // Check if user is already a host or has a pending application
    const checkHostStatus = async () => {
      try {
        if (!token) {
          navigate('/login');
          return;
        }

        // Check if user is already a host before making API calls
        if (user?.isHost) {
          // Immediately redirect to dashboard if user is already a host
          navigate('/host/dashboard');
          return;
        }

        // Refresh user data to get latest host status
        await refreshUser();
        
        // Check again after refresh
        if (user?.isHost) {
          navigate('/host/dashboard');
          return;
        }

        // Check if there's a pending application
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.get(`${API_URL}/host/profile`, config);
        
        if (response.data.hostInfo) {
          // Pre-fill the form with existing info
          setFormData({
            phone: response.data.hostInfo.phone || '',
            address: response.data.hostInfo.address || '',
            bio: response.data.hostInfo.bio || '',
            identification: response.data.hostInfo.identification || ''
          });
          
          setApplicationStatus('pending');
        }
      } catch (err) {
        console.error('Error checking host status:', err);
      }
    };

    checkHostStatus();
  }, [token, user, navigate, refreshUser]);

  // Periodically check host status
  useEffect(() => {
    if (!user?.isHost && token) {
      const interval = setInterval(() => {
        refreshUser();
      }, 10000); // Check every 10 seconds

      return () => clearInterval(interval);
    }
  }, [user?.isHost, token, refreshUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.post(`${API_URL}/host/apply`, formData, config);
      setApplicationStatus('submitted');
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit application');
      setLoading(false);
    }
  };

  if (applicationStatus === 'submitted') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted!</h2>
          <p className="text-green-700 mb-6">
            Your application to become a host has been submitted. Our team will review your application and get back to you soon.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (applicationStatus === 'pending') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">Application In Review</h2>
          <p className="text-yellow-700 mb-6">
            Your host application is currently under review. We'll notify you once it's approved.
          </p>
          <p className="text-yellow-700 mb-6">
            You can update your application details below if needed.
          </p>
          {/* Allow updating the form data */}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-staynest-dark-gray mb-2">Become a Host</h1>
      <p className="text-staynest-light-gray mb-8">
        Join our community of hosts and start earning by sharing your space.
      </p>

      <div className="bg-white rounded-xl shadow-lg border border-staynest-gray-border p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="phone" className="block text-staynest-dark-gray font-medium mb-2">
              Phone Number*
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-staynest-dark-gray font-medium mb-2">
              Full Address*
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink"
              placeholder="Enter your full address"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-staynest-dark-gray font-medium mb-2">
              About You
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink"
              placeholder="Tell us a bit about yourself"
            />
          </div>

          <div>
            <label htmlFor="identification" className="block text-staynest-dark-gray font-medium mb-2">
              Identification
            </label>
            <input
              type="text"
              id="identification"
              name="identification"
              value={formData.identification}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:ring-staynest-pink focus:border-staynest-pink"
              placeholder="Your ID or passport number"
            />
            <p className="mt-2 text-sm text-staynest-light-gray">
              This information will be used for verification purposes only.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-staynest-pink to-staynest-red text-white py-3 rounded-lg font-medium hover:from-staynest-red hover:to-staynest-pink transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BecomeHost;
