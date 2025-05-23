import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Upload } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../utils/api'
const EditBox = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    hourlyRate: '',
    image: null
  });

  useEffect(() => {
    fetchBoxDetails();
  }, [id]);

const fetchBoxDetails = async () => {
  try {
    const response = await api.get(`/public/boxes/${id}`);
    setFormData(response.data);
  } catch (error) {
    toast.error('Failed to fetch box details');
    navigate('/admin/boxes');
  }
};

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    });

    const response = await api.put(`/boxes/update/${id}`, formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success(response.data.message || 'Box updated successfully');
    navigate('/admin/boxes');
  } catch (error) {
    toast.error(error.response?.data?.message || error.message || 'Failed to update box');
    console.error(error);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Edit Cricket Box">
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              Box Image
            </label>
            {formData.imageUrl && (
              <div className="mb-2">
                <img
                  src={formData.imageUrl}
                  alt="Current box image"
                  className="h-32 w-auto object-cover rounded-md"
                />
              </div>
            )}
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500">
                    <span>Upload a new image</span>
                    <input
                      type="file"
                      name="image"
                      className="sr-only"
                      onChange={handleChange}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 10MB
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
              Update Box
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditBox;