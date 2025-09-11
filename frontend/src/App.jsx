import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import AuthContext from "./context/AuthContext";

// Layout components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Public pages
import Home from "./pages/public/Home";
import BoxDetail from "./pages/public/BoxDetail";

// Auth pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";

// User pages
import MyBookings from "./pages/user/MyBookings";
import Profile from "./pages/user/Profile";
import SettingsPage from "./pages/public/SettingsPage";
import FAQSection from "./pages/public/FAQSection";
import FeedbackSupport from "./pages/user/FeedbackSupport ";

// Admin pages
import Dashboard from "./pages/admin/Dashboard";
import BoxManagement from "./pages/admin/BoxManagement";
import CreateBox from "./pages/admin/CreateBox";
import EditBox from "./pages/admin/EditBox";
import AdminBookings from "./pages/admin/AdminBookings";
import BlockSlot from "./pages/admin/BlockSlot";

import api from "./utils/api";
import Group from "./pages/user/Group";
import InviteUsers from "./pages/user/InviteUsers";
import socket from "./utils/soket";
import GroupChat from "./pages/user/GroupChat";
import GroupInfo from "./pages/user/GroupInfo";
import "@fontsource/inter"; // Loads 400 weight by default
import "@fontsource/mulish";
import "@fontsource/poppins";
import "@fontsource/roboto";
import Notifications from "./pages/user/Notifications";
import useNotificationStore from './store/useNotificationStore'
import OfflineBookingForm from "./pages/admin/OfflineBookingForm";



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
const{fetchNotifications,fetchUnreadCount,markAllAsRead}=useNotificationStore();

//register user in sockets
useEffect(() => {
  if (!user?._id) return;

if (!socket.connected) {
  socket.connect();
} else {
  socket.emit("register", user._id); // 🟢 Emit immediately if already connected
}

socket.on("connect", () => {
  socket.emit("register", user._id); // 🔁 In case it reconnects later
});


  socket.on("connect_error", (err) => {
    console.error("❗ Socket connect_error:", err);
  });

  return () => {
    // don't disconnect if using singleton socket
  };
}, [user]);


// use soket to show real time notification alert 
  useEffect(() => {

    const handleNotification = (data) => {
      toast.success(data.message);
      // refereh all componnet when sokets alert 
      
            fetchUnreadCount(); 
            fetchNotifications();
            markAllAsRead();
   
    };

    socket.on("group-invite", handleNotification);
    socket.on("group-join-success", handleNotification);
    socket.on("group-joined", handleNotification);
    socket.on("new_notification", handleNotification);

    return () => {
      socket.off("group-invite", handleNotification);
      socket.off("group-join-success", handleNotification);
      socket.off("group-joined", handleNotification);
      socket.off("new_notification", handleNotification);
    };
  }, [fetchUnreadCount,fetchNotifications]);



  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const response = await api.post("/auth/me"); // ✅ Axios handles POST & cookies
        // Axios automatically parses response.data
        setUser(response.data.user);
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error("❌ Auth check error:", error);
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
      const response = await api.post("/auth/logout");
      toast.success(response.data.message);
    } catch (error) {
      console.error("Logout error:", error);
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
      <Router>
        <div style={{ fontFamily: "Rajdhani" }}>
          <div className="flex flex-col min-h-screen bg-base-100 text-base-content transition-colors duration-300">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
  {loading ? (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  ) : (
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/box/:id" element={<BoxDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/faq" element={<FAQSection />} />

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
                    path="/my-profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/invite/:id"
                    element={
                      <ProtectedRoute>
                        <InviteUsers />
                      </ProtectedRoute>
                    }
                  />
                             <Route
                    path="/groups"
                    element={
                      <ProtectedRoute>
                        <Group />
                      </ProtectedRoute>
                    }
                  />
                             <Route
                    path="/groupChat/:groupName/:groupId"
                    element={
                      <ProtectedRoute>
                        <GroupChat />
                      </ProtectedRoute>
                    }
                  />
                                <Route
                    path="/groupInfo/:groupName/:groupId"
                    element={
                      <ProtectedRoute>
                        <GroupInfo />
                      </ProtectedRoute>
                    }
                  />
               


                  <Route
                    path="/support"
                    element={
                      <ProtectedRoute>
                        <FeedbackSupport />
                      </ProtectedRoute>
                    }
                  />
                  
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications  />
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
                    path="/my-profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
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
                   <Route
                    path="/admin/offline-booking"
                    element={
                      <ProtectedRoute role="owner">
                        <OfflineBookingForm />
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
    </AuthContext.Provider>
  );
}

export default App;
