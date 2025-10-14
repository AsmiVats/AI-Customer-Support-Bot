import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// No need for `isAuthenticated` prop — handled inside
function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = !!localStorage.getItem('token');
  console.log('[ProtectedRoute] isAuthenticated =', isAuthenticated);

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] not authenticated — redirect to /sign-in');
    return <Navigate to="/sign-in" replace />;
  }

  console.log('[ProtectedRoute] authenticated — rendering children');
  return <>{children}</>;
}

export default ProtectedRoute;
