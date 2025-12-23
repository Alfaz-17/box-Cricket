import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Upload, MapPin, DollarSign, Phone, List, Layers, Image as ImageIcon, Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import api from '../../utils/api'
import MapPicker from '../../components/ui/MapPicker'

const CreateBox = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    hourlyRate: '',
    mobileNumber: '',
    features: '',
    quarters: '',
    image: null,
    images: [],
    imagePreview: null,
    imagesPreview: [],
    latitude: null,
    longitude: null,
    customPricing: [],
    weekendHourlyRate: '',
    weekendCustomPricing: [],
  })
  const [newPricing, setNewPricing] = useState({ duration: '', price: '' })
  const [newWeekendPricing, setNewWeekendPricing] = useState({ duration: '', price: '' })

  const handleChange = e => {
    const { name, value, files } = e.target
    if (name === 'image') {
      const file = files[0]
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }))
    } else if (name === 'images') {
      const filesArray = Array.from(files)
      const previews = filesArray.map(file => URL.createObjectURL(file))

      setFormData(prev => ({
        ...prev,
        images: filesArray,
        imagesPreview: previews,
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      let uploadedImageURL = ''
      if (formData.image) {
        uploadedImageURL = await uploadToCloudinary(formData.image)
      }

      const uploadedImagesURLs = []
      for (const imgFile of formData.images) {
        const imgUrl = await uploadToCloudinary(imgFile)
        uploadedImagesURLs.push(imgUrl)
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        hourlyRate: formData.hourlyRate,
        mobileNumber: formData.mobileNumber,
        features: formData.features,
        numberOfQuarters: Number(formData.quarters),
        image: uploadedImageURL,
        images: uploadedImagesURLs,
        latitude: formData.latitude,
        longitude: formData.longitude,
        customPricing: formData.customPricing,
        weekendHourlyRate: formData.weekendHourlyRate,
        weekendCustomPricing: formData.weekendCustomPricing,
      }

      const response = await api.post('/boxes/create', payload)

      toast.success(response.data.message || 'Box created successfully!')
      navigate('/admin/boxes')
    } catch (err) {
      console.error('Unexpected error:', err)
      toast.error(err.response?.data?.message || 'Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background px-0 md:px-6 py-4 md:py-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="px-4 md:px-0 pb-6 border-b border-primary/10 mb-6">
          <h1 className="text-3xl md:text-4xl text-primary tracking-tight mb-2 font-display">
            Create New Cricket Box
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Fill in the details below to add a new cricket facility to your platform.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 px-4 md:px-0">
          {/* Basic Info Section */}
          <div className="space-y-4 bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary font-outfit">
              <List size={18} /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Box Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Super Strikers Arena"
                  className="bg-muted/30 border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobileNumber"
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    placeholder="e.g. 9876543210"
                    className="pl-9 bg-muted/30 border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
                placeholder="Describe the facility, turf quality, lighting, etc."
                className="bg-muted/30 border-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4 bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary font-outfit">
              <MapPin size={18} /> Location Details
            </h3>
            
            <div className="h-64 w-full rounded-xl overflow-hidden border border-primary/20 relative z-0">
              <MapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) =>
                  setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng,
                  }))
                }
              />
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                 <MapPin size={10} /> Selected Coordinates: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Area / Locality</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Andheri West"
                  className="bg-muted/30 border-primary/20 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 123, Sports Complex, Main Road"
                  className="bg-muted/30 border-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Features Section */}
          <div className="space-y-4 bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary font-outfit">
              <DollarSign size={18} /> Pricing & Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="hourlyRate"
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="pl-9 bg-muted/30 border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weekendHourlyRate">Weekend Hourly Rate (₹) <span className="text-xs text-muted-foreground">(Sat-Sun)</span></Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="weekendHourlyRate"
                    type="number"
                    name="weekendHourlyRate"
                    value={formData.weekendHourlyRate}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-9 bg-muted/30 border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quarters">Number of Quarters</Label>
                <Select 
                  value={formData.quarters} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, quarters: value }))}
                >
                  <SelectTrigger className="bg-muted/30 border-primary/20 focus:ring-primary">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Pricing */}
            <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-primary/10">
              <Label className="text-primary">Custom Pricing (Optional)</Label>
              <div className="flex gap-3 items-end">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="duration" className="text-xs text-muted-foreground">Duration (hrs)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newPricing.duration}
                    onChange={e => setNewPricing({ ...newPricing, duration: e.target.value })}
                    min="1"
                    className="h-9 bg-background"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label htmlFor="price" className="text-xs text-muted-foreground">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newPricing.price}
                    onChange={e => setNewPricing({ ...newPricing, price: e.target.value })}
                    min="1"
                    className="h-9 bg-background"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (newPricing.duration && newPricing.price && !formData.customPricing.find(item => item.duration === Number(newPricing.duration))) {
                      setFormData(prev => ({
                        ...prev,
                        customPricing: [...prev.customPricing, { duration: Number(newPricing.duration), price: Number(newPricing.price) }],
                      }))
                      setNewPricing({ duration: '', price: '' })
                    } else {
                      toast.error('Invalid or duplicate entry')
                    }
                  }}
                  className="h-9"
                >
                  <Plus size={16} /> Add
                </Button>
              </div>

              {formData.customPricing.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.customPricing.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-background border border-primary/20 px-3 py-1 rounded-full text-sm">
                      <span>{item.duration} hrs - ₹{item.price}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, customPricing: prev.customPricing.filter((_, i) => i !== idx) }))}
                        className="text-destructive active:text-destructive/80 md:hover:text-destructive/80"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>


            {/* Custom Weekend Pricing */}
            <div className="space-y-3 p-4 bg-muted/20 rounded-xl border border-primary/10">
              <Label className="text-primary">Weekend Custom Pricing <span className="text-xs text-muted-foreground">(Optional)</span></Label>
              <div className="flex gap-3 items-end">
                <div className="space-y-1 flex-1">
                  <Label htmlFor="weekendDuration" className="text-xs text-muted-foreground">Duration (hrs)</Label>
                  <Input
                    id="weekendDuration"
                    type="number"
                    value={newWeekendPricing.duration}
                    onChange={e => setNewWeekendPricing({ ...newWeekendPricing, duration: e.target.value })}
                    min="1"
                    className="h-9 bg-background"
                  />
                </div>
                <div className="space-y-1 flex-1">
                  <Label htmlFor="weekendPrice" className="text-xs text-muted-foreground">Price (₹)</Label>
                  <Input
                    id="weekendPrice"
                    type="number"
                    value={newWeekendPricing.price}
                    onChange={e => setNewWeekendPricing({ ...newWeekendPricing, price: e.target.value })}
                    min="1"
                    className="h-9 bg-background"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (newWeekendPricing.duration && newWeekendPricing.price && !formData.weekendCustomPricing.find(item => item.duration === Number(newWeekendPricing.duration))) {
                      setFormData(prev => ({
                        ...prev,
                        weekendCustomPricing: [...prev.weekendCustomPricing, { duration: Number(newWeekendPricing.duration), price: Number(newWeekendPricing.price) }],
                      }))
                      setNewWeekendPricing({ duration: '', price: '' })
                    } else {
                      toast.error('Invalid or duplicate entry')
                    }
                  }}
                  className="h-9"
                >
                  <Plus size={16} /> Add
                </Button>
              </div>

              {formData.weekendCustomPricing.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.weekendCustomPricing.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-background border border-primary/20 px-3 py-1 rounded-full text-sm">
                      <span>{item.duration} hrs - ₹{item.price}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, weekendCustomPricing: prev.weekendCustomPricing.filter((_, i) => i !== idx) }))}
                        className="text-destructive active:text-destructive/80 md:hover:text-destructive/80"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (comma separated)</Label>
              <Textarea
                id="features"
                name="features"
                value={formData.features}
                onChange={handleChange}
                rows="2"
                required
                placeholder="e.g. Night lights, Washroom, Synthetic turf, Parking"
                className="bg-muted/30 border-primary/20 focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-4 bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-primary font-outfit">
              <ImageIcon size={18} /> Images
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Main Image</Label>
                <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center active:bg-muted/10 md:hover:bg-muted/10 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} alt="Preview" className="h-32 w-full object-cover rounded-lg" />
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload main image</p>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Images</Label>
                <div className="border-2 border-dashed border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center active:bg-muted/10 md:hover:bg-muted/10 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    name="images"
                    onChange={handleChange}
                    accept="image/*"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-wrap gap-2 justify-center">
                      {formData.imagesPreview.length > 0 ? (
                          formData.imagesPreview.map((preview, index) => (
                              <img key={index} src={preview} alt={`Preview ${index}`} className="h-16 w-16 object-cover rounded-md" />
                          ))
                      ) : (
                          <>
                              <Layers className="h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Click to upload gallery images</p>
                          </>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-primary/10">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/boxes')} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto sm:min-w-[150px]">
              {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Create Box'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBox
