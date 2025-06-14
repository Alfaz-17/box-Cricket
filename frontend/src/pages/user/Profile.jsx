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
  <div className="max-w-md mx-auto bg-base-200 rounded-box shadow-xl relative pt-24 px-6 pb-8">
    {/* Profile Image at the top, centered and rounded */}
    <div className="absolute  left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="relative w-32 h-32">
        {form.imagePreview ? (
          <img
            src={form.imagePreview}
            alt=""
            className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"
          />
        ) : (
          <div className="w-32 h-32 rounded-full  flex items-center justify-center text-primary  text-3xl font-bold border-4 border-primary shadow-lg">
            {form.name ? form.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}

        {/* Change button */}
        <label
          htmlFor="profileImgInput"
          className="absolute bottom-0 right-0 bg-primary hover:bg-primary-focus  p-2 rounded-full shadow cursor-pointer transition-all"
          title="Change Profile Picture"
        >
          <Upload size={16} />
          <input
            type="file"
            id="profileImgInput"
            name="profileImg"
            className="sr-only "
            onChange={handleChangeImg}
            accept="image/*"
          />
        </label>
      </div>

      <h2 className="text-xl font-bold mt-3 text-primary text-center">
        {user.name}
      </h2>
    </div>

    {/* Form */}
    <div className="mt-20">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Field */}
        <div className="form-control">
          <label htmlFor="name" className="label">
            <span className="label-text text-primary">Name</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="input input-bordered text-[16px] w-full"
          />
        </div>

        {/* Contact Number Field */}
        <div className="form-control">
          <label htmlFor="contactNumber" className="label">
            <span className="label-text text-primary">Contact Number</span>
          </label>
          <input
            type="text"
            id="contactNumber"
            name="contactNumber"
            value={form.contactNumber}
            // onChange={handleChange}
            className="input input-bordered text-[16px] w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>

    {/* Message */}
    {message && (
      <p className="mt-4 text-center ">
        {message}
      </p>
    )}
  </div>
);

};


export default Profile;
