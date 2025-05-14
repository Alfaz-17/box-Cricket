
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
    hourlyRate: '',
    features: '',
    mobileNumber: '',
    image: null, // Main image is required
    images: [] // Optional additional images
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else if (name === 'images') {
      setFormData(prev => ({ ...prev, images: files }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("hourlyRate", formData.hourlyRate);
    formDataToSend.append("mobileNumber", formData.mobileNumber);
    formDataToSend.append("features", formData.features);
    formDataToSend.append("facilities", formData.facilities);

    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    for (let i = 0; i < formData.images.length; i++) {
      formDataToSend.append("images", formData.images[i]);
    }

    const response = await fetch("http://localhost:5001/api/boxes/create", {
      method: "POST",
      credentials: "include",
      body: formDataToSend,
    });


    const data = await response.json(); // Use json() here

    if (!response.ok) {
      console.error("Upload Error:", data);  // Log error from backend
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
                {formData.image && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Selected: {formData.image.name}
                  </p>
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
                {formData.images.length > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {formData.images.length} images selected
                  </p>
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