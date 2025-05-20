import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-airbnb font-airbnb">
      <div className="mb-8 text-center">
        <svg className="w-10 h-10 text-airbnb-pink mx-auto mb-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.5 12c0-6.627-5.373-12-12-12S-1.5 5.373-1.5 12s5.373 12 12 12 12-5.373 12-12zm-9.75-1.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0zm1.5 0c0 2.07-1.68 3.75-3.75 3.75-2.07 0-3.75-1.68-3.75-3.75s1.68-3.75 3.75-3.75c2.07 0 3.75 1.68 3.75 3.75z" />
        </svg>
        <h2 className="text-2xl font-semibold text-airbnb-dark-gray">Log in to your account</h2>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-start">
          <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">{error}</div>
          <button 
            onClick={clearError}
            className="text-red-600 hover:text-red-800 ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-airbnb-dark-gray">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-airbnb-dark-gray">
              Password
            </label>
          </div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-airbnb-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-airbnb-pink"
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-airbnb-pink to-airbnb-red text-white py-3 rounded-lg font-medium hover:from-airbnb-red hover:to-airbnb-pink transition-colors disabled:opacity-70"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-airbnb-gray-border text-center">
        <p className="text-airbnb-dark-gray">
          Don't have an account?{' '}
          <Link to="/register" className="text-airbnb-pink font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
