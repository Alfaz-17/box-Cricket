import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Bell, LogOut, Home, Calendar, Settings, LayoutDashboard, Package, Lock, UserCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import AuthContext from '../../context/AuthContext'
import Sidebar from '../admin/Sidebar'
import BookMyBoxLogo from '../../assets/cri.png'
import useNotificationStore from '../../store/useNotificationStore'
import { Button } from '../ui/button'

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const { user, isAuthenticated, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const unreadCount = useNotificationStore(state => state.unreadCount)
  const { fetchUnreadCount } = useNotificationStore.getState()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  const handleLogout = () => {
    logout()
    navigate('/')
    setSidebarOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-50 backdrop-blur-lg bg-background/70 border-b border-primary/20 shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Gradient Effect */}
            <Link
              to="/"
              className="flex items-center space-x-2 group"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <img className="h-12 w-12" src={BookMyBoxLogo} alt="BookMyBox Logo" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300" />
              </motion.div>
              <h1
                style={{ fontFamily: 'Bebas Neue' }}
                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
              >
                Book My Box
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <NavLink to="/" icon={Home} isActive={isActive('/')}>
                Home
              </NavLink>

              {isAuthenticated && user?.role === 'user' && (
                <NavLink to="/my-bookings" icon={Calendar} isActive={isActive('/my-bookings')}>
                  My Bookings
                </NavLink>
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
                  <NavLink to="/my-profile" icon={UserCircle} isActive={isActive('/my-profile')}>
                    Profile
                  </NavLink>
                </>
              )}

              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 hover:to-red-600/90 shadow-md"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </motion.div>
              ) : (
                <>
                  <NavLink to="/login" icon={UserCircle} isActive={isActive('/login')}>
                    Login
                  </NavLink>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md">
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </motion.div>
                  <NavLink to="/settings" icon={Settings} isActive={isActive('/settings')}>
                    Settings
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="flex md:hidden items-center space-x-3">
              <Link to="/notifications" className="relative group">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Bell className="w-6 h-6 text-primary group-hover:text-secondary transition-colors" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setSidebarOpen(true)}
                  size="icon"
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md"
                >
                  <Menu size={24} />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {isMobile && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
    </>
  )
}

// Enhanced NavLink Component
const NavLink = ({ to, icon: Icon, children, isActive }) => {
  return (
    <Link to={to}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="relative"
      >
        <Button
          variant="ghost"
          className={`relative group ${
            isActive
              ? 'bg-primary/10 text-primary'
              : 'hover:bg-primary/5'
          }`}
        >
          {Icon && <Icon size={18} className="mr-2" />}
          {children}
          
          {/* Active Indicator */}
          {isActive && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          
          {/* Hover Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
        </Button>
      </motion.div>
    </Link>
  )
}

export default Navbar
