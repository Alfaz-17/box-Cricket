import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { Upload, User, Phone, LogOut } from 'lucide-react'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import AuthContext from '../../context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'

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
    <div className="max-w-2xl mx-auto p-6">
      <Card className="overflow-visible mt-16 border-primary/20">
        <div className="relative">
            {/* Header Background */}
            <div className="h-32 bg-gradient-to-r from-primary to-secondary rounded-t-xl opacity-90" />
            
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
                        className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg cursor-pointer hover:bg-primary/90 transition-colors"
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

        <CardContent className="pt-20 pb-8 px-6 md:px-12">
            <div className="text-center mb-8">
                <h2 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl font-bold text-foreground">
                    {user.name}
                </h2>
                <p className="text-muted-foreground">{user.role || 'Player'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                        <User size={16} className="text-primary" /> Name
                    </Label>
                    <Input
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="flex items-center gap-2">
                        <Phone size={16} className="text-primary" /> Contact Number
                    </Label>
                    <Input
                        id="contactNumber"
                        name="contactNumber"
                        value={form.contactNumber}
                        readOnly
                        className="bg-muted/50 cursor-not-allowed"
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Updating...' : 'Update Profile'}
                </Button>
            </form>

            {message && (
                <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            <div className="mt-8 pt-8 border-t border-primary/10 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Forgot your password?</span>
                    <Link to="/forgot-password" className="text-primary font-bold hover:underline">
                        Reset here
                    </Link>
                </div>

                <Button 
                    variant="destructive" 
                    onClick={handleLogout} 
                    className="w-full md:w-auto min-w-[200px]"
                >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Profile
