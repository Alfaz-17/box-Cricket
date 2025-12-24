import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, Home, Calendar, Settings, LayoutDashboard, Package, Lock, UserCircle, X, ChevronDown, Contact2, FileQuestion, Building2, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import Sidebar from '../admin/Sidebar';

import { Button } from '../ui/Button';

import logoIcon from '../../assets/logo-icon.svg';

const Navbar = ({ onVoiceClick }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();



  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleLogout = () => {
    logout();
    navigate('/');
    setSidebarOpen(false);
  };

  const isActive = path => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-background/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(143,163,30,0.15)] border-b border-secondary/20' 
            : 'bg-background/80 backdrop-blur-md border-b border-border/50'
        }`}
      >
        {/* Animated Gradient Accent Line */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-secondary to-transparent"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%'],
            opacity: scrolled ? 0.8 : 0.4
          }}
          transition={{ 
            backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
            opacity: { duration: 0.3 }
          }}
          style={{ backgroundSize: '200% 100%' }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group relative z-10">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img 
                  className="h-10 w-10 sm:h-12 sm:w-12 relative z-10 drop-shadow-[0_0_8px_rgba(143,163,30,0.3)]" 
                  src={logoIcon} 
                  alt="BookMyBox Logo" 
                />
              </motion.div>
              <div className="flex flex-col leading-none">
                <span 
                  className="text-xl sm:text-2xl font-bold text-primary tracking-tight font-logo"
                >
                  BookMyBox
                </span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-medium">Premium Turfs</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/" icon={Home} isActive={isActive('/')}>Home</NavLink>
              
              {isAuthenticated && user?.role === 'user' && (
                <>
                <NavLink to="/my-bookings" icon={Calendar} isActive={isActive('/my-bookings')}>
                  My Bookings
                </NavLink>
                  <NavLink to="/about-us" icon={Info} isActive={isActive('/about-us')}>
                    About Us
                  </NavLink>
                  <NavLink to="/contact-us" icon={Building2} >
                    List Your Turf
                  </NavLink>
                   <NavLink to="/support" icon={Contact2} >
                    Contact us
                  </NavLink>
                   <NavLink to="/faq" icon={FileQuestion} >
                   FAQ
                  </NavLink>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  
                  </motion.div>
                  <NavLink to="/settings" icon={Settings} isActive={isActive('/settings')}>
                    Settings
                  </NavLink>
                  </>
                
              )}
              
              {isAuthenticated && user?.role === 'owner' && (
                <>
                  <NavLink to="/admin/bookings" icon={Calendar} isActive={isActive('/admin/bookings')}>
                    Bookings
                  </NavLink>
                  <NavLink to="/admin" icon={LayoutDashboard} isActive={isActive('/admin')}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/boxes" icon={Package} isActive={isActive('/admin/boxes')}>
                    Boxes
                  </NavLink>
                  <NavLink to="/admin/block-slot" icon={Lock} isActive={isActive('/admin/block-slot')}>
                    Block Slot
                  </NavLink>
                </>
              )}

              {/* AI Voice Assistant Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={onVoiceClick}
                  variant="ghost" 
                  size="sm"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 mr-2"
                >
                  <Sparkles size={16} className="mr-2" />
                  <span className="hidden sm:inline">AI Assistant</span>
                </Button>
              </motion.div>
              

              
              {/* Auth Buttons */}
              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleLogout} 
                    variant="outline"
                    className="ml-2 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50 text-red-400 hover:text-red-300"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                </motion.div>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <NavLink to="/about-us" icon={Info} isActive={isActive('/about-us')}>
                    About Us
                  </NavLink>
                   <NavLink to="/support" icon={Contact2} >
                    Contact us
                  </NavLink>
                   <NavLink to="/faq" icon={FileQuestion} >
                   FAQ
                  </NavLink>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  
                  </motion.div>
                  <NavLink to="/settings" icon={Settings} isActive={isActive('/settings')}>
                    Settings
                  </NavLink>
                  <NavLink to="/contact-us" icon={Building2} >
                    List Your Turf
                  </NavLink>
                   <NavLink to="/login" icon={UserCircle} isActive={isActive('/login')}>
                    Login
                  </NavLink> 
                    <Button 
                      asChild 
                      className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-primary-foreground shadow-lg shadow-secondary/20"
                    >
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - RESTORED */}
            <div className="flex lg:hidden items-center gap-3">
              {/* Mobile AI Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={onVoiceClick}
                  size="icon"
                  className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
                >
                  <Sparkles size={20} />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => setSidebarOpen(!sidebarOpen)} 
                  size="icon" 
                  className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg shadow-secondary/20"
                >
                  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Add padding to prevent content from being hidden under fixed navbar */}
      <div className="h-16 sm:h-18" />

      {isMobile && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onVoiceClick={onVoiceClick} />}
    </>
  );
};

// Professional NavLink Component with Hover Effects
const NavLink = ({ to, icon: Icon, children, isActive }) => {
  return (
    <Link to={to}>
      <motion.div 
        whileHover={{ y: -1 }} 
        whileTap={{ scale: 0.98 }} 
        className="relative"
      >
        <Button 
          variant="ghost" 
          size="sm"
          className={`relative group px-3 py-2 ${
            isActive 
              ? 'bg-secondary/15 text-secondary hover:bg-secondary/20' 
              : 'hover:bg-foreground/5 text-foreground/70 hover:text-foreground'
          }`}
        >
          {Icon && <Icon size={16} className="mr-2" />}
          <span className="text-sm font-medium">{children}</span>
          
          {/* Active Indicator */}
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-1 right-1 h-[2px] bg-gradient-to-r from-secondary via-accent to-secondary rounded-full"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          
          {/* Hover Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-secondary/5 to-secondary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
        </Button>
      </motion.div>
    </Link>
  );
};

export default Navbar;
