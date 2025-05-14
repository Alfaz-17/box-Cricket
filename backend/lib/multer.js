// lib/multer.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js'; // Import Cloudinary instance

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cricket-boxes', // Folder in Cloudinary where images will be uploaded
    allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed image formats
  },
});

// Multer upload instance for Cloudinary storage
const upload = multer({ storage });

export default upload;
