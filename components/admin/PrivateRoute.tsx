import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean; // Add this prop to restrict to admin only
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryEnd"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If adminOnly is true and user is not admin, redirect to home or unauthorized page
  if (adminOnly && !isAdmin) {
    console.warn(`Customer user attempted to access admin route: ${user?.email}`);
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;