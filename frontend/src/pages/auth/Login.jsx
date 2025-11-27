import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import api from '../../utils/api';
import logoIcon from '../../assets/logo-icon.svg';

const Login = () => {
  const [contactNumber, setContactNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    const newErrors = {};
    if (!contactNumber) newErrors.contactNumber = 'Contact number is required';
    else if (contactNumber.length !== 10) newErrors.contactNumber = 'Contact number must be 10 digits';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { contactNumber, password });
      localStorage.setItem('token', response.data.token);
      login(response.data.user);
      toast.success('Login successful');
      navigate(from);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      {/* Centered Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Branding */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/30 blur-2xl rounded-full" />
              <img 
                src={logoIcon} 
                alt="BookMyBox Logo" 
                className="h-20 w-20 relative z-10 drop-shadow-[0_0_20px_rgba(143,163,30,0.4)]" 
              />
            </div>
          </div>
          <h1 
            style={{ fontFamily: 'Bebas Neue' }} 
            className="text-5xl font-bold bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent tracking-wider mb-2"
          >
            Welcome Back
          </h1>
          <p className="text-foreground/60 text-lg">
            Sign in to continue booking
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Contact Number */}
          <div className="space-y-2">
            <Label 
              htmlFor="contactNumber" 
              className="text-sm font-semibold text-foreground/80 uppercase tracking-wider"
            >
              Contact Number
            </Label>
            <Input
              id="contactNumber"
              type="tel"
              placeholder="Enter 10-digit number"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className={`h-14 bg-background/40 backdrop-blur-sm border-2 focus:border-secondary/50 focus:ring-0 focus:ring-offset-0 rounded-xl transition-all duration-200 text-base placeholder:text-foreground/30 ${
                errors.contactNumber 
                  ? 'border-red-500/50 focus:border-red-500' 
                  : 'border-foreground/10 hover:border-foreground/20'
              }`}
            />
            {errors.contactNumber && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 font-medium ml-1"
              >
                {errors.contactNumber}
              </motion.p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label 
                htmlFor="password" 
                className="text-sm font-semibold text-foreground/80 uppercase tracking-wider"
              >
                Password
              </Label>
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-secondary hover:text-accent transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`h-14 bg-background/40 backdrop-blur-sm border-2 focus:border-secondary/50 focus:ring-0 focus:ring-offset-0 rounded-xl transition-all duration-200 text-base pr-12 placeholder:text-foreground/30 ${
                  errors.password 
                    ? 'border-red-500/50 focus:border-red-500' 
                    : 'border-foreground/10 hover:border-foreground/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 font-medium ml-1"
              >
                {errors.password}
              </motion.p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2 py-1">
            <Checkbox 
              id="remember" 
              className="rounded border-2 border-foreground/20 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary" 
            />
            <Label 
              htmlFor="remember" 
              className="text-sm font-medium text-foreground/70 cursor-pointer select-none"
            >
              Keep me logged in
            </Label>
          </div>

          {/* Submit Button */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold tracking-wider uppercase rounded-xl bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight size={20} strokeWidth={2.5} />
                </span>
              )}
            </Button>
          </motion.div>
        </motion.form>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-foreground/60">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-secondary font-bold hover:text-accent transition-colors underline decoration-2 underline-offset-4"
            >
              Create Account
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
