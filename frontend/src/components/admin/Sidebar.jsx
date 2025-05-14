import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Box, 
  Clock, 
  Calendar, 
  Users, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const menuItems = [
    { 
      path: '/admin', 
      name: 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/admin/boxes', 
      name: 'Box Management', 
      icon: <Box size={20} /> 
    },
    { 
      path: '/admin/bookings', 
      name: 'Bookings', 
      icon: <Calendar size={20} /> 
    },
    { 
      path: '/admin/block-slot', 
      name: 'Block Time Slots', 
      icon: <Clock size={20} /> 
    },
    { 
      path: '/admin/users', 
      name: 'User Management', 
      icon: <Users size={20} /> 
    },
    { 
      path: '/admin/settings', 
      name: 'Settings', 
      icon: <Settings size={20} /> 
    }
  ];
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Link to="/admin" className="flex items-center">
              <div className="bg-yellow-500 text-white p-2 rounded-md mr-2">
                <Box size={20} />
              </div>
              <div className="text-yellow-900 dark:text-yellow-300 font-bold text-xl">
                Admin Panel
              </div>
            </Link>
          </div>
          
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
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <a href="#" className="flex items-center text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                <HelpCircle size={20} className="mr-3 text-yellow-600 dark:text-yellow-400" />
                <span>Help & Support</span>
              </a>
              <Link to="/" className="flex items-center text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                <LogOut size={20} className="mr-3 text-yellow-600 dark:text-yellow-400" />
                <span>Back to Site</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;