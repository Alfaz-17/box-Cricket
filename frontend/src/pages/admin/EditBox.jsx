import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Upload, MapPin, DollarSign, Phone, List, Layers, Image as ImageIcon, Plus, X, Box as BoxIcon, Info, Navigation, CreditCard, Camera } from 'lucide-react'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Label } from '../../components/ui/Label'
import { Textarea } from '../../components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select'
import api from '../../utils/api'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import MapPicker from '../../components/ui/MapPicker'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'

const EditBox = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [newPricing, setNewPricing] = useState({ duration: '', price: '' })
  const [newWeekendPricing, setNewWeekendPricing] = useState({ duration: '', price: '' })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    hourlyRate: '',
    mobileNumber: '',
    features: '',
    numberOfQuarters: '',
    image: null,
    images: [],
    imagePreview: null,
    imagesPreview: [],
    existingImages: [],
    latitude: null,
    longitude: null,
    customPricing: [],
    weekendHourlyRate: '',
    weekendCustomPricing: [],
  })

  useEffect(() => {
    fetchBoxDetails()
  }, [id])

  const fetchBoxDetails = async () => {
    try {
      const response = await api.get(`/boxes/public/${id}`)
      setFormData({
        ...response.data,
        features: response.data.features?.join(', ') || response.data.features || '',
        numberOfQuarters: response.data.quarters?.length || response.data.numberOfQuarters || '',
        image: null,
        images: [],
        imagePreview: null,
        imagesPreview: [],
        existingImages: response.data.images || [],
        customPricing: response.data.customPricing || [],
        weekendHourlyRate: response.data.weekendHourlyRate || '',
        weekendCustomPricing: response.data.weekendCustomPricing || [],
        latitude: response.data.latitude || null,
        longitude: response.data.longitude || null,
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
        image: uploadedImageURL || undefined,
        images: allImages,
        latitude: formData.latitude,
        longitude: formData.longitude,
        customPricing: formData.customPricing,
        weekendHourlyRate: formData.weekendHourlyRate,
        weekendCustomPricing: formData.weekendCustomPricing,
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

  const removeExistingImage = indexToRemove => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, index) => index !== indexToRemove),
    }))
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-border pb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <BoxIcon className="text-primary w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Update <span className="text-primary">Box</span> Details
              </h1>
            </div>
            <p className="text-muted-foreground text-sm font-medium">Modify existing facility parameters and network configuration</p>
          </div>
          <Button variant="ghost" onClick={() => navigate('/admin/boxes')} className="text-xs font-bold uppercase tracking-wider h-11 border border-border">
            Discard
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Identity Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-primary rounded-full"></div>
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Facility Identity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-6 rounded-lg shadow-sm">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Official Name</Label>
                <div className="relative">
                  <BoxIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Cricket Box 1"
                    className="pl-10 h-11 border-border bg-muted/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Support Contact</Label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    placeholder="+91 00000 00000"
                    className="pl-10 h-11 border-border bg-muted/20"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Operational Brief</Label>
                <div className="relative">
                  <Info size={14} className="absolute left-3 top-3 text-muted-foreground z-10" />
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    required
                    placeholder="Provide a detailed description of the facility specs, turf type, and amenities..."
                    className="pl-10 h-32 border-border bg-muted/20 resize-none pt-2.5"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-primary rounded-full"></div>
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Geographic footprint</h2>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-lg shadow-sm space-y-6">
              <div className="h-80 w-full rounded-lg overflow-hidden border border-border relative group shadow-inner">
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
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md border border-border flex items-center gap-2 shadow-lg">
                    <Navigation size={12} className="text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Update Hub Position</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Area / Locality</Label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="District or Sector Name"
                    className="h-11 border-border bg-muted/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Physical Address</Label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="Full street address and landmark"
                    className="h-11 border-border bg-muted/20"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Configuration Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-primary rounded-full"></div>
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pricing & Capacity</h2>
            </div>
            
            <div className="bg-card border border-border p-6 rounded-lg shadow-sm space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Base Hourly Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary z-10">₹</span>
                    <Input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      required
                      placeholder="0.00"
                      className="pl-8 h-11 border-border bg-muted/20 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Weekend Premium</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary z-10">₹</span>
                    <Input
                      type="number"
                      name="weekendHourlyRate"
                      value={formData.weekendHourlyRate}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="pl-8 h-11 border-border bg-muted/20 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Sub-unit Count</Label>
                  <Select 
                    value={formData.numberOfQuarters?.toString()} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfQuarters: value }))}
                  >
                    <SelectTrigger className="h-11 border-border bg-muted/20 font-bold">
                      <SelectValue placeholder="Units" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} Unit{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Pricing Buckets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4 p-5 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-primary" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Base Duration Rules</h4>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Hours"
                      value={newPricing.duration}
                      onChange={e => setNewPricing({ ...newPricing, duration: e.target.value })}
                      className="h-10 text-xs bg-background"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={newPricing.price}
                      onChange={e => setNewPricing({ ...newPricing, price: e.target.value })}
                      className="h-10 text-xs bg-background"
                    />
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
                        }
                      }}
                      className="h-10 px-4"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.customPricing.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded-md text-[10px] font-bold">
                        <span>{item.duration}H @ ₹{item.price}</span>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, customPricing: prev.customPricing.filter((_, i) => i !== idx) }))} className="text-destructive">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 p-5 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={14} className="text-primary" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Weekend Duration Rules</h4>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Hours"
                      value={newWeekendPricing.duration}
                      onChange={e => setNewWeekendPricing({ ...newWeekendPricing, duration: e.target.value })}
                      className="h-10 text-xs bg-background"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={newWeekendPricing.price}
                      onChange={e => setNewWeekendPricing({ ...newWeekendPricing, price: e.target.value })}
                      className="h-10 text-xs bg-background"
                    />
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
                        }
                      }}
                      className="h-10 px-4"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.weekendCustomPricing.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded-md text-[10px] font-bold">
                        <span>W-END {item.duration}H @ ₹{item.price}</span>
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, weekendCustomPricing: prev.weekendCustomPricing.filter((_, i) => i !== idx) }))} className="text-destructive">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Specialized Features</Label>
                <div className="relative">
                  <List size={14} className="absolute left-3 top-3 text-muted-foreground z-10" />
                  <Textarea
                    name="features"
                    value={formData.features}
                    onChange={handleChange}
                    rows="2"
                    required
                    placeholder="LED Pannel, Synthetic Turf, Mobile View, Night Access..."
                    className="pl-10 h-24 border-border bg-muted/20 resize-none pt-2.5"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Visual Media Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-primary rounded-full"></div>
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Visual Infrastructure</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Master Asset (Replacement)</Label>
                <div className="relative h-64 border-2 border-dashed border-border rounded-lg bg-muted/10 flex flex-col items-center justify-center overflow-hidden hover:bg-muted/20 transition-all group group cursor-pointer">
                  <input type="file" name="image" onChange={handleChange} accept="image/*" className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Camera size={24} />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Swap master capture</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Augment Gallery</Label>
                <div className="relative h-64 border-2 border-dashed border-border rounded-lg bg-muted/10 flex flex-col items-center justify-center overflow-hidden hover:bg-muted/20 transition-all group group cursor-pointer">
                  <input type="file" name="images" onChange={handleChange} accept="image/*" multiple className="absolute inset-0 opacity-0 z-20 cursor-pointer" />
                  {formData.imagesPreview.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 p-4 w-full h-full overflow-y-auto">
                      {formData.imagesPreview.map((preview, index) => (
                        <img key={index} src={preview} alt="Gallery Preview" className="w-full aspect-square object-cover rounded shadow-sm" />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Layers size={24} />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Add new captures</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Existing Gallery Management */}
              {formData.existingImages.length > 0 && (
                <div className="space-y-4 md:col-span-2 mt-4">
                   <div className="flex items-center gap-3 mb-4">
                    <div className="h-4 w-1 bg-primary rounded-full"></div>
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Inventory Gallery</h3>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                    {formData.existingImages.map((imgUrl, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border shadow-sm">
                        <img
                          src={imgUrl}
                          alt={`Existing ${index}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="bg-destructive text-white rounded-full p-2 hover:scale-110 transition-transform shadow-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        {/* Mobile remove button */}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="md:hidden absolute top-1 right-1 bg-destructive/80 text-white rounded-full p-1 z-20"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/boxes')}
              className="h-12 px-8 font-bold uppercase tracking-widest text-xs border-border"
            >
              Revert State
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-12 font-bold uppercase tracking-widest text-xs min-w-[200px]"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Committing Changes...</span>
                </div>
              ) : (
                'Commit Updates'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBox
