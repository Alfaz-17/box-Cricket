// src/utils/cloudinaryUpload.js

export const uploadToCloudinary = async (file, folder = 'cricket-boxes') => {
  try {
    const imageData = new FormData();
    imageData.append('file', file);
    imageData.append('upload_preset', 'my_box'); // your actual preset
    imageData.append('folder', folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/dsl4zwgos/image/upload`, {
      method: 'POST',
      body: imageData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data.secure_url;
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    throw err;
  }
};
