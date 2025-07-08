import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Upload } from "lucide-react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import api from "../../utils/api";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";

const EditBox = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newPricing, setNewPricing] = useState({ duration: "", price: "" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    hourlyRate: "",
    mobileNumber: "",
    facilities: "",
    features: "",
    numberOfQuarters: "",
    image: null,
    images: [],
    imagePreview: null,
    imagesPreview: [],
    existingImages: [],
      customPricing: [], // ← NEW

     // ✅ old uploaded images
  });


  useEffect(() => {
    fetchBoxDetails();
  }, [id]);


  const fetchBoxDetails = async () => {
    try {
      const response = await api.get(`/boxes/public/${id}`);
      console.log(response.data.images)
      setFormData({
        ...response.data,
        facilities: response.data.facilities?.join(", ") || "",
        features: response.data.features?.join(", ") || "",
        numberOfQuarters: response.data.quarters?.length ,
        image: null,
        images: [],
          existingImages: response.data.images || [], // ✅ Store existing URLs

      });
    } catch (error) {
      toast.error("Failed to fetch box details");
      navigate("/admin/boxes");
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else if (name === "images") {
      const filesArray = Array.from(files);
      const previews = filesArray.map((file) => URL.createObjectURL(file));

      setFormData((prev) => ({
        ...prev,
        images: filesArray,
        imagesPreview: previews,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let uploadedImageURL = "";
      if (formData.image) {
        uploadedImageURL = await uploadToCloudinary(formData.image);
      }

     const uploadedImagesURLs = [];
for (const imgFile of formData.images) {
  const imgUrl = await uploadToCloudinary(imgFile);
    uploadedImagesURLs.push(imgUrl);
}
const allImages = [...formData.existingImages, ...uploadedImagesURLs];

      const payload = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        address: formData.address,
        hourlyRate: formData.hourlyRate,
        mobileNumber: formData.mobileNumber,
        features: formData.features,
        numberOfQuarters: Number(formData.numberOfQuarters), // ← ensure it’s a number
        image: uploadedImageURL,
        images: allImages,
          customPricing: formData.customPricing, // ← ADD THIS

      };

      const response = await api.put(`/boxes/update/${id}`, payload);
      toast.success(response.data.message || "Box updated successfully");
      navigate("/admin/boxes");

    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to update box");
      console.error(error);

    } finally {
      setLoading(false);
    }
  };


  //delete existing images
  const removeExistingImage = (indexToRemove) => {
  setFormData((prev) => ({
    ...prev,
    existingImages: prev.existingImages.filter((_, index) => index !== indexToRemove),
  }));
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
          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
          <Input
            label="Mobile Number"
            name="mobileNumber"
            value={formData.mobileNumber}
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

             <div className="mb-4">
            <label className="block text-sm font-medium text-primary  mb-1">
              Description
            </label>
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
  <label className="block text-sm font-medium text-primary mb-2">
    Custom Pricing (Optional)
  </label>
  <div className="flex gap-4 mb-2">
    <Input
      label="Duration (hrs)"
      type="number"
      name="duration"
      value={newPricing.duration}
      onChange={(e) =>
        setNewPricing({ ...newPricing, duration: e.target.value })
      }
      min="1"
      step="1"
    />
    <Input
      label="Price (₹)"
      type="number"
      name="price"
      value={newPricing.price}
      onChange={(e) =>
        setNewPricing({ ...newPricing, price: e.target.value })
      }
      min="1"
    />
    <Button
      type="button"
      onClick={() => {
        if (
          newPricing.duration &&
          newPricing.price &&
          !formData.customPricing.find(
            (item) => item.duration === Number(newPricing.duration)
          )
        ) {
          setFormData((prev) => ({
            ...prev,
            customPricing: [
              ...prev.customPricing,
              {
                duration: Number(newPricing.duration),
                price: Number(newPricing.price),
              },
            ],
          }));
          setNewPricing({ duration: "", price: "" });
        } else {
          toast.error("Invalid or duplicate entry");
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
              setFormData((prev) => ({
                ...prev,
                customPricing: prev.customPricing.filter(
                  (_, i) => i !== idx
                ),
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
            label="Features (comma separated)"
            name="features"
            value={formData.features}
            onChange={handleChange}
          />
   <div className="mb-4">
            <label className="block text-sm font-medium text-primary  mb-1">
              Number of Quarters
            </label>
            <select
              name="quarters"
              value={formData.numberOfQuarters}
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
                   <label className="block text-sm font-medium text-primary  mb-1">
                     Box Image
                   </label>
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
                     {formData.imagesPreview  && (
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
               {formData.existingImages.length > 0 && (
  <div className="mb-6">
    <label className="block text-sm font-medium text-primary mb-2">
      Existing Images
    </label>
    <div className="flex flex-wrap gap-2">
      {formData.existingImages.map((imgUrl, index) => (
        <div key={index} className="relative group">
          <img
            src={imgUrl}
            alt={`Existing ${index}`}
            className="w-20 h-20 object-cover rounded-md"
          />
          <button
            type="button"
            onClick={() => removeExistingImage(index)}
            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 text-xs opacity-50 group-hover:opacity-100 transition"
            title="Remove"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  </div>
)}


          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin/boxes")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Update Box
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditBox;
