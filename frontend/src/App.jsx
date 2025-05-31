import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import AuthContext from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Public pages
import Home from './pages/public/Home';
import BoxDetail from './pages/public/BoxDetail';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// User pages
import MyBookings from './pages/user/MyBookings';
import Checkout from './pages/user/Checkout';
import BookingSuccess from './pages/user/BookingSuccess';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import BoxManagement from './pages/admin/BoxManagement';
import CreateBox from './pages/admin/CreateBox';
import EditBox from './pages/admin/EditBox';
import AdminBookings from './pages/admin/AdminBookings';
import BlockSlot from './pages/admin/BlockSlot';
import api from './utils/api';

const ProtectedRoute = ({ children, role }) => {
  const { user, isAuthenticated, loading } = React.useContext(AuthContext);

 

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
 if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await api.post('/auth/me'); // ✅ Axios handles POST & cookies

        // Axios automatically parses response.data
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const response=await api.post('/auth/logout');
      toast.success(response.data.message)
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const authContextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <ThemeProvider>
        <Router>
        <div style={{ fontFamily: 'montserrat' }}>
          <div  className=" flex flex-col min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300" >
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              {!loading && (
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/box/:id" element={<BoxDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* User Routes */}
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout/:bookingId"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/booking-success"
                    element={
                      <ProtectedRoute>
                        <BookingSuccess />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute role="owner">
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/boxes"
                    element={
                      <ProtectedRoute role="owner">
                        <BoxManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/boxes/create"
                    element={
                      <ProtectedRoute role="owner">
                        <CreateBox />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/boxes/edit/:id"
                    element={
                      <ProtectedRoute role="owner">
                        <EditBox />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/bookings"
                    element={
                      <ProtectedRoute role="owner">
                        <AdminBookings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/block-slot"
                    element={
                      <ProtectedRoute role="owner">
                        <BlockSlot />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              )}
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
           </div>
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
   
  );
}

export default App;
