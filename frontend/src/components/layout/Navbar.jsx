import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, LogOut, Trophy } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import Sidebar from '../admin/Sidebar';
import logo from '../../images/logo.png'

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Update `isMobile` on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setSidebarOpen(false);
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-gray-800 dark:to-gray-900 shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-400 font-bold text-xl transition-colors duration-300"
            >
               <img
    src={logo}
    alt="BookMyBox Logo"
    className="h-13 w-13 rounded-3xl transition-transform duration-300 hover:scale-150"
  />
  
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300"
              >
                Home
              </Link>

              {isAuthenticated && user?.role === 'user' && (
                <Link
                  to="/my-bookings"
                  className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300"
                >
                  My Bookings
                </Link>
              )}

              {isAuthenticated && user?.role === 'owner' && (
                <>
                  <Link
                    to="/admin/bookings"
                    className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300"
                  >
                    Admin Booking
                  </Link>
                  <Link
                    to="/admin"
                    className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300"
                  >
                    Admin Panel
                  </Link>
                     <Link
                    to="/admin/boxes"
                    className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300"
                  >
                    Box Management
                  </Link>
                     <Link
                    to="/admin/block-slot"
                    className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300"
                  >
                    Block Slot
                  </Link>
                     <Link
                    to="/my-profile"
                    className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300"
                  >
                    My profile
                  </Link>
                </>
              )}

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300"
                >
                  <LogOut size={18} className="mr-1" />
                  <span>Logout</span>
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md shadow-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-yellow-100 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-gray-600"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-yellow-100 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-gray-600"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-700 dark:text-gray-300"
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
