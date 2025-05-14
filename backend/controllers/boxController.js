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
      features
    } = req.body;

    const owner = req.user._id;

    // Handle files
    const mainImage = req.files?.image?.[0];
    const galleryImages = req.files?.images || [];

    // Upload main image to Cloudinary
    let mainImageUrl = "";
    if (mainImage) {
      const uploadedMain = await cloudinary.uploader.upload(mainImage.path, {
        folder: "cricket-boxes",
      });
      mainImageUrl = uploadedMain.secure_url;
    }

    // Upload gallery images
    let galleryUrls = [];
    if (galleryImages.length > 0) {
      const uploads = await Promise.all(
        galleryImages.map(image =>
          cloudinary.uploader.upload(image.path, {
            folder: "cricket-boxes",
          })
        )
      );
      galleryUrls = uploads.map(upload => upload.secure_url);
    }

    // Create cricket box
    const newBox = await CricketBox.create({
      name,
      location,
      address,
      hourlyRate,
      mobileNumber,
      description,
      image: mainImageUrl,
      images: galleryUrls,
      facilities: facilities ? facilities.split(',').map(f => f.trim()) : [],
      features: features ? features.split(',').map(f => f.trim()) : [],
      owner,
      rating: 0,
      reviewCount: 0,
      reviews: [],
    });

    res.status(201).json({
      success: true,
      message: "Cricket box created successfully",
      box: newBox,
    });
  } catch (err) {
    console.error("Create Box Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error during box creation",
    });
  }
};



export const updateBox = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    const updates = { ...req.body };

    // Handle main image replacement
    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path);
      updates.image = uploaded.secure_url;
    }

    // Handle additional images
    if (req.files?.images) {
      const uploads = await Promise.all(
        req.files.images.map(file => cloudinary.uploader.upload(file.path))
      );
      updates.images = uploads.map(upload => upload.secure_url);
    }

    if (updates.facilities && typeof updates.facilities === "string") {
      updates.facilities = updates.facilities.split(',').map(f => f.trim());
    }

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
  

  