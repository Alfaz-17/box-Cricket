import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import api from '../../utils/api'


const ForgotPassword = () => {
  const [step, setStep] = useState(1)
  const [contactNumber, setContactNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const navigate = useNavigate()

  const validateContact = () => {
    if (!contactNumber) {
      toast.error('Contact number is required')
      return false
    } else if (contactNumber.length !== 10) {
      toast.error('Must be 10 digits')
      return false
    }
    return true
  }

  const handleSendOtp = async () => {
    if (!validateContact()) return
    try {
      await api.post('/auth/otp', { contactNumber, action: 'forgot-password' })
      toast.success('OTP sent to your number')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Enter OTP')
    try {
      await api.post('/auth/verify-otp', { contactNumber, otp })
      toast.success('OTP verified')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    }
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6)
      return toast.error('Password must be at least 6 characters')

    try {
      await api.post('/auth/forgot-password', {
        contactNumber,
        otp,
        newPas: newPassword,
      })
      toast.success('Password reset successfully')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side for desktop branding */}
      <div className="hidden md:flex w-1/2 bg-primary text-white items-center justify-center flex-col p-10">
        <img src="/src/assets/logo-icon.svg" alt="BookMyBox Logo" className="h-40 w-40 mb-4" />
        <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-5xl font-bold mb-2">
          Book My Box
        </h1>
        <p className="text-lg opacity-80 text-center">
          Book your perfect cricket box — fast, easy, and local.
        </p>
      </div>

      {/* Right side form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-20">
        <div className="max-w-md w-full mx-auto">
          <h1
            style={{ fontFamily: 'Bebas Neue' }}
            className="text-3xl font-bold mb-2 text-center md:text-left"
          >
            Forgot Password
          </h1>
          <p className="text-sm text-gray-600 mb-6 text-center md:text-left">
            Reset your password in 3 simple steps.
          </p>

          {step === 1 && (
            <>
              <Input
                label="Contact Number"
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                placeholder="Enter your registered number"
              />
              <Button variant="primary" fullWidth onClick={handleSendOtp}>
                Send OTP
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <Input
                label="OTP"
                id="otp"
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
              <Button variant="primary" fullWidth onClick={handleVerifyOtp}>
                Verify OTP
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <Input
                label="New Password"
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <Button variant="primary" fullWidth onClick={handleResetPassword}>
                Reset Password
              </Button>
            </>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Remember your password? </span>
            <Link to="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
