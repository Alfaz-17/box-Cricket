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
      images,
      numberOfQuarters // NEW
    } = req.body;

    const owner = req.user._id;

    const ownerHaveBox = await CricketBox.find({ owner });
    if (ownerHaveBox.length > 0) {
      return res.status(400).json({ message: "You already created a box" });
    }

    const quartersArray = [];
    for (let i = 1; i <= numberOfQuarters; i++) {
      quartersArray.push({
        name: `Quarter ${i}`,
        isAvailable: true
      });
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
      quarters: quartersArray // NEW FIELD ADDED
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
    const boxId = req.params.id; // assuming you pass box ID in URL
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
      numberOfQuarters // NEW
    } = req.body;

    const box = await CricketBox.findById(boxId);

    if (!box) {
      return res.status(404).json({ message: 'Box not found' });
    }

    // Update basic fields
    box.name = name || box.name;
    box.location = location || box.location;
    box.address = address || box.address;
    box.hourlyRate = hourlyRate || box.hourlyRate;
    box.mobileNumber = mobileNumber || box.mobileNumber;
    box.description = description || box.description;
    box.image = image || box.image;
    box.images = images || box.images;
    box.facilities = facilities ? facilities.split(',').map(f => f.trim()) : box.facilities;
    box.features = features ? features.split(',').map(f => f.trim()) : box.features;

    // Update quarters if needed
    if (numberOfQuarters) {
      const currentCount = box.quarters.length;

      if (numberOfQuarters > currentCount) {
        // Add new quarters
        for (let i = currentCount + 1; i <= numberOfQuarters; i++) {
          box.quarters.push({
            name: `Quarter ${i}`,
            isAvailable: true
          });
        }
      } else if (numberOfQuarters < currentCount) {
        // Remove extra quarters (optional: check for bookings before deleting)
        box.quarters = box.quarters.slice(0, numberOfQuarters);
      }
      // If same number, do nothing
    }

    await box.save();

    res.status(200).json({
      success: true,
      message: 'Box updated successfully',
      box,
    });
  } catch (err) {
    console.error('Update Box Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during box update',
    });
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



  

  