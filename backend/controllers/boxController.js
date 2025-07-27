import CricketBox from "../models/CricketBox.js";
import { HelpAndSupport } from "../models/Review.js";

import dotenv from "dotenv";
dotenv.config();

export const createBox = async (req, res) => {
  try {
    const {
      name,
      location,
      address,
      latitude, // NEW
      longitude, // NEW
      hourlyRate,
      mobileNumber,
      description,
      facilities,
      features,
      customPricing,
      image,
      images,
      numberOfQuarters,
    } = req.body;

    const owner = req.user._id;

    const ownerHaveBox = await CricketBox.find({ owner });
    //temporarily commented out the owner box check
    // if (ownerHaveBox.length > 0) {
    //   return res.status(400).json({ message: "You already created a box" });
    // }

    const quartersArray = [];
    for (let i = 1; i <= numberOfQuarters; i++) {
      quartersArray.push({
        name: `Box - ${i}`,
      });
    }

    const newBox = await CricketBox.create({
      name,
      location,
      address,
      coordinates: {
        lat: latitude,
        lng: longitude,
      },
      hourlyRate,
      mobileNumber,
      description,
      image,
      images,
      facilities: facilities ? facilities.split(",").map((f) => f.trim()) : [],
      features: features ? features.split(",").map((f) => f.trim()) : [],
        customPricing: Array.isArray(customPricing) ? customPricing : [], // ✅ ADD THIS

      owner,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      quarters: quartersArray,
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
    const boxId = req.params.id;
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
      images,
      customPricing,
      numberOfQuarters, // NEW
    } = req.body;

    const box = await CricketBox.findById(boxId);

    if (!box) {
      return res.status(404).json({ message: "Box not found" });
    }
    
if (customPricing) {
  box.customPricing = customPricing;
}

    // Update basic fields
    box.name = name || box.name;
    box.location = location || box.location;
    box.address = address || box.address;
    box.hourlyRate =
      hourlyRate !== undefined ? Number(hourlyRate) : box.hourlyRate;
    box.mobileNumber = mobileNumber || box.mobileNumber;
    box.description = description || box.description;
    box.image = image || box.image;
    box.images = images || box.images;

    if (facilities) {
      box.facilities = facilities.split(",").map((f) => f.trim());
    }

    if (features) {
      box.features = features.split(",").map((f) => f.trim());
    }

    // Handle quarters safely
    if (numberOfQuarters !== undefined) {
      const newCount = Number(numberOfQuarters);
      const currentCount = box.quarters.length;

      if (newCount > currentCount) {
        // Add new quarters
        for (let i = currentCount + 1; i <= newCount; i++) {
          box.quarters.push({
            name: `Box - ${i}`,
          });
        }
      } else if (newCount < currentCount) {
        // Check if extra quarters are all free
        const extraQuarters = box.quarters.slice(newCount);

  

        // Remove extra quarters safely
        box.quarters = box.quarters.slice(0, newCount);
      }
      // If same count, do nothing
    }

    // Optional: track update time
    box.updatedAt = new Date();

    await box.save();

    res.status(200).json({
      success: true,
      message: "Box updated successfully",
      box,
    });
  } catch (err) {
    console.error("Update Box Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error during box update",
    });
  }
};

export const deleteBox = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;
    const { ownerCode } = req.body;
    // Validate owner code if provided
    const code = process.env.OWNER_CODE;

    if (ownerCode && ownerCode !== code) {
      return res.status(403).json({ message: "Invalid owner code" });
    }

    const deleted = await CricketBox.findOneAndDelete({
      _id: id,
      owner: ownerId,
    });
    if (!deleted) return res.status(404).json({ message: "Box not found" });

    res.json({ message: "Box deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const feedBackAndSupport = async (req, res) => {
  try {
    const { name, contactNumber, message } = req.body;

    // Validate name, contactNumber, and message
    if (!name || !contactNumber || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if contact number is exactly 10 digits and numeric
    if (!/^\d{10}$/.test(contactNumber)) {
      return res
        .status(400)
        .json({ message: "Enter a valid 10-digit phone number." });
    }

    // Save to database
    await HelpAndSupport.create({ name, contactNumber, message });

    return res
      .status(201)
      .json({ message: "Your message has been submitted." });
  } catch (error) {
    console.error("Error in feedBackAndSupport controller:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all cricket boxes
export const getAllBoxes = async (req, res) => {
  try {
    const boxes = await CricketBox.find().select("-blockedSlots");
    res.json(boxes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch boxes" });
  }
};

export const getBoxDetails = async (req, res) => {
  try {
    const box = await CricketBox.findById(req.params.id).select(
      "-blockedSlots"
    );
    if (!box) return res.status(404).json({ message: "Box not found" });
    res.json(box);
  } catch (err) {
    res.status(500).json({ message: "Failed to get box details" });
  }
};

//owner
export const getOwnerBoxes = async (req, res) => {
  try {
    const boxes = await CricketBox.find({ owner: req.user._id });
    res.json({ boxes });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch boxes" });
  }
};
