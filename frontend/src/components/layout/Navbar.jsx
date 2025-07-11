import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Sun, Moon, LogOut, Trophy } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import Sidebar from "../admin/Sidebar";
import BookMyBoxLogo from '../../assets/cri.png';

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();



  // Update `isMobile` on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  
  const handleLogout = () => {
    logout();
    navigate("/");
    setSidebarOpen(false);
  };


  return (
    <>
      <nav className="sticky top-0 z-50 bg-base-300 shadow-md backdrop-blur bg-opacity-80">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2  dark:text-yellow-400 font-bold text-xl transition-colors duration-300"
            >

              <h1 style={{ fontFamily: "Bebas Neue" }}  className="flex items-center   font-bold text-xl" >
                            <img className="h-15 w-15 m-[-13px]" src={BookMyBoxLogo} alt="BookMyBox Logo" />Book My Box

                 </h1>

            </Link>
            

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="btn btn-ghost text-base-content">
                Home
              </Link>

              {isAuthenticated && user?.role === "user" && (
                <Link
                  to="/my-bookings"
                  className="btn btn-ghost text-base-content"
                >
                  My Bookings
                </Link>
              )}

              {isAuthenticated && user?.role === "owner" && (
                <>
                  <Link
                    to="/admin/bookings"
                    className="btn btn-ghost text-base-content"
                  >
                    Admin Booking
                  </Link>
                  <Link to="/admin" className="btn btn-ghost text-base-content">
                    Admin Panel
                  </Link>
                  <Link
                    to="/admin/boxes"
                    className="btn btn-ghost text-base-content"
                  >
                    Box Management
                  </Link>
                  <Link
                    to="/admin/block-slot"
                    className="btn btn-ghost text-base-content"
                  >
                    Block Slot
                  </Link>
                  <Link
                    to="/my-profile"
                    className="btn btn-ghost text-base-content"
                  >
                    My Profile
                  </Link>
                </>
              )}

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-centerbtn btn btn-primary"
                >
                  <LogOut
                    size={18}
                    className="mr-1  btn-primary text-base-content"
                  />
                  <span>Logout</span>
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost text-base-content">
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-ghost text-base-content"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/settings"
                    className="btn btn-ghost text-base-content"
                  >
                    Settings
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="btn btn-primary"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Render Sidebar only on mobile */}
      {isMobile && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
