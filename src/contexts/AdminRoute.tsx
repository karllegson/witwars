import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { currentUser, loading } = useAuth();
  
  // Check if the current user is the admin (klegson48@gmail.com)
  const isAdmin = currentUser && currentUser.email === 'klegson48@gmail.com';

  // If we're still loading the auth state, show nothing
  if (loading) {
    return null;
  }

  // If not admin, redirect to home page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // If admin, render the children
  return <>{children}</>;
};

export default AdminRoute;
