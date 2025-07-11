import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Mail,
  Group,
  Contact

} from "lucide-react";
import AuthContext from "../../context/AuthContext";
import BookMyBoxLogo from '../../assets/cri.png';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useContext(AuthContext);




  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };



  const handleLogout = () => {
    const confirmLogout = confirm("You want to log out?");
    if (!confirmLogout) return;
    logout();
    navigate("/");
    localStorage.removeItem("token"); 
    if (onClose) onClose();
  };



  // Role-based menus
  const adminMenuItems = [
    { path: "/", name: "Home", icon: <Home size={20} /> },
    { path: "/admin", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { path: "/admin/boxes", name: "Box Management", icon: <Box size={20} /> },
    { path: "/admin/bookings", name: "Bookings", icon: <Calendar size={20} /> },
    {path: "/admin/block-slot",name: "Block Time Slots",icon: <Clock size={20} />,},
    { path: "/my-profile", name: "My Profile", icon: <Users size={20} /> },
    { path: "/settings", name: "Settings", icon: <Settings size={20} /> },
        { path: "/groups", name: " Group", icon: <Group size={20} /> },

  ];

  const userMenuItems = [
    { path: "/", name: "Home", icon: <Home size={20} /> },
    {path: "/my-bookings",name: "My Bookings",icon: <CalendarCheck size={20} />,},
    { path: "/groups", name: " Group", icon: <Group size={20} /> },
    { path: "/my-profile", name: "My Profile", icon: <Users size={20} /> },
    { path: "/settings", name: "Settings", icon: <Settings size={20} /> },
    { path: "/support", name: "Contact Us", icon: <Contact size={20} /> },
    { path: "/faq", name: " FAQ !", icon: <HelpCircle size={20} /> },

  ];

  const guestMenuItems = [
    { path: "/", name: "Home", icon: <Home size={20} /> },
    { path: "/login", name: "Login", icon: <LogIn size={20} /> },
    { path: "/settings", name: " Settings", icon: <Settings size={20} /> },
    { path: "/faq", name: " FAQ !", icon: <HelpCircle size={20} /> },

  ];

  // Select which menu to show
  let menuItems = guestMenuItems;
  if (isAuthenticated) {
    if (user?.role === "owner") menuItems = adminMenuItems;
    else if (user?.role === "user") menuItems = userMenuItems;
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`h-screen w-64 bg-base-100 shadow-lg transition-transform duration-300 ease-in-out z-50
        fixed inset-y-0 right-0 lg:sticky lg:top-0
        ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full bg-base-300">
          {/* Header */}
       <div className="p-4 border-b bg-base-100 flex items-center justify-between">
  {/* Left Logo + Branding */}
  <div className="flex items-center space-x-2">
    <img
      className="h-10 w-10 object-contain"
      src={BookMyBoxLogo}
      alt="BookMyBox Logo"
    />
    <div
      style={{ fontFamily: "Bebas Neue" }}
      className="text-primary font-bold text-3xl tracking-wide"
    >
      {isAuthenticated
        ? user?.role === "owner"
          ? "BookMyBox"
          : "BookMyBox"
        : "Welcome"}
    </div>
  </div>

  {/* Optional right side (could be user avatar, logout, etc.) */}
  {/* <div>Right Actions</div> */}
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
                      ${
                        isActive(item.path)
                          ? "bg-primary  text-primary-content"
                          : " hover:bg-primary   "
                      }
                    `}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                  >
                    <span className="mr-3   ">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="flex items-center w-full btn px-4 py-2 rounded-md hover:bg-base-100 "
            >
              <LogOut size={20} className="mr-3 " />
              <span>Logout</span>
            </button>
          )}
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center  rounded-md hover:bg-base-100"
              >
                <HelpCircle size={20} className="mr-3 text-primary" />
                <span>Help & Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
