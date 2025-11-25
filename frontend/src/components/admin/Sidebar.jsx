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
  LogIn,
  Group,
  Contact,
  BookImageIcon,
  X,
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import logoIcon from '../../assets/logo-icon.svg';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    const confirmLogout = confirm('You want to log out?');
    if (!confirmLogout) return;
    logout();
    navigate('/');
    localStorage.removeItem('token');
    if (onClose) onClose();
  };

  // Role‑based menus
  const adminMenuItems = [
    { path: '/', name: 'Home', icon: <Home size={20} /> },
    { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/boxes', name: 'Box Management', icon: <Box size={20} /> },
    { path: '/admin/bookings', name: 'Bookings', icon: <Calendar size={20} /> },
    { path: '/admin/block-slot', name: 'Block Time Slots', icon: <Clock size={20} /> },
    { path: '/my-profile', name: 'My Profile', icon: <Users size={20} /> },
    { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
    { path: '/groups', name: 'Group', icon: <Group size={20} /> },
  ];

  const userMenuItems = [
    { path: '/', name: 'Home', icon: <Home size={20} /> },
    { path: '/my-bookings', name: 'My Bookings', icon: <CalendarCheck size={20} /> },
    { path: '/groups', name: 'Group', icon: <Group size={20} /> },
    { path: '/my-profile', name: 'My Profile', icon: <Users size={20} /> },
    { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
    { path: '/support', name: 'Contact Us', icon: <Contact size={20} /> },
    { path: '/faq', name: 'FAQ', icon: <HelpCircle size={20} /> },
  ];

  const guestMenuItems = [
    { path: '/', name: 'Home', icon: <Home size={20} /> },
    { path: '/login', name: 'Login', icon: <LogIn size={20} /> },
    { path: '/settings', name: 'Settings', icon: <Settings size={20} /> },
    { path: '/faq', name: 'FAQ', icon: <HelpCircle size={20} /> },
  ];

  let menuItems = guestMenuItems;
  if (isAuthenticated) {
    if (user?.role === 'owner') menuItems = adminMenuItems;
    else if (user?.role === 'user') menuItems = userMenuItems;
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar Container */}
      <div
        className={`h-screen w-72 bg-gradient-to-b from-background via-muted/20 to-background shadow-2xl border-r border-primary/10 transition-transform duration-300 ease-out z-50
          fixed inset-y-0 left-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-primary/10 bg-background/50 backdrop-blur-sm">
             {/* Logo & Brand */}
            <div className="flex items-center gap-3">
                <div className="relative h-15 w-15 rounded-xl overflow-hidden   p-1">
                    <img className="h-full w-full object-contain" src={logoIcon} alt="BookMyBox" />
                </div>
                <div className="flex flex-col">
                    <span style={{ fontFamily: 'Bebas Neue' }} className="text-2xl font-bold text-primary tracking-wide leading-none">
                        BookMyBox
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {isAuthenticated ? (user?.role === 'owner' ? 'Admin Panel' : 'User Dashboard') : 'Welcome'}
                    </span>
                </div>
            </div>
            
            {/* Close Button (Mobile) */}
          
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={`
                      flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                      ${isActive(item.path) 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1' 
                        : 'text-foreground hover:bg-primary/10 hover:text-primary hover:translate-x-1'
                      }
                    `}
                  >
                    <span className={`mr-3 transition-transform duration-200 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                    </span>
                    <span className="font-medium tracking-wide text-sm">{item.name}</span>
                    
                    {/* Active Indicator */}
                    {isActive(item.path) && (
                        <div className="absolute right-2 h-2 w-2 rounded-full bg-white/40" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-primary/10 bg-muted/5 space-y-2">
            {isAuthenticated && (
                <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors group"
                >
                <LogOut size={18} className="mr-3 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm">Logout</span>
                </button>
            )}
            
             <Link to="/faq" className="flex items-center w-full px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors">
                <HelpCircle size={18} className="mr-3" />
                <span className="font-medium text-sm">Help & Support</span>
             </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
