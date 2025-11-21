import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { UserPlus } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import api from '../../utils/api'
import BookMyBoxLogo from '../../assets/cri.png'

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    role: 'user',
    ownerCode: '',
    password: '',
    confirmPassword: '',
    otp: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isOtpSending, setIsOtpSending] = useState(false)
  const [isOtpVerified, setIsOtpVerified] = useState(false)

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (value) => {
    setFormData({ ...formData, role: value })
  }

  const sendOtp = async () => {
    if (!formData.contactNumber.trim()) return toast.error('Enter contact number first')
    setIsOtpSending(true)
    try {
      const response = await api.post('/auth/otp', {
        contactNumber: formData.contactNumber,
        action: 'signup',
      })
      toast.success(response.data.message || 'OTP sent successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setIsOtpSending(false)
    }
  }

  const verifyOtp = async () => {
    if (!formData.otp.trim()) return toast.error('Please enter OTP')
    try {
      const response = await api.post('/auth/verify-otp', {
        contactNumber: formData.contactNumber,
        otp: formData.otp,
      })
      toast.success(response.data.message || 'OTP verified successfully')
      setIsOtpVerified(true)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    const { name, password, confirmPassword, otp } = formData

    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required'
    if (!otp.trim()) newErrors.otp = 'OTP is required'
    if (!name) newErrors.name = 'Name is required'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    if (formData.role === 'owner' && !formData.ownerCode.trim())
      newErrors.ownerCode = 'Owner code is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    const payload = {
      name: formData.name,
      password: formData.password,
      role: formData.role,
      contactNumber: formData.contactNumber,
      otp: formData.otp,
      ...(formData.role === 'owner' && { ownerCode: formData.ownerCode }),
    }

    try {
      const response = await api.post('/auth/signup', payload)
      login(response.data.user)
      localStorage.setItem('token', response.data.token)
      toast.success('Account created successfully')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side for desktop branding */}
      <div className="hidden md:flex w-1/2 bg-primary text-primary-foreground items-center justify-center flex-col p-10">
        <img src={BookMyBoxLogo} alt="BookMyBox Logo" className="h-40 w-40 mb-4" />
        <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-5xl font-bold mb-2">
          Book My Box
        </h1>
        <p className="text-lg opacity-80 text-center">
          Book your perfect cricket box — fast, easy, and local.
        </p>
      </div>

      {/* Right side signup form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-20 bg-background">
        <div className="max-w-md w-full mx-auto">
          <h1
            style={{ fontFamily: 'Bebas Neue' }}
            className="text-3xl font-bold mb-2 text-center md:text-left text-foreground"
          >
            Sign Up
          </h1>
          <p className="text-sm text-muted-foreground mb-6 text-center md:text-left">
            Fill up the details below to create an account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Phase 1: OTP Verification */}
            {!isOtpVerified && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="Enter your contact number"
                    className={errors.contactNumber ? "border-destructive" : ""}
                  />
                  {errors.contactNumber && <p className="text-xs text-destructive">{errors.contactNumber}</p>}
                </div>

                <div className="flex space-x-2 mb-3">
                  <Button
                    type="button"
                    onClick={sendOtp}
                    disabled={isOtpSending}
                    variant="secondary"
                    size="sm"
                  >
                    {isOtpSending ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    className={errors.otp ? "border-destructive" : ""}
                  />
                  {errors.otp && <p className="text-xs text-destructive">{errors.otp}</p>}
                </div>

                <Button type="button" onClick={verifyOtp} className="mt-2 w-full">
                  Verify OTP
                </Button>
              </>
            )}

            {/* Phase 2: Account Details */}
            {isOtpVerified && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className={errors.password ? "border-destructive" : ""}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? "border-destructive" : ""}
                  />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === 'owner' && (
                  <div className="space-y-2">
                    <Label htmlFor="ownerCode">Owner Code</Label>
                    <Input
                      id="ownerCode"
                      name="ownerCode"
                      type="password"
                      value={formData.ownerCode}
                      onChange={handleChange}
                      placeholder="Enter owner code"
                      className={errors.ownerCode ? "border-destructive" : ""}
                    />
                    {errors.ownerCode && <p className="text-xs text-destructive">{errors.ownerCode}</p>}
                  </div>
                )}

                <div className="flex items-center space-x-2 mb-6">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">Loading...</span>
                  ) : (
                    <span className="flex items-center">
                      <UserPlus size={18} className="mr-2" />
                      Sign up
                    </span>
                  )}
                </Button>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
