import React, { useState, useContext } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { LogIn } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import api from '../../utils/api'
import BookMyBoxLogo from '../../assets/cri.png'

const Login = () => {
  const [contactNumber, setContactNumber] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  const validateForm = () => {
    const newErrors = {}
    if (!contactNumber) newErrors.contactNumber = 'Contact number is required'
    else if (contactNumber.length !== 10)
      newErrors.contactNumber = 'Contact number must be 10 digits'

    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', { contactNumber, password })
      localStorage.setItem('token', response.data.token)
      login(response.data.user)
      toast.success('Login successful')
      navigate(from)
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side for desktop branding */}
      <div className="hidden md:flex w-1/2 bg-primary text-white items-center justify-center flex-col p-10">
        <img src={BookMyBoxLogo} alt="BookMyBox Logo" className="h-40 w-40 mb-4" />
        <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-5xl font-bold mb-2">
          Book My Box
        </h1>
        <p className="text-lg opacity-80 text-center">
          Book your perfect cricket box — fast, easy, and local.
        </p>
      </div>

      {/* Right side login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-20">
        <div className="max-w-md w-full mx-auto">
          <h1
            style={{ fontFamily: 'Bebas Neue' }}
            className="text-3xl font-bold mb-2 text-center md:text-left"
          >
            Login
          </h1>
          <p className="text-sm text-gray-600 mb-6 text-center md:text-left">
            Fill up the details below to login to your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Contact Number"
              id="contactNumber"
              type="tel"
              value={contactNumber}
              onChange={e => setContactNumber(e.target.value)}
              placeholder="Enter your contact number"
              error={errors.contactNumber}
            />

            <Input
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              error={errors.password}
            />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-primary border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm">
                  Remember me
                </label>
              </div>

              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              className="flex justify-center items-center"
            >
              <LogIn size={18} className="mr-2" />
              Log in
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
