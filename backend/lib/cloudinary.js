// lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv'
import streamifier from 'streamifier';

dotenv.config();
// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const upload_stream_promise = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

cloudinary.uploader.upload_stream_promise = upload_stream_promise;

export default cloudinary;