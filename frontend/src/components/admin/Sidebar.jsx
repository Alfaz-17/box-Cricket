import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Clock,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Home,
  CalendarCheck,
  LogIn
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    if (onClose) onClose();
  };

  // Role-based menus
  const adminMenuItems = [
     { path: '/', name: 'Home', icon: <Home size={20} /> },
    { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/boxes', name: 'Box Management', icon: <Box size={20} /> },
    { path: '/admin/bookings', name: 'Bookings', icon: <Calendar size={20} /> },
    { path: '/admin/block-slot', name: 'Block Time Slots', icon: <Clock size={20} /> },
    { path: '/admin/users', name: 'User Management', icon: <Users size={20} /> },
    { path: '/admin/settings', name: 'Settings', icon: <Settings size={20} /> }
  ];

  const userMenuItems = [
    { path: '/', name: 'Home', icon: <Home size={20} /> },
    { path: '/my-bookings', name: 'My Bookings', icon: <CalendarCheck size={20} /> }
  ];

  const guestMenuItems = [
    { path: '/', name: 'Home', icon: <Home size={20} /> },
    { path: '/login', name: 'Login', icon: <LogIn size={20} /> }
  ];

  // Select which menu to show
  let menuItems = guestMenuItems;
  if (isAuthenticated) {
    if (user?.role === 'owner') menuItems = adminMenuItems;
    else if (user?.role === 'user') menuItems = userMenuItems;
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose}></div>
      )}

      <div
        className={`h-screen w-64 bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out z-50
        fixed inset-y-0 right-0 lg:sticky lg:top-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/" className="flex items-center">
              <div className="bg-yellow-500 text-white p-2 rounded-md mr-2">
                <Box size={20} />
              </div>
              <div className="text-yellow-900 dark:text-yellow-300 font-bold text-xl">
                {isAuthenticated
                  ? user?.role === 'owner'
                    ? 'Admin Panel'
                    : 'User Panel'
                  : 'Welcome'}
              </div>
            </Link>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-4 py-3 rounded-md transition-colors duration-200
                      ${isActive(item.path)
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}
                    `}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                  >
                    <span className="mr-3 text-yellow-600 dark:text-yellow-400">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <HelpCircle size={20} className="mr-3 text-yellow-600 dark:text-yellow-400" />
                <span>Help & Support</span>
              </a>

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <LogOut size={20} className="mr-3 text-yellow-600 dark:text-yellow-400" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
