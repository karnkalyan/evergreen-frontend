import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface CustomerRouteProps {
  children: React.ReactNode;
}

const CustomerRoute: React.FC<CustomerRouteProps> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not a customer, redirect to appropriate page
  if (user?.role?.name !== 'Customer') {
    // If user is admin, redirect to admin dashboard
    if (user?.role?.name === 'Admin') {
      return <Navigate to="/admin" replace />;
    }
    // For any other role, redirect to home
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default CustomerRoute;