import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn, ArrowRight } from 'lucide-react';
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
            <img src={logoIcon} alt="BookMyBox Logo" className="h-48 w-48 object-contain drop-shadow-xl" />
          </div>
          <div className="space-y-4">
            <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-7xl font-bold text-primary-foreground tracking-wider drop-shadow-md">
              Book My Box
            </h1>
            <p className="text-xl text-primary-foreground/90 font-medium max-w-md leading-relaxed">
              Your ultimate destination for booking premium cricket turfs. Play like a pro, book in seconds.
            </p>
          </div>
        </div>
      </div>
      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-24 lg:px-32 bg-background relative">
        <div className="max-w-md w-full mx-auto space-y-10">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="md:hidden flex flex-col items-center mb-8">
             <img src={logoIcon} alt="BookMyBox" className="h-24 w-24 object-contain mb-4" />
             <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl font-bold text-primary">Book My Box</h1>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-4xl md:text-5xl font-bold text-foreground tracking-wide">
              Welcome Back
            </h2>
            <p className="text-muted-foreground text-lg">
              Enter your details to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Contact Number</Label>
                <div className="relative">
                    <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="Enter 10-digit number"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className={`h-12 bg-muted/30 border-2 focus:border-primary/50 focus:ring-0 rounded-xl transition-all duration-200 ${errors.contactNumber ? 'border-destructive' : 'border-transparent hover:border-primary/20'}`}
                    />
                </div>
                {errors.contactNumber && (
                  <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.contactNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Password</Label>
                    <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                        Forgot Password?
                    </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 bg-muted/30 border-2 focus:border-primary/50 focus:ring-0 rounded-xl transition-all duration-200 ${errors.password ? 'border-destructive' : 'border-transparent hover:border-primary/20'}`}
                />
                {errors.password && (
                  <p className="text-xs text-destructive font-medium mt-1 ml-1">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="rounded border-2 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <Label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
                Keep me logged in
              </Label>
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold tracking-wider uppercase rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging In...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight size={20} strokeWidth={2.5} />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-bold hover:underline decoration-2 underline-offset-4 transition-all">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
