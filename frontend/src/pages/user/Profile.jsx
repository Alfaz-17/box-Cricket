import React, { useState, useEffect } from 'react';
import api from '../../utils/api'; // your axios config instance
import { Upload } from 'lucide-react';
import {uploadToCloudinary} from '../../utils/uploadToCloudinary'
const Profile = () => {
  const [user, setUser] = useState();
  const [form, setForm] = useState({
    name: '',
    contactNumber: '',
    profileImg: '',
    imagePreview:"", 
   });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.post('/auth/me');
        setUser(response.data.user);

        setForm({
          name: response.data.user.name || '',
          contactNumber: response.data.user.contactNumber || '',
          profileImg: response.data.user.profileImg || '',
          imagePreview: response.data.user.profileImg || '', 
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Update profile submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
         let uploadedImageURL = '';
              if (form.profileImg) {
                uploadedImageURL = await uploadToCloudinary(form.profileImg);
              }
              const payload = {
                name: form.name,
                contactNumber: form.contactNumber,
                profileImg: uploadedImageURL || form.profileImg,
              }
      const response = await api.put('/auth/update-profile', payload);
      setUser(response.data.user);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile.');
      console.error(error);
    }
    setLoading(false);
  };
 const handleChangeImg = (e) => {
    const { name, value, files } = e.target;

    (name === 'profileImg') 
      const file = files[0];
      setForm(prev => ({
        ...prev,
        profileImg: file,
        imagePreview: URL.createObjectURL(file),
      }));
 
  };
  if (!user) return <div>Loading profile...</div>;

  return (
<div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded shadow relative pt-20 px-6 pb-6">
  {/* Profile Image at the top, centered and rounded */}
  <div className="absolute my-25 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    {form.imagePreview ? (
      <img
        src={form.imagePreview}
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover border-4 border-yellow-500 dark:border-yellow-300 shadow-lg"
      />
    ) : (
      <div className="w-32 h-32 rounded-full bg-yellow-200 dark:bg-yellow-700 flex items-center justify-center text-yellow-600 dark:text-yellow-300 text-3xl font-bold border-4 border-yellow-500 dark:border-yellow-300 shadow-lg">
        {/* Placeholder Initial or Icon */}
        {form.name ? form.name.charAt(0).toUpperCase() : "U"}
      </div>
    )}
     <h2 className="text-xl font-bold mb-4 text-yellow-800 dark:text-yellow-300 text-center">
    {user.name}
  </h2>
  </div>

 
<div className="mt-20">
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <label
        htmlFor="name"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Name
      </label>
      <input
        type="text"
        name="name"
        id="name"
        value={form.name}
        onChange={handleChange}
        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        required
      />
    </div>

    <div>
      <label
        htmlFor="contactNumber"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Contact Number
      </label>
      <input
        type="text"
        name="contactNumber"
        id="contactNumber"
        value={form.contactNumber}
        onChange={handleChange}
        className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
    </div>

    {/* Image upload field */}
    <div>
      <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
        Update your Image
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-yellow-500 dark:hover:border-yellow-300 transition-colors">
        <div className="space-y-1 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
            <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-yellow-600 hover:text-yellow-500 dark:text-yellow-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500 px-3 py-1">
              <span>Choose a file</span>
              <input
                type="file"
                name="profileImg"
                className="sr-only"
                onChange={handleChangeImg}
                accept="image/*"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      </div>
    </div>

    <button
      type="submit"
      disabled={loading}
      className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded transition-colors"
    >
      {loading ? "Updating..." : "Update Profile"}
    </button>
  </form>
  </div>

  {message && (
    <p className="mt-4 text-center text-sm text-yellow-700 dark:text-yellow-300">
      {message}
    </p>
  )}
</div>

  );
};

export default Profile;
