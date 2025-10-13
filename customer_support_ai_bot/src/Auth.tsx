import React from 'react';
import { Navigate } from 'react-router-dom';


interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

// This component is a wrapper for routes that require authentication.
// It takes two props:
// 1. isAuthenticated: A boolean that tells us if the user is logged in.
// 2. children: The component to render if the user IS authenticated (e.g., <SupportChat />).
function ProtectedRoute({ isAuthenticated, children }: ProtectedRouteProps) {

  console.log('[ProtectedRoute] isAuthenticated =', isAuthenticated)
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] not authenticated — redirect to /sign-in')
    return <Navigate to="/sign-in" replace />;
  }

  console.log('[ProtectedRoute] authenticated — rendering children')
  return children;
}

export default ProtectedRoute;
