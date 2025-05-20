import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
// import styled from 'styled-components'; // Placeholder seems unused, removing for now

// Layouts & Protected Routes
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './contexts/AdminRoute';
import MainLayout from './components/MainLayout';

// Page Components
import Rankings from './pages/Rankings';
import Feed from './pages/Feed';
import Vote from './pages/Vote';
import Friends from './pages/Friends';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Reports from './pages/Reports';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Component to handle redirect for already authenticated users trying to access login/register
const AuthRouteGuard: React.FC = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Or a spinner
  return currentUser ? <Navigate to="/profile" replace /> : <Outlet />; // Redirect logged-in users from login/register to their profile
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes for Login and Register, guarded by AuthRouteGuard */}
        <Route element={<AuthRouteGuard />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Main application routes with MainLayout including TabBar */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Rankings />} /> {/* Rankings is public */}
          <Route path="/profile" element={<Profile />} /> {/* Profile is public, content conditional */}
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/friends" element={<Friends />} />
            
            {/* Admin-only Routes */}
            <Route element={<AdminRoute children={<Outlet />} />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            {/* Add other strictly protected routes here */}
          </Route>
        </Route>
        
        {/* Fallback for non-matched routes (optional) */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App; 