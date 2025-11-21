import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
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
    quarters: '', // ← ADD THIS
    image: null,
    images: [],
    imagePreview: null,
    imagesPreview: [],
    latitude: null,
    longitude: null,
    customPricing: [], // ← NEW
  })
  const [newPricing, setNewPricing] = useState({ duration: '', price: '' })

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
        numberOfQuarters: Number(formData.quarters), // ← ensure it’s a number
        image: uploadedImageURL,
        images: uploadedImagesURLs,
        latitude: formData.latitude,
        longitude: formData.longitude,
        customPricing: formData.customPricing, // ← ADD THIS
      }

      console.log(payload)
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
    <div className="max-w-2xl mx-auto">
      <Card title="Create New Cricket Box">
        <form onSubmit={handleSubmit}>
          <Input
            label="Box Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary  mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="textarea textarea-bordered w-full px-3 py-2 bg- dark:bg-gray-700 border text-[16px]  rounded-2xl"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-1">
              Pick Location on Map
            </label>
            <div className="h-64 w-full rounded-lg overflow-hidden mb-3 relative z-10">
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
              <p className="mt-2 text-sm text-primary">
                Selected Coordinates: {formData.latitude.toFixed(5)},{' '}
                {formData.longitude.toFixed(5)}
              </p>
            )}
          </div>
          <Input
            label="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <Input
            label="Hourly Rate ($)"
            type="number"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-2">
              Custom Pricing (Optional)
            </label>
            <div className="flex gap-4 mb-2">
              <Input
                label="Duration (hrs)"
                type="number"
                name="duration"
                value={newPricing.duration}
                onChange={e => setNewPricing({ ...newPricing, duration: e.target.value })}
                min="1"
                step="1"
              />
              <Input
                label="Price (₹)"
                type="number"
                name="price"
                value={newPricing.price}
                onChange={e => setNewPricing({ ...newPricing, price: e.target.value })}
                min="1"
              />
              <Button
                type="button"
                onClick={() => {
                  if (
                    newPricing.duration &&
                    newPricing.price &&
                    !formData.customPricing.find(
                      item => item.duration === Number(newPricing.duration)
                    )
                  ) {
                    setFormData(prev => ({
                      ...prev,
                      customPricing: [
                        ...prev.customPricing,
                        {
                          duration: Number(newPricing.duration),
                          price: Number(newPricing.price),
                        },
                      ],
                    }))
                    setNewPricing({ duration: '', price: '' })
                  } else {
                    toast.error('Invalid or duplicate entry')
                  }
                }}
              >
                Add
              </Button>
            </div>

            {formData.customPricing.length > 0 && (
              <div className="space-y-2">
                {formData.customPricing.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                  >
                    <span>
                      {item.duration} hrs - ₹{item.price}
                    </span>
                    <button
                      type="button"
                      className="text-red-500 text-sm"
                      onClick={() =>
                        setFormData(prev => ({
                          ...prev,
                          customPricing: prev.customPricing.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Input
            label="Mobile Number"
            type="tel"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            placeholder="e.g., 9876543210"
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary  mb-1">
              Features (comma-separated)
            </label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows="3"
              className="textarea textarea-bordered w-full px-3 py-2  dark:bg-gray-700  rounded-2xl text-[16px]"
              placeholder="e.g., Night lights, Washroom, Synthetic turf"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-primary  mb-1">
              Number of Quarters
            </label>
            <select
              name="quarters"
              value={formData.quarters}
              onChange={handleChange}
              className="input input-bordered w-full px-3 py-2  rounded-2xl"
              required
            >
              <option value=""> Boxes</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          {/* Image upload fields (same as before) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-primary  mb-1">Box Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-primary" />
                <div className="flex text-sm ">
                  <label className="relative text-[16px] cursor-pointer  rounded-md font-medium  hover:text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                    <span>Upload Main Image</span>
                    <input
                      type="file"
                      name="image"
                      className="sr-only"
                      onChange={handleChange}
                      accept="image/*"
                    />
                  </label>
                </div>
                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="mt-2 w-32 h-32 object-cover rounded-md"
                  />
                )}
                <p className="text-xs  ">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-primary mb-1">
              Additional Images (optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2   border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-primary" />
                <div className="flex text-sm  ">
                  <label className="relative cursor-pointer rounded-md font-medium  hover:text-primary  focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                    <span>Upload Additional Images</span>
                    <input
                      type="file"
                      name="images"
                      className="sr-only"
                      onChange={handleChange}
                      accept="image/*"
                      multiple
                    />
                  </label>
                </div>
                {formData.imagesPreview.length > 0 && (
                  <div className="flex mt-2">
                    {formData.imagesPreview.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-16 h-16 object-cover rounded-md mr-2"
                      />
                    ))}
                  </div>
                )}
                <p className="text-xs  ">PNG, JPG, GIF up to 10MB each</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/boxes')}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Create Box
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateBox
