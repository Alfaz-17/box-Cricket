
import CricketBox from "../models/CricketBox.js";



export const createBox = async (req, res) => {
  try {
    const { name, location, hourlyRate,mobileNumber, description } = req.body;
    const owner = req.user._id;

    const newBox = await CricketBox.create({
      name,
      location,
      hourlyRate,
      mobileNumber,
      description,
      owner,
    });

    res.status(201).json({ message: "Cricket box created", box: newBox });
  } catch (err) {
    res.status(500).json({ message: "Failed to create box" });
    console.log("error in createBox Controller",err)
  }
};

export const updateBox = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.user._id;

    const updated = await CricketBox.findOneAndUpdate(
      { _id: id, owner: ownerId },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Box not found" });
    res.json({ message: "Box updated", box: updated });
  } catch (err) {
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

  