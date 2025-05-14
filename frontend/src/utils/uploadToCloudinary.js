// utils/uploadToCloudinary.js
import axios from "axios";

export const uploadToCloudinary = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset","my_box"); // Replace this

  const response = await axios.post("https://api.cloudinary.com/v1_1/cloud/image/upload", data);
  return response.data.secure_url;
};
