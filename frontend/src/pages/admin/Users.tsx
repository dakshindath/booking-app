import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  avatar?: string;
}

const Users: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/admin/users`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [token]);
  
  const handleDeleteUser = async (userId: string) => {
    if (confirmDelete !== userId) {
      setConfirmDelete(userId);
      return;
    }
    
    try {
      await axios.delete(
        `${API_URL}/admin/user/${userId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Remove from state
      setUsers(users.filter(user => user._id !== userId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };
  
  const cancelDelete = () => {
    setConfirmDelete(null);
  };
  
  const filteredUsers = searchTerm 
    ? users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-staynest">
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
      <div className="text-center p-6 font-staynest">
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
    );
  }
  
  return (
    <div className="font-staynest max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-staynest-dark-gray">Manage Users</h1>
        <span className="text-staynest-light-gray">Total: {users.length} users</span>
      </div>
      
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-staynest-gray-border p-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-staynest-light-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email"
            className="pl-10 w-full px-4 py-3 border border-staynest-gray-border rounded-lg focus:outline-none focus:ring-2 focus:ring-staynest-pink"
          />
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-staynest-gray-border">
          <svg className="w-16 h-16 mx-auto text-staynest-light-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-staynest-dark-gray text-lg font-medium">No users found</p>
          <p className="text-staynest-light-gray">Try adjusting your search</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-staynest-gray-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-staynest-gray-border">
              <thead className="bg-staynest-background">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-staynest-dark-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-staynest-gray-border">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-staynest-background transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-staynest-pink bg-opacity-15 flex items-center justify-center">
                              <span className="text-staynest-pink font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium text-staynest-dark-gray">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-light-gray">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        user.isAdmin 
                          ? 'bg-staynest-pink bg-opacity-10 text-staynest-pink' 
                          : 'bg-staynest-background text-staynest-dark-gray'
                      }`}>
                        {user.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-light-gray">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {/* Prevent admins from deleting themselves */}
                      {currentUser?.id !== user._id ? (
                        confirmDelete === user._id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="text-staynest-pink hover:text-opacity-80 font-medium"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={cancelDelete}
                              className="text-staynest-dark-gray hover:text-staynest-light-gray"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="inline-flex items-center text-staynest-dark-gray hover:text-staynest-pink"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        )
                      ) : (
                        <span className="text-staynest-light-gray">Current User</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
