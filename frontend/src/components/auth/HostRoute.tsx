import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HostRouteProps {
  children: React.ReactNode;
}

const HostRoute: React.FC<HostRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Don't render anything while loading to prevent flash
  if (loading || !user) {
    return null;
  }

  // Once we have user data, redirect non-hosts
  if (!user.isHost) {
    return <Navigate to="/" replace />;
  }

  // Only render children when we're sure the user is a host
  return <>{children}</>;
};

export default HostRoute;
