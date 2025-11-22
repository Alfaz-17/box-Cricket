import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Branding Panel */}
      <div className="hidden md:flex w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12">
        {/* Abstract Sporty Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full border-[80px] border-white/20 blur-xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-white/20 blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/10 transform hover:scale-105 transition-transform duration-500">
            <img src="/src/assets/logo-icon.svg" alt="BookMyBox Logo" className="h-48 w-48 object-contain drop-shadow-xl" />
          </div>
          <div className="space-y-4">
            <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-7xl font-bold text-primary-foreground tracking-wider drop-shadow-md">
              Join the Club
            </h1>
            <p className="text-xl text-primary-foreground/90 font-medium max-w-md leading-relaxed">
              Create your account and start booking premium cricket turfs today.
            </p>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-24 lg:px-32 bg-background relative overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex flex-col items-center mb-6">
             <img src="/src/assets/logo-icon.svg" alt="BookMyBox" className="h-20 w-20 object-contain mb-3" />
             <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl font-bold text-primary">Book My Box</h1>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl md:text-5xl font-bold text-foreground tracking-wide">
              Create Account
            </h2>
            <p className="text-muted-foreground text-lg">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phase 1: OTP Verification */}
            {!isOtpVerified && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Contact Number</Label>
                  <div className="flex gap-3">
                      <Input
                        id="contactNumber"
                        name="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        placeholder="Enter 10-digit number"
                        className={`h-12 bg-muted/30 border-2 focus:border-primary/50 focus:ring-0 rounded-xl transition-all duration-200 ${errors.contactNumber ? 'border-destructive' : 'border-transparent hover:border-primary/20'}`}
                      />
                      <Button 
                        type="button" 
                        onClick={sendOtp} 
                        disabled={isOtpSending || !formData.contactNumber}
                        className="h-12 px-6 rounded-xl font-bold uppercase tracking-wide bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      >
                        {isOtpSending ? 'Sending...' : 'Send OTP'}
                      </Button>
                  </div>
                  {errors.contactNumber && <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.contactNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Enter OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter the 6-digit code"
                    className={`h-12 bg-muted/30 border-2 focus:border-primary/50 focus:ring-0 rounded-xl transition-all duration-200 ${errors.otp ? 'border-destructive' : 'border-transparent hover:border-primary/20'}`}
                  />
                  {errors.otp && <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.otp}</p>}
                </div>

                <Button type="button" onClick={verifyOtp} className="w-full h-12 text-lg font-bold tracking-wider uppercase rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  Verify & Continue
                </Button>
              </div>
            )}

            {/* Phase 2: Account Details */}
            {isOtpVerified && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-primary/10 rounded-xl flex items-center gap-3 mb-4 border border-primary/20">
                    <CheckCircle2 className="text-primary h-6 w-6" />
                    <div>
                        <p className="text-sm font-bold text-primary">Number Verified</p>
                        <p className="text-xs text-muted-foreground">{formData.contactNumber}</p>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`h-12 bg-muted/30 border-2 focus:border-primary/50 focus:ring-0 rounded-xl transition-all duration-200 ${errors.name ? 'border-destructive' : 'border-transparent hover:border-primary/20'}`}
                  />
                  {errors.name && <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create password"
                        className={`h-12 bg-muted/30 border-2 focus:border-primary/50 focus:ring-0 rounded-xl transition-all duration-200 ${errors.password ? 'border-destructive' : 'border-transparent hover:border-primary/20'}`}
                    />
                    {errors.password && <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Confirm</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className={`h-12 bg-muted/30 border-2 focus:border-primary/50 focus:ring-0 rounded-xl transition-all duration-200 ${errors.confirmPassword ? 'border-destructive' : 'border-transparent hover:border-primary/20'}`}
                    />
                    {errors.confirmPassword && <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.confirmPassword}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">I am a</Label>
                  <Select value={formData.role} onValueChange={handleSelectChange}>
                    <SelectTrigger className="h-12 bg-muted/30 border-2 border-transparent hover:border-primary/20 focus:border-primary/50 focus:ring-0 rounded-xl">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Player (User)</SelectItem>
                      <SelectItem value="owner">Turf Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'owner' && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="ownerCode" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Owner Code</Label>
                    <Input
                      id="ownerCode"
                      name="ownerCode"
                      type="password"
                      value={formData.ownerCode}
                      onChange={handleChange}
                      placeholder="Enter owner verification code"
                      className={`h-12 bg-muted/30 border-2 focus:border-primary/50 focus:ring-0 rounded-xl transition-all duration-200 ${errors.ownerCode ? 'border-destructive' : 'border-transparent hover:border-primary/20'}`}
                    />
                    {errors.ownerCode && <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.ownerCode}</p>}
                  </div>
                )}

                <div className="flex items-center space-x-2 py-2">
                  <Checkbox id="terms" required className="rounded border-2 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <Label htmlFor="terms" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                    I agree to the <span className="text-primary hover:underline">Terms</span> & <span className="text-primary hover:underline">Privacy Policy</span>
                  </Label>
                </div>

                <Button type="submit" className="w-full h-14 text-lg font-bold tracking-wider uppercase rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300" disabled={isLoading}>
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
              </div>
            )}
          </form>

          <div className="text-center">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
