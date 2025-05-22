import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface HostApplication {
  _id: string;
  name: string;
  email: string;
  hostInfo: {
    phone: string;
    address: string;
    bio: string;
    identification: string;
  };
  hostSince: string;
}

const AdminHostApplications: React.FC = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState<HostApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchHostApplications();
  }, [token]);

  const fetchHostApplications = async () => {
    try {
      setLoading(true);
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`${API_URL}/host/applications`, config);
      setApplications(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching host applications:', err);
      setError('Failed to load host applications. Please try again.');
      setLoading(false);
    }
  };

  const handleApplicationAction = async (hostId: string, approve: boolean) => {
    try {
      setActionLoading(prev => ({ ...prev, [hostId]: true }));
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      await axios.post(
        `${API_URL}/host/applications/review`, 
        { hostId, approve }, 
        config
      );

      // Remove the application from the list
      setApplications(applications.filter(app => app._id !== hostId));
      
      setActionLoading(prev => ({ ...prev, [hostId]: false }));
    } catch (err) {
      console.error('Error processing host application:', err);
      setActionLoading(prev => ({ ...prev, [hostId]: false }));
      alert('Failed to process host application. Please try again.');
    }
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
          onClick={fetchHostApplications}
          className="px-6 py-3 bg-staynest-pink text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-staynest-dark-gray mb-6">Host Applications</h1>
      
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-staynest-light-gray mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-staynest-dark-gray text-lg font-medium mb-2">No Pending Applications</p>
          <p className="text-staynest-light-gray">There are no host applications awaiting review at this time.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-staynest-gray-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-staynest-gray-border">
              <thead className="bg-staynest-background">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Applicant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Bio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Date Applied
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-staynest-light-gray uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-staynest-gray-border">
                {applications.map((application) => (
                  <tr key={application._id} className="hover:bg-staynest-background/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
                          {application.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-staynest-dark-gray">
                            {application.name}
                          </div>
                          <div className="text-sm text-staynest-light-gray">
                            {application.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-staynest-dark-gray">
                        {application.hostInfo.phone}
                      </div>
                      <div className="text-sm text-staynest-light-gray truncate max-w-xs">
                        {application.hostInfo.address}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-staynest-dark-gray line-clamp-2 max-w-xs">
                        {application.hostInfo.bio}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-staynest-light-gray">
                      {new Date(application.hostSince).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleApplicationAction(application._id, true)}
                        disabled={actionLoading[application._id]}
                        className="text-green-600 hover:text-green-900 mr-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[application._id] ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleApplicationAction(application._id, false)}
                        disabled={actionLoading[application._id]}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[application._id] ? 'Processing...' : 'Reject'}
                      </button>
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

export default AdminHostApplications;
