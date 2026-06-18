import CricketBox from '../models/CricketBox.js';
import { HelpAndSupport } from '../models/Review.js';
import { generateSEOContent } from '../utils/seoGenerator.js';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.js';

dotenv.config();

export const createBox = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      location,
      address,
      latitude,
      longitude,
      hourlyRate,
      mobileNumber,
      description,
      facilities,
      features,
      customPricing,
      weekendHourlyRate,
      weekendCustomPricing,
      image,
      images,
      numberOfQuarters,
    } = req.body;

    const owner = req.user?._id;

    if (!owner) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

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
      facilities: facilities ? facilities.split(',').map((f: string) => f.trim()) : [],
      features: features ? features.split(',').map((f: string) => f.trim()) : [],
      customPricing: Array.isArray(customPricing) ? customPricing : [],
      weekendHourlyRate: weekendHourlyRate !== undefined ? Number(weekendHourlyRate) : hourlyRate,
      weekendCustomPricing: Array.isArray(weekendCustomPricing) ? weekendCustomPricing : [],

      owner,
      rating: 0,
      reviewCount: 0,
      reviews: [],
      quarters: quartersArray,
    });

    res.status(201).json({
      success: true,
      message: 'Cricket box created successfully',
      box: newBox,
    });
  } catch (err: any) {
    console.error('Create Box Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during box creation',
    });
  }
};

export const updateBox = async (req: AuthRequest, res: Response): Promise<void> => {
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
      weekendHourlyRate,
      weekendCustomPricing,
      numberOfQuarters,
    } = req.body;

    const box = await CricketBox.findById(boxId);

    if (!box) {
      res.status(404).json({ message: 'Box not found' });
      return;
    }

    if (customPricing) box.customPricing = customPricing;
    if (weekendCustomPricing) box.weekendCustomPricing = weekendCustomPricing;

    box.name = name !== undefined ? name : box.name;
    box.location = location !== undefined ? location : box.location;
    box.address = address !== undefined ? address : box.address;
    box.hourlyRate = hourlyRate !== undefined ? Number(hourlyRate) : box.hourlyRate;
    box.weekendHourlyRate = weekendHourlyRate !== undefined ? Number(weekendHourlyRate) : box.weekendHourlyRate;
    box.mobileNumber = mobileNumber !== undefined ? mobileNumber : box.mobileNumber;
    box.description = description !== undefined ? description : box.description;
    box.image = image !== undefined ? image : box.image;
    box.images = images !== undefined ? images : box.images;

    if (facilities) {
      box.facilities = facilities.split(',').map((f: string) => f.trim());
    }

    if (features) {
      box.features = features.split(',').map((f: string) => f.trim());
    }

    if (numberOfQuarters !== undefined) {
      const newCount = Number(numberOfQuarters);
      const currentCount = box.quarters.length;

      if (newCount > currentCount) {
        for (let i = currentCount + 1; i <= newCount; i++) {
          box.quarters.push({ name: `Box - ${i}` });
        }
      } else if (newCount < currentCount) {
        box.quarters = box.quarters.slice(0, newCount);
      }
    }

    box.updatedAt = new Date();

    await box.save();

    res.status(200).json({
      success: true,
      message: 'Box updated successfully',
      box,
    });
  } catch (err: any) {
    console.error('Update Box Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during box update',
    });
  }
};

export const deleteBox = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ownerId = req.user?._id;
    const { ownerCode } = req.body;
    const code = process.env.OWNER_CODE;

    if (ownerCode && ownerCode !== code) {
      res.status(403).json({ message: 'Invalid owner code' });
      return;
    }

    const deleted = await CricketBox.findOneAndDelete({
      _id: id,
      owner: ownerId,
    });
    
    if (!deleted) {
      res.status(404).json({ message: 'Box not found' });
      return;
    }

    res.json({ message: 'Box deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

export const feedBackAndSupport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, contactNumber, message } = req.body;

    if (!name || !contactNumber || !message) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    if (!/^\d{10}$/.test(contactNumber)) {
      res.status(400).json({ message: 'Enter a valid 10-digit phone number.' });
      return;
    }

    await HelpAndSupport.create({ name, contactNumber, message });

    res.status(201).json({ message: 'Your message has been submitted.' });
  } catch (error) {
    console.error('Error in feedBackAndSupport controller:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllBoxes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const boxes = await CricketBox.find().select('-blockedSlots');
    res.json(boxes);
  } catch (err) {
    next(err);
  }
};

export const getBoxDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const box = await CricketBox.findById(req.params.id).select('-blockedSlots');
    
    if (!box) {
      const error: any = new Error('Box not found');
      error.statusCode = 404;
      return next(error);
    }
    
    // Pass to unknown first since Mongoose documents have strict typing
    const boxObject = box.toObject();
    const seoContent = generateSEOContent(boxObject as any);
    
    res.json({
      ...boxObject,
      seo: seoContent
    });
  } catch (err) {
    next(err);
  }
};

export const getOwnerBoxes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const boxes = await CricketBox.find({ owner: req.user?._id });
    res.json({ boxes });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch boxes' });
  }
};
