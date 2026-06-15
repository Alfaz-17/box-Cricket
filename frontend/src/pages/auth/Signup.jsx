import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import AuthContext from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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
    role: 'user',
    ownerCode: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.role === 'owner' && !formData.ownerCode.trim()) {
      newErrors.ownerCode = 'Owner code is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (!validateForm()) return;
      
      try {
        setIsLoading(true);
        const res = await api.post('/auth/google', { 
          token: tokenResponse.credential || tokenResponse.access_token,
          role: formData.role,
          ownerCode: formData.role === 'owner' ? formData.ownerCode : undefined,
          action: 'signup'
        });
        localStorage.setItem('token', res.data.token);
        login(res.data.user);
        toast.success('Account created successfully');
        navigate('/');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Google Signup failed');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error('Google Signup failed');
    }
  });

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
              Create your athletic profile instantly
            </p>
          </div>

          <div className="space-y-8">
            {/* Role & Owner Code */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="role" className="text-xs font-black uppercase tracking-[0.2em] text-white/70 pl-1">
                  Select User Role
                </Label>
                <Select value={formData.role} onValueChange={handleSelectChange}>
                  <SelectTrigger className="h-14 border-white/10 bg-white/5 text-lg">
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
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  <Label htmlFor="ownerCode" className="text-xs font-black uppercase tracking-[0.2em] text-white/70 pl-1">
                    Owner Verification Code
                  </Label>
                  <Input
                    id="ownerCode"
                    name="ownerCode"
                    type="password"
                    value={formData.ownerCode}
                    onChange={handleChange}
                    placeholder="Enter Owner Code"
                    className={`h-14 bg-white/5 border-white/10 text-lg ${errors.ownerCode ? 'border-destructive/50' : ''}`}
                  />
                  {errors.ownerCode && (
                    <p className="text-xs text-destructive font-bold uppercase tracking-wider pl-1">{errors.ownerCode}</p>
                  )}
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
              <Label htmlFor="terms" className="text-sm font-bold text-white/60 cursor-pointer select-none uppercase tracking-wider">
                Accept <span className="text-primary underline">Regulations</span>
              </Label>
            </div>

            {/* Google Signup Button */}
            <Button 
              type="button" 
              variant="outline"
              size="lg"
              className="w-full h-14 flex items-center justify-center gap-3 border-white/20 mt-4 bg-white/5 hover:bg-white/10 text-lg shadow-lg hover:shadow-white/5"
              onClick={() => handleGoogleSignup()}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isLoading ? 'Creating Account...' : 'Continue with Google'}
            </Button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-12 pt-8 border-t border-white/5">
            <p className="text-sm font-bold text-white/50 uppercase tracking-widest">
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
