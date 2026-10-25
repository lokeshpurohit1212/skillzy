import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Browse from './pages/Browse';
import UserProfile from './pages/UserProfile';
import Swaps from './pages/Swaps';
import SwapDetail from './pages/SwapDetail';
import AdminPanel from './pages/AdminPanel';
import LoadingSpinner from './components/LoadingSpinner';
import AdminLogin from './pages/AdminLogin';
import Footer from './components/Footer';
import Transactions from './pages/Transactions';
import Matchmaker from './pages/Matchmaker';
import Classroom from './pages/Classroom';
import Sessions from './pages/Sessions';
import Copilot from './pages/Copilot';
import Leaderboard from './pages/Leaderboard';
import Communities from './pages/Communities';
import Premium from './pages/Premium';
import Checkout from './pages/Checkout';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  if (!adminToken) {
    return <Navigate to="/admin/login" />;
  }
  return children;
};

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Hide Navbar and Footer on admin and admin login routes
  const hideNavbar = location.pathname.startsWith('/admin');
  const hideFooter = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0F0D15] text-gray-900 dark:text-[#F5F2FA] transition-colors duration-200">
      {!hideNavbar && <Navbar />}
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
  path="/swaps" 
  element={
    <PrivateRoute>
      <Swaps />
    </PrivateRoute>
  }
/>

<Route 
  path="/transactions" 
  element={
    <PrivateRoute>
      <Transactions />
    </PrivateRoute>
  }
/>
          <Route 
            path="/swaps/:id" 
            element={
              <PrivateRoute>
                <SwapDetail />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/matchmaker" 
            element={
              <PrivateRoute>
                <Matchmaker />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/sessions" 
            element={
              <PrivateRoute>
                <Sessions />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/classroom/:sessionId" 
            element={
              <PrivateRoute>
                <Classroom />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/copilot" 
            element={
              <PrivateRoute>
                <Copilot />
              </PrivateRoute>
            } 
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/communities" element={<Communities />} />
          <Route 
            path="/premium" 
            element={
              <PrivateRoute>
                <Premium />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } 
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default App; 