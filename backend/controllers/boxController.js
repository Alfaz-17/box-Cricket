import cloudinary from "../lib/cloudinary.js";
import CricketBox from "../models/CricketBox.js";
import User from "../models/User.js";


export const createBox = async (req, res) => {
  try {
    const {
      name,
      location,
      address,
      hourlyRate,
      mobileNumber,
      description,
      facilities,
      features,
      image,
      images
    } = req.body;

    const owner = req.user._id;
  
const owenrHaveBox=await CricketBox.find({owner});

if(owenrHaveBox){
  return res.status(400).json({message:"you already created box"})
}

    const newBox = await CricketBox.create({
      name,
      location,
      address,
      hourlyRate,
      mobileNumber,
      description,
      image,
      images,
      facilities: facilities ? facilities.split(',').map(f => f.trim()) : [],
      features: features ? features.split(',').map(f => f.trim()) : [],
      owner,
      rating: 0,
      reviewCount: 0,
      reviews: [],
    });

    res.status(201).json({
      success: true,
      message: 'Cricket box created successfully',
      box: newBox,
    });
  } catch (err) {
    console.error('Create Box Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during box creation',
    });
  }
};
export const updateBox = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    // Destructure the request body
    const {
      name,
      location,
      address,
      hourlyRate,
      mobileNumber,
      description,
      facilities,
      features,
      image,  // Main image URL sent from frontend
      images,  // Gallery image URLs sent from frontend
    } = req.body;

    const updates = { ...req.body }; // Spread the updates

    // Handle main image (if provided) and update the URL
    if (image) {
      const uploadedMain = await cloudinary.uploader.upload(image, {
        folder: "cricket-boxes",
      });
      updates.image = uploadedMain.secure_url; // Use the uploaded image URL
    }

    // Handle gallery images (if provided) and update the URLs
    if (images && images.length > 0) {
      const uploads = await Promise.all(
        images.map(image =>
          cloudinary.uploader.upload(image, {
            folder: "cricket-boxes",
          })
        )
      );
      updates.images = uploads.map(upload => upload.secure_url); // Save the gallery image URLs
    }

    // Split facilities and features if they are provided as a string
    if (facilities && typeof facilities === "string") {
      updates.facilities = facilities.split(',').map(f => f.trim());
    }
    if (features && typeof features === "string") {
      updates.features = features.split(',').map(f => f.trim());
    }

    // Update the box in the database
    const updated = await CricketBox.findOneAndUpdate(
      { _id: id, owner: ownerId },
      updates,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Box not found" });
    res.json({ message: "Box updated", box: updated });
  } catch (err) {
    console.error("Error in updateBox:", err);
    res.status(500).json({ message: "Update failed" });
  }
};


export const deleteBox = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    const deleted = await CricketBox.findOneAndDelete({ _id: id, owner: ownerId });
    if (!deleted) return res.status(404).json({ message: "Box not found" });

    res.json({ message: "Box deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getOwnerBoxes = async (req, res) => {
    try {
      const boxes = await CricketBox.find({ owner: req.user._id });
      res.json({ boxes });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch boxes" });
    }
  };

  export const addReview = async (req, res) => {
    try {
      const { id } = req.params; // box ID
      const { rating, comment } = req.body;
      const userId = req.user._id;
  
      const box = await CricketBox.findById(id);
      if (!box) return res.status(404).json({ message: "Box not found" });
  const user=await User.findById(userId);

      box.reviews.push({ user: userId, rating, comment,name:user.name });
      await box.save();
  
      res.json({ message: "Review added", box });
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: "Failed to add review" });
    }
  };
  

  