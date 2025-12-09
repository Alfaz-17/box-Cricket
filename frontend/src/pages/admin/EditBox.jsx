import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Upload, MapPin, DollarSign, Phone, List, Layers, Image as ImageIcon, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import api from '../../utils/api'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'

const EditBox = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [newPricing, setNewPricing] = useState({ duration: '', price: '' })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    hourlyRate: '',
    mobileNumber: '',
    facilities: '',
    features: '',
    numberOfQuarters: '',
    image: null,
    images: [],
    imagePreview: null,
    imagesPreview: [],
    existingImages: [],
    customPricing: [],
  })

  useEffect(() => {
    fetchBoxDetails()
  }, [id])

  const fetchBoxDetails = async () => {
    try {
      const response = await api.get(`/boxes/public/${id}`)
      console.log(response.data)
      setFormData({
        ...response.data,
        facilities: response.data.facilities?.join(', ') || '',
        features: response.data.features?.join(', ') || '',
        numberOfQuarters: response.data.quarters?.length,
        image: null,
        images: [],
        imagePreview: null,
        imagesPreview: [],
        existingImages: response.data.images || [],
        customPricing: response.data.customPricing || [],
      })
    } catch (error) {
      toast.error('Failed to fetch box details')
      navigate('/admin/boxes')
      console.log(error)
    }
  }

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
      const allImages = [...formData.existingImages, ...uploadedImagesURLs]

      const payload = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        hourlyRate: formData.hourlyRate,
        mobileNumber: formData.mobileNumber,
        features: formData.features,
        numberOfQuarters: Number(formData.numberOfQuarters),
        image: uploadedImageURL,
        images: allImages,
        customPricing: formData.customPricing,
      }

      const response = await api.put(`/boxes/update/${id}`, payload)
      toast.success(response.data.message || 'Box updated successfully')
      navigate('/admin/boxes')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to update box')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  //delete existing images
  const removeExistingImage = indexToRemove => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, index) => index !== indexToRemove),
    }))
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      {/* Header */}
      <div className="pb-6 border-b border-primary/10 mb-6">
        <h1 style={{ fontFamily: 'Bebas Neue' }} className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-wide mb-2">
          Edit Cricket Box
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Update the details of your cricket facility.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Rest of the form content stays the same, just update the final buttons */}
        {/* Basic Info Section */}
        <div className="space-y-4 bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
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
              className="bg-muted/30 border-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4 bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <MapPin size={18} /> Location Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Area / Locality</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
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
                className="bg-muted/30 border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Features Section */}
        <div className="space-y-4 bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
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
                  className="pl-9 bg-muted/30 border-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfQuarters">Number of Quarters</Label>
              <Select 
                value={formData.numberOfQuarters?.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfQuarters: value }))}
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

          <div className="space-y-2">
            <Label htmlFor="features">Features (comma separated)</Label>
            <Textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows="2"
              required
              className="bg-muted/30 border-primary/20 focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Images Section */}
        <div className="space-y-4 bg-card/30 backdrop-blur-sm rounded-xl p-4 md:p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
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
                    <p className="text-sm text-muted-foreground">Click to replace main image</p>
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
                            <p className="text-sm text-muted-foreground">Click to upload more images</p>
                        </>
                    )}
                </div>
              </div>
            </div>
          </div>

          {formData.existingImages.length > 0 && (
            <div className="space-y-2">
              <Label>Existing Images</Label>
              <div className="flex flex-wrap gap-3">
                {formData.existingImages.map((imgUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imgUrl}
                      alt={`Existing ${index}`}
                      className="w-24 h-24 object-cover rounded-lg border border-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md opacity-0 md:group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-primary/10">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/boxes')} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto sm:min-w-[150px]">
            {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Update Box'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EditBox
