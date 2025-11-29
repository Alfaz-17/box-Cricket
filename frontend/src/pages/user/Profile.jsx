import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { Upload, User, Phone, LogOut, Mail } from 'lucide-react'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import AuthContext from '../../context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

const Profile = () => {
  const [user, setUser] = useState()
  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    profileImg: '',
    imagePreview: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.post('/auth/me')
      setUser(response.data.user)

      setForm({
        name: response.data.user.name || '',
        contactNumber: response.data.user.contactNumber || '',
        profileImg: response.data.user.profileImg || '',
        imagePreview: response.data.user.profileImg || '',
      })
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const handleLogout = () => {
    const confirmLogout = confirm('You want to log out?')
    if (!confirmLogout) return

    logout()
    navigate('/')
  }

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      let uploadedImageURL = ''
      if (form.profileImg && typeof form.profileImg !== 'string') {
        uploadedImageURL = await uploadToCloudinary(form.profileImg)
      }
      const payload = {
        name: form.name,
        contactNumber: form.contactNumber,
        profileImg: uploadedImageURL || form.profileImg,
      }
      const response = await api.put('/auth/update-profile', payload)
      setUser(response.data.user)
      setMessage('Profile updated successfully!')
    } catch (error) {
      setMessage('Failed to update profile.')
      console.error(error)
    }
    setLoading(false)
  }

  const handleChangeImg = e => {
    const { files } = e.target
    if (files && files[0]) {
        const file = files[0]
        setForm(prev => ({
          ...prev,
          profileImg: file,
          imagePreview: URL.createObjectURL(file),
        }))
    }
  }

  if (!user)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
          My Profile
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card/30 backdrop-blur-sm rounded-xl overflow-hidden">
        {/* Header Background with Profile Image */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-primary to-secondary opacity-90" />
          
          {/* Profile Image */}
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-card shadow-xl overflow-hidden bg-card">
                {form.imagePreview ? (
                  <img
                    src={form.imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-primary text-4xl font-bold">
                    {form.name ? form.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              
              <label
                htmlFor="profileImgInput"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg cursor-pointer active:bg-primary/90 md:hover:bg-primary/90 transition-colors"
              >
                <Upload size={16} />
                <input
                  type="file"
                  id="profileImgInput"
                  name="profileImg"
                  className="hidden"
                  onChange={handleChangeImg}
                  accept="image/*"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 pb-8 px-4 md:px-8 space-y-6">
          {/* User Info */}
          <div className="text-center mb-8">
            <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl font-bold text-foreground">
              {user.name}
            </h2>
            <p className="text-muted-foreground flex items-center justify-center gap-2 mt-1">
              <span>👤</span>
              <span>{user.role || 'Player'}</span>
            </p>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm md:text-base">
                <span>👤</span> Name
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="bg-muted/30 border-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber" className="flex items-center gap-2 text-sm md:text-base">
                <span>📱</span> Contact Number
              </Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={form.contactNumber}
                readOnly
                className="bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Contact number cannot be changed</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium max-w-md mx-auto ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 pt-8 border-t border-primary/10 space-y-4 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Forgot your password?</span>
              <Link to="/forgot-password" className="text-primary font-bold active:underline md:hover:underline">
                Reset here
              </Link>
            </div>

            <Button 
              variant="destructive" 
              onClick={handleLogout} 
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
