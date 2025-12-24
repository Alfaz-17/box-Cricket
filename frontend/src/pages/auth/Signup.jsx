import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Label } from '../../components/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-secondary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Subtle Lens Flare */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          
          {/* Logo and Branding */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block relative mb-6"
            >
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <img 
                src={logoIcon} 
                alt="BookMyBox Logo" 
                className="h-20 w-20 relative z-10 drop-shadow-[0_0_30px_rgba(69,85,45,0.4)]" 
              />
            </motion.div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase font-display mb-1">
              Join <span className="text-primary">The Club</span>
            </h1>
            <p className="text-muted-foreground font-medium text-sm tracking-widest uppercase opacity-60">
              Create your athletic profile
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Phase 1: OTP Verification */}
              {!isOtpVerified && (
                <motion.div
                  key="otp-phase"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Contact Number */}
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                      Contact Number
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="Enter Contact Number"
                        className={errors.contactNumber ? 'border-destructive/50' : ''}
                      />
                      <Button
                        type="button"
                        onClick={sendOtp}
                        variant="secondary"
                        disabled={isOtpSending || !formData.contactNumber}
                        className="h-12 px-6"
                      >
                        {isOtpSending ? '...' : 'OTP'}
                      </Button>
                    </div>
                    {errors.contactNumber && (
                      <p className="text-[10px] text-destructive font-bold uppercase tracking-wider pl-1">{errors.contactNumber}</p>
                    )}
                  </div>

                  {/* OTP Input */}
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                      Security Code
                    </Label>
                    <Input
                      id="otp"
                      name="otp"
                      type="text"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="6-Digit OTP"
                      className={errors.otp ? 'border-destructive/50' : ''}
                    />
                    {errors.otp && (
                      <p className="text-[10px] text-destructive font-bold uppercase tracking-wider pl-1">{errors.otp}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    onClick={verifyOtp}
                    className="w-full"
                    size="lg"
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
                  className="space-y-5"
                >
                  {/* Verified Badge */}
                  <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-4 border border-primary/20">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                       <CheckCircle2 className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Verified Access</p>
                      <p className="text-base font-black text-white">{formData.contactNumber}</p>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Full Name"
                      className={errors.name ? 'border-destructive/50' : ''}
                    />
                    {errors.name && <p className="text-[10px] text-destructive font-bold uppercase tracking-wider pl-1">{errors.name}</p>}
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                        Security Key
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Password"
                          className={errors.password ? 'border-destructive/50' : ''}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                        Confirm Key
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm"
                          className={errors.confirmPassword ? 'border-destructive/50' : ''}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Role & Owner Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                        User Role
                      </Label>
                      <Select value={formData.role} onValueChange={handleSelectChange}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Player</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.role === 'owner' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="ownerCode" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 pl-1">
                          Owner Code
                        </Label>
                        <Input
                          id="ownerCode"
                          name="ownerCode"
                          type="password"
                          value={formData.ownerCode}
                          onChange={handleChange}
                          placeholder="Code"
                          className={errors.ownerCode ? 'border-destructive/50' : ''}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-center space-x-3 py-2 pl-1">
                    <Checkbox
                      id="terms"
                      required
                      className="w-5 h-5 rounded-lg border-2 border-white/10 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="terms" className="text-xs font-bold text-white/40 cursor-pointer select-none uppercase tracking-wider">
                      Accept <span className="text-primary underline">Regulations</span>
                    </Label>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Initialize Profile'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Login Link */}
          <div className="text-center mt-12 pt-8 border-t border-white/5">
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">
              Part of the club? {' '}
              <Link
                to="/login"
                className="text-primary hover:text-accent transition-colors underline underline-offset-4 decoration-2"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
