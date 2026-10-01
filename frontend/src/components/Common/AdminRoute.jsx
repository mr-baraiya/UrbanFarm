import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }
  
  // ✅ Check if user is admin
  if (user && user.role === 'admin') {
    return children;
  }
  
  // If user is logged in but not admin, redirect to app
  if (user) {
    console.log('⚠️ User is not admin, redirecting to app');
    return <Navigate to="/app" />;
  }
  
  // If not logged in, redirect to login
  console.log('⚠️ Not logged in, redirecting to login');
  return <Navigate to="/login" />;
};

export default AdminRoute;