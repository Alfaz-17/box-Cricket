import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, User, LogOut,Trophy, Sidebar } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };
  
  return (
    <nav className="bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-gray-800 dark:to-gray-900 shadow-md transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-400 font-bold text-xl transition-colors duration-300"
          >
            <Trophy

 size={28} className="text-yellow-600 dark:text-yellow-400" />
            <span className="hidden sm:block">Trophy

 Box</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300"
            >
              Home
            </Link>
     {  console.log(user)}
            {isAuthenticated ? (
              <>
                {user?.role === 'user' && (
                <Link 
                  to="/my-bookings" 
                  className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300"
                >
                  My Bookings
                </Link>
                 )}

                 {user?.role === 'owner' && (
                  <Link 
                    to="/admin/bookings" 
                    className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300"
                  >
                    Admin Booking
                  </Link>
                )}
                
                {user?.role === 'owner' && (
                  <Link 
                    to="/admin" 
                    className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300"
                  >
                    Admin Panel
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300"
                >
                  <LogOut size={18} className="mr-1" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-yellow-100 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-gray-600 transition-colors duration-300"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-yellow-100 dark:bg-gray-700 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-gray-600 transition-colors duration-300"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={toggleMenu}
              className="text-yellow-900 dark:text-yellow-100 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
         
          </div>
        </div>
      </div>
     
      
      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} bg-yellow-100 dark:bg-gray-800 transition-colors duration-300`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link 
            to="/" 
            className="block px-3 py-2 rounded-md text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-gray-700 transition-colors duration-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          
          {isAuthenticated ? (
            <>
             {user?.role === 'user' && (
              <Link 
                to="/my-bookings" 
                className="block px-3 py-2 rounded-md text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-gray-700 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                My Bookings
              </Link>
               )}
              
              {user?.role === 'owner' && (
                <Link 
                  to="/admin/bookings" 
                  className="block px-3 py-2 rounded-md text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-gray-700 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Booking
                </Link>
              )}
              



              {user?.role === 'owner' && (
                <Link 
                  to="/admin" 
                  className="block px-3 py-2 rounded-md text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-gray-700 transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 rounded-md text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <LogOut size={18} className="mr-2" />
                <span>Logout</span>
              </button>
              
              <div className="px-3 py-2 border-t border-yellow-200 dark:border-gray-700">
                <div className="flex items-center">
                  <User size={18} className="text-yellow-600 dark:text-yellow-400 mr-2" />
                  <span className="text-yellow-900 dark:text-yellow-100">{user?.name || user?.email}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block px-3 py-2 rounded-md text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-gray-700 transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="block px-3 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;