import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import api from '../../utils/api';
import logoIcon from '../../assets/logo-icon.svg';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    role: 'user',
    ownerCode: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const sendOtp = async () => {
    if (!formData.contactNumber.trim()) return toast.error('Enter contact number first');
    setIsOtpSending(true);
    try {
      const response = await api.post('/auth/otp', {
        contactNumber: formData.contactNumber,
        action: 'signup',
      });
      toast.success(response.data.message || 'OTP sent successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsOtpSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!formData.otp.trim()) return toast.error('Please enter OTP');
    try {
      const response = await api.post('/auth/verify-otp', {
        contactNumber: formData.contactNumber,
        otp: formData.otp,
      });
      toast.success(response.data.message || 'OTP verified successfully');
      setIsOtpVerified(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, password, confirmPassword, otp } = formData;

    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!otp.trim()) newErrors.otp = 'OTP is required';
    if (!name) newErrors.name = 'Name is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (formData.role === 'owner' && !formData.ownerCode.trim())
      newErrors.ownerCode = 'Owner code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const payload = {
      name: formData.name,
      password: formData.password,
      role: formData.role,
      contactNumber: formData.contactNumber,
      otp: formData.otp,
      ...(formData.role === 'owner' && { ownerCode: formData.ownerCode }),
    };

    try {
      const response = await api.post('/auth/signup', payload);
      login(response.data.user);
      localStorage.setItem('token', response.data.token);
      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
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
            Join The Club
          </h1>
          <p className="text-foreground/60 text-lg">
            Create your account to start booking
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
          <AnimatePresence mode="wait">
            {/* Phase 1: OTP Verification */}
            {!isOtpVerified && (
              <motion.div
                key="otp-phase"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Contact Number */}
                <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                    Contact Number
                  </Label>
                  <div className="flex gap-3">
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Enter 10-digit number"
                      className={`h-14 bg-background/40 backdrop-blur-sm border-2 focus:border-secondary/50 focus:ring-0 rounded-xl transition-all ${
                        errors.contactNumber ? 'border-red-500/50' : 'border-foreground/10 hover:border-foreground/20'
                      }`}
                    />
                    <Button
                      type="button"
                      onClick={sendOtp}
                      disabled={isOtpSending || !formData.contactNumber}
                      className="h-14 px-6 rounded-xl font-bold uppercase bg-secondary hover:bg-secondary/90 whitespace-nowrap"
                    >
                      {isOtpSending ? 'Sending...' : 'Send OTP'}
                    </Button>
                  </div>
                  {errors.contactNumber && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 font-medium ml-1">
                      {errors.contactNumber}
                    </motion.p>
                  )}
                </div>

                {/* OTP Input */}
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter the 6-digit code"
                    className={`h-14 bg-background/40 backdrop-blur-sm border-2 focus:border-secondary/50 focus:ring-0 rounded-xl ${
                      errors.otp ? 'border-red-500/50' : 'border-foreground/10 hover:border-foreground/20'
                    }`}
                  />
                  {errors.otp && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 font-medium ml-1">
                      {errors.otp}
                    </motion.p>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={verifyOtp}
                  className="w-full h-14 text-lg font-bold uppercase rounded-xl bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg"
                >
                  Verify & Continue
                </Button>
              </motion.div>
            )}

            {/* Phase 2: Account Details */}
            {isOtpVerified && (
              <motion.div
                key="details-phase"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Verified Badge */}
                <div className="p-4 bg-secondary/10 rounded-xl flex items-center gap-3 border border-secondary/20">
                  <CheckCircle2 className="text-secondary h-6 w-6 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-secondary">Number Verified</p>
                    <p className="text-xs text-foreground/60">{formData.contactNumber}</p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`h-14 bg-background/40 backdrop-blur-sm border-2 focus:border-secondary/50 focus:ring-0 rounded-xl ${
                      errors.name ? 'border-red-500/50' : 'border-foreground/10 hover:border-foreground/20'
                    }`}
                  />
                  {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 ml-1">{errors.name}</motion.p>}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create password"
                        className={`h-14 bg-background/40 backdrop-blur-sm border-2 focus:border-secondary/50 focus:ring-0 rounded-xl pr-12 ${
                          errors.password ? 'border-red-500/50' : 'border-foreground/10 hover:border-foreground/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 ml-1">{errors.password}</motion.p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Confirm
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={`h-14 bg-background/40 backdrop-blur-sm border-2 focus:border-secondary/50 focus:ring-0 rounded-xl pr-12 ${
                          errors.confirmPassword ? 'border-red-500/50' : 'border-foreground/10 hover:border-foreground/20'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground/80"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 ml-1">{errors.confirmPassword}</motion.p>}
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                    I am a
                  </Label>
                  <Select value={formData.role} onValueChange={handleSelectChange}>
                    <SelectTrigger className="h-14 bg-background/40 backdrop-blur-sm border-2 border-foreground/10 hover:border-foreground/20 focus:border-secondary/50 focus:ring-0 rounded-xl">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Player (User)</SelectItem>
                      <SelectItem value="owner">Turf Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Owner Code (conditional) */}
                {formData.role === 'owner' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="ownerCode" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                      Owner Code
                    </Label>
                    <Input
                      id="ownerCode"
                      name="ownerCode"
                      type="password"
                      value={formData.ownerCode}
                      onChange={handleChange}
                      placeholder="Enter owner verification code"
                      className={`h-14 bg-background/40 backdrop-blur-sm border-2 focus:border-secondary/50 focus:ring-0 rounded-xl ${
                        errors.ownerCode ? 'border-red-500/50' : 'border-foreground/10 hover:border-foreground/20'
                      }`}
                    />
                    {errors.ownerCode && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 ml-1">{errors.ownerCode}</motion.p>}
                  </motion.div>
                )}

                {/* Terms Checkbox */}
                <div className="flex items-center space-x-2 py-2">
                  <Checkbox
                    id="terms"
                    required
                    className="rounded border-2 border-foreground/20 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                  />
                  <Label htmlFor="terms" className="text-sm font-medium text-foreground/70 cursor-pointer select-none">
                    I agree to the <span className="text-secondary hover:underline">Terms</span> & <span className="text-secondary hover:underline">Privacy Policy</span>
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold uppercase rounded-xl bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign Up <ArrowRight size={20} strokeWidth={2.5} />
                    </span>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <p className="text-foreground/60">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-secondary font-bold hover:text-accent transition-colors underline decoration-2 underline-offset-4"
            >
              Log In
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Signup;
