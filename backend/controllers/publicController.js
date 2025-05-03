import CricketBox from "../models/CricketBox.js";

// Get all cricket boxes
export const getAllBoxes = async (req, res) => {
  try {
    const boxes = await CricketBox.find().select("-blockedSlots");
    res.json(boxes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch boxes" });
  }
};

// Get box details by ID
export const getBoxDetails = async (req, res) => {
  try {
    const box = await CricketBox.findById(req.params.id).select("-blockedSlots");
    if (!box) return res.status(404).json({ message: "Box not found" });
    res.json(box);
  } catch (err) {
    res.status(500).json({ message: "Failed to get box details" });
  }
};

