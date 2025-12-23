import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin, Send, Heart, Trophy, Award, Target } from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import logoIcon from '../../assets/logo-icon.svg'

const currentYear = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-br from-muted via-background to-muted border-t border-primary/20">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary to-secondary rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-accent to-primary rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Branding Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Link to="/" className="flex items-center mb-4 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <img className="h-12 w-12" src={logoIcon} alt="BookMyBox Logo" />
              </motion.div>
              <h1
                style={{ fontFamily: 'Bebas Neue' }}
                className="ml-2 text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
              >
                BookMyBox
              </h1>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Discover and book top-notch cricket boxes for your matches and practice sessions in
              just a few clicks. Your gateway to premium cricket facilities.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <StatBadge icon={Trophy} value="500+" label="Users" />
              <StatBadge icon={Award} value="1K+" label="Bookings" />
              <StatBadge icon={Target} value="98%" label="Rating" />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 style={{ fontFamily: 'Bebas Neue' }} className="text-xl font-bold mb-4 text-primary">
              Quick Links
            </h3>
            <ul className="space-y-3 text-sm">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/about-us">About Us</FooterLink>
              <FooterLink to="/services">Services</FooterLink>
              <FooterLink to="/login">Login</FooterLink>
               <FooterLink to="/signup">Sign Up</FooterLink>
               <FooterLink to="/my-bookings">My Bookings</FooterLink>
               <FooterLink to="/contact-us">List Your Turf</FooterLink>
               <li>
                 <a 
                   href="/bookmybox.apk" 
                   download 
                   className="text-muted-foreground hover:text-primary transition-colors flex items-center group font-semibold text-secondary"
                 >
                   <motion.span
                     whileHover={{ x: 5 }}
                     className="w-1.5 h-1.5 bg-secondary rounded-full mr-2 group-hover:scale-150 transition-transform"
                   />
                   Download Mobile App (APK)
                 </a>
               </li>
             </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 style={{ fontFamily: 'Bebas Neue' }} className="text-xl font-bold mb-4 text-primary">
              Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/policies" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform" />
                  Policies & FAQs
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors flex items-center group">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform" />
                  Help Center
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact & Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 style={{ fontFamily: 'Bebas Neue' }} className="text-xl font-bold mb-4 text-primary">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm mb-6">
              <li className="flex items-center text-muted-foreground hover:text-primary transition-colors group">
                <Mail size={16} className="mr-2 text-primary group-hover:scale-110 transition-transform" />
                <a href="mailto:alfazbilakhiya17@gmail.com" className="truncate">
                  alfazbilakhiya17@gmail.com
                </a>
              </li>
              <li className="flex items-center text-muted-foreground hover:text-primary transition-colors group">
                <Phone size={16} className="mr-2 text-primary group-hover:scale-110 transition-transform" />
                <a href="tel:+916353783332">+91 63537 83332</a>
              </li>
               <li className="flex items-center text-muted-foreground hover:text-primary transition-colors group">
                <Phone size={16} className="mr-2 text-primary group-hover:scale-110 transition-transform" />
                <a href="#">Bilakhiya Alfaj Abbasbhai</a>
              </li>
              <li className="flex items-start text-muted-foreground group">
                <MapPin size={16} className="mr-2 mt-0.5 text-primary group-hover:scale-110 transition-transform" />
                {/* <span>navapara Bhavngar-364001 Gujrat, India</span> */}
               <span> Bhavngar-364001 Gujrat, India</span>

              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Stay Updated</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="h-9 text-sm border-primary/20"
                />
                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-md">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-8 border-t border-primary/20"
        >
          {/* Social Media */}
          {/* <div className="flex justify-center gap-4 mb-6">
            <SocialIcon href="#" icon={Facebook} label="Facebook" />
            <SocialIcon
              href="https://www.instagram.com/alfaz_bilakhiya17?igsh=MXBpc2NtMzI5MTZ6aA%3D%3D&utm_source=qr"
              icon={Instagram}
              label="Instagram"
            />
            <SocialIcon href="#" icon={Twitter} label="Twitter" />
            <SocialIcon href="#" icon={Linkedin} label="LinkedIn" />
          </div> */}

          {/* Copyright */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              © {currentYear} BookMyBox. Made with
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Heart size={14} className="text-red-500 fill-red-500" />
              </motion.span>
              in India. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

// Stat Badge Component
const StatBadge = ({ icon: Icon, value, label }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="bg-card border border-primary/20 rounded-lg p-2 text-center"
    >
      <Icon className="h-4 w-4 mx-auto mb-1 text-primary" />
      <div className="text-xs font-bold" style={{ fontFamily: 'Bebas Neue' }}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </motion.div>
  )
}

// Footer Link Component
const FooterLink = ({ to, children }) => {
  return (
    <li>
      <Link
        to={to}
        className="text-muted-foreground hover:text-primary transition-colors flex items-center group"
      >
        <motion.span
          whileHover={{ x: 5 }}
          className="w-1.5 h-1.5 bg-primary rounded-full mr-2 group-hover:scale-150 transition-transform"
        />
        {children}
      </Link>
    </li>
  )
}

// Social Icon Component
const SocialIcon = ({ href, icon: Icon, label }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      whileHover={{ scale: 1.2, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      className="w-10 h-10 rounded-full bg-card border border-primary/20 flex items-center justify-center hover:bg-gradient-to-br hover:from-primary hover:to-secondary hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
    >
      <Icon size={18} />
    </motion.a>
  )
}
