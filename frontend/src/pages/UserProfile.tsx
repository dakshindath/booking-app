import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

const UserProfile: React.FC = () => {
  const { user, token } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    // Validate if passwords match when provided
    if (password && password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      // Only include password in the update if it's provided
      const updateData: { name: string; email: string; password?: string } = { 
        name, 
        email 
      };
      
      if (password) {
        updateData.password = password;
      }
      
      await axios.put(
        `${API_URL}/user/${user?.id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Profile updated successfully');
      
      // Clear password fields after successful update
      setPassword('');
      setConfirmPassword('');
      
      // Update local storage user data for display
      if (user) {
        const updatedUser = { ...user, name, email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-airbnb border border-airbnb-gray-border font-airbnb">
      <div className="mb-8 text-center">
        <div className="w-20 h-20 bg-airbnb-background rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-airbnb-pink" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-airbnb-dark-gray">My Profile</h2>
        <p className="text-airbnb-light-gray mt-2">Manage your personal information</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">{error}</div>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-lg mb-6 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="flex-1">{success}</div>
          <button 
            onClick={() => setSuccess(null)}
            className="text-green-600 hover:text-green-800 ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-airbnb-dark-gray">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-airbnb-dark-gray">
            Email
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg bg-airbnb-background focus:outline-none cursor-not-allowed"
              required 
              readOnly
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-airbnb-light-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-airbnb-light-gray mt-1">Email cannot be changed</p>
        </div>
        
        <div className="pt-6 border-t border-airbnb-gray-border">
          <h3 className="text-lg font-medium text-airbnb-dark-gray mb-4">Change Password</h3>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-airbnb-dark-gray">
                New Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
                placeholder="Leave blank to keep current password"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-airbnb-dark-gray">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink ${!password ? 'bg-airbnb-background cursor-not-allowed' : ''}`}
                disabled={!password}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-6">
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-airbnb-pink to-airbnb-red text-white py-3 rounded-lg font-medium hover:from-airbnb-red hover:to-airbnb-pink transition-colors disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;
