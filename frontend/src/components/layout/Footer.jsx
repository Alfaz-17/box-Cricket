import { Link } from "react-router-dom";
import { Trophy, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-base-300 shadow-inner transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Branding */}
          <div>
            <Link to="/" className="flex items-center mb-4 btn btn-ghost">
              <Trophy size={24} className="btn btn-ghost mr-2" />
              <span className="font-bold text-2xl">Book My Box</span>
            </Link>
            <p className="max-w-sm text-sm text-primary">
              Discover and book top-notch cricket boxes for your matches and practice sessions in just a few clicks.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-primary  transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary  transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="hover:text-primary transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-primary transition-colors">
                 Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-primary  transition-colors">
                    Signup
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Mail size={16} className="mr-2 text-primary " />
                  <a href="mailto:contact@bookmybox.com" className="hover:text-primary  transition-colors">
                    alfaz_bilakhiya17@gmail.com
                  </a>
                </li>
                <li className="flex items-center">
                  <Phone size={16} className="mr-2 text-primary  dark:text-primary " />
                  <a href="tel:+916353783332" className="hover:text-primary  dark:hover:text-primary ">
                    +91 63537 83332
                  </a>
                </li>
                <li className="flex items-start">
                  <MapPin size={16} className="mr-2 mt-1 text-primary dark:text-primary" />
                  <span>No Locatoin provided</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 pt-6 border-t base-100 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <a href="#" aria-label="Facebook" className="hover:text-primary dark:hover:text-primary transition-colors">
              <Facebook size={20} />
            </a>
            <a href="https://www.instagram.com/alfaz_bilakhiya17?igsh=MXBpc2NtMzI5MTZ6aA%3D%3D&utm_source=qr" aria-label="Instagram" className="hover:text-primary transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-primary dark:hover:text-primary transition-colors">
              <Twitter size={20} />
            </a>
          </div>
          <p className="text-sm text-primary">
            &copy; {currentYear} Book My Box. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
