import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../utils/api'
const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    role: 'user',
    ownerCode: '',
    password: '',
    confirmPassword: '',
    otp: '',  // ✅ add otp field
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSending, setIsOtpSending] = useState(false);  // ✅ loading for OTP
const [otpSent, setOtpSent] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const sendOtp = async () => {
    if (!formData.contactNumber.trim()) {
      toast.error('Please enter your contact number first');
      return;
    }

    setIsOtpSending(true);
    try {
      const response = await api.post('/auth/otp', {
        contactNumber: formData.contactNumber,
      });
setOtpSent(true)
      toast.success(response.data.message || 'OTP sent successfully');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to send OTP'
      );
    } finally {
      setIsOtpSending(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { name, password, confirmPassword, otp } = formData;

    if (!name) newErrors.name = 'Name is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';

    if (formData.role === 'owner' && !formData.ownerCode.trim()) {
      newErrors.ownerCode = 'Owner code is required';
    }

    if (!otp.trim()) newErrors.otp = 'OTP is required';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const payload = {
      name: formData.name,
      contactNumber: formData.contactNumber,
      password: formData.password,
      role: formData.role,
      otp: formData.otp,  // ✅ include otp
    };

    if (formData.role === 'owner') {
      payload.ownerCode = formData.ownerCode;
    }

    try {
      const response = await api.post('/auth/signup', payload);

      const data = response.data;

      login(data.user, data.token);

      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card title="Create an Account" subtitle="Sign up to start booking cricket boxes">
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            error={errors.name}
          />
       

          {/* Contact Number + Send OTP Button */}
          <div className="mb-3">
           
            <div className="flex space-x-2">
              <Input
            label="Contact Numer"
            id="contactNumber"
            name="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={handleChange}
            placeholder="Enter the contactNumber"
            error={errors.contactNumber}
          />
             <button
                type="button"
                onClick={sendOtp}
                disabled={isOtpSending}
                className="px-1 py-1 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 focus:outline-none"
              >
                {isOtpSending ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
            {errors.contactNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
            )}
          </div>

          {/* OTP Input */}
         {otpSent && <Input
            label="OTP"
            id="otp"
            name="otp"
            type="text"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Enter the OTP"
            error={errors.otp}
          />}

          {/* Role Selector */}
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="user">User</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          {/* Conditionally show Owner Code input */}
          {formData.role === 'owner' && (
            <Input
              label="Owner Code"
              id="ownerCode"
              name="ownerCode"
              type="text"
              value={formData.ownerCode}
              onChange={handleChange}
              placeholder="Enter owner code"
              error={errors.ownerCode}
            />
          )}

          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            error={errors.confirmPassword}
          />

          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <a href="#" className="text-yellow-600 hover:text-yellow-500 dark:text-yellow-400">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-yellow-600 hover:text-yellow-500 dark:text-yellow-400">
                  Privacy Policy
                </a>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="flex justify-center items-center"
          >
            <UserPlus size={18} className="mr-2" />
            Sign up
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
          <Link
            to="/login"
            className="text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
          >
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
};


export default Signup;