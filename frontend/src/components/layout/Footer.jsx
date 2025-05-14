import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy

, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-yellow-300 to-yellow-400 dark:from-gray-800 dark:to-gray-900 text-yellow-900 dark:text-yellow-100 shadow-inner transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center mb-4">
              <Trophy

 size={24} className="text-yellow-700 dark:text-yellow-400 mr-2" />
              <span className="font-bold text-xl">Trophy

 Box</span>
            </Link>
            <p className="max-w-xs text-yellow-800 dark:text-yellow-200 text-sm">
              Find and book the perfect Trophy

 box for your practice sessions and matches.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
                <li>
                  <Link to="/" className="hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors duration-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors duration-300">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors duration-300">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
                <li>
                  <a href="#" className="hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors duration-300">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors duration-300">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors duration-300">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2 text-yellow-800 dark:text-yellow-200">
                <li className="flex items-center">
                  <Mail size={16} className="mr-2 text-yellow-700 dark:text-yellow-400" />
                  <a href="mailto:contact@Trophy

box.com" className="hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors duration-300">
                    contact@Trophy

box.com
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone size={16} className="mr-2 text-yellow-700 dark:text-yellow-400" />
                  <a href="tel:+1234567890" className="hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors duration-300">
                    +123 456 7890
                  </a>
                </li>
                <li className="flex items-start">
                  <MapPin size={16} className="mr-2 mt-1 text-yellow-700 dark:text-yellow-400" />
                  <span>123 Trophy

 Lane, Sports City, SC 12345</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-yellow-400 dark:border-gray-700 text-center text-sm text-yellow-800 dark:text-yellow-200">
          <p>&copy; {currentYear} Trophy

 Box Booking System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;