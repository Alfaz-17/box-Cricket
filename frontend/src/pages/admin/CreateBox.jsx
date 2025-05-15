import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const CreateBox = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address:'',
    hourlyRate: '',
    features: '',
    mobileNumber: '',
    image: '', // Main image in Base64
    images: [], // Optional additional images in Base64
    imagePreview: null, // Preview for the main image
    imagesPreview: [] // Previews for additional images
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result, // Store Base64 string
          imagePreview: URL.createObjectURL(file) // Preview URL
        }));
      };
      reader.readAsDataURL(file);
    } else if (name === 'images') {
      const filesArray = Array.from(files);
      const previews = filesArray.map(file => URL.createObjectURL(file)); // Generate previews for each image

      const readers = filesArray.map((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result] // Store Base64 strings for multiple images
          }));
        };
        reader.readAsDataURL(file);
      });
      
      setFormData(prev => ({
        ...prev,
        imagesPreview: previews
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const payload = {
      name: formData.name,
      description: formData.description,
      location: formData.location,
      address:formData.address,
      hourlyRate: formData.hourlyRate,
      mobileNumber: formData.mobileNumber,
      features: formData.features,
      image: formData.image,        // Base64 main image
      images: formData.images       // Array of Base64 additional images
    };

    const response = await fetch("http://localhost:5001/api/boxes/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Upload Error:", data);
      toast.error(data?.message || "Something went wrong");
      return;
    }

    toast.success("Box created successfully!");
    navigate("/admin/boxes");

  } catch (err) {
    console.error("Unexpected error:", err);
    toast.error("Unexpected error occurred");
  } finally {
    setLoading(false);
  }
};


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
            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-yellow-300 dark:border-gray-600 rounded-md"
              required
            />
          </div>

          <Input
            label="Location"
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
            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Features (comma-separated)
            </label>
            <textarea
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-yellow-300 dark:border-gray-600 rounded-md"
              placeholder="e.g., Night lights, Washroom, Synthetic turf"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Box Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
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
                  <img src={formData.imagePreview} alt="Preview" className="mt-2 w-32 h-32 object-cover rounded-md" />
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Additional Images (optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
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
                      <img key={index} src={preview} alt={`Preview ${index}`} className="w-16 h-16 object-cover rounded-md mr-2" />
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/boxes')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={loading}
            >
              Create Box
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateBox;
