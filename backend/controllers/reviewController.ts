import { Review } from '../models/Review.js';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const name = req.user?.name;
    const { id } = req.params; 
    const { comment, rating } = req.body;

    const existingReview = await Review.findOne({ userId, boxId: id });

    if (existingReview) {
      res.status(400).json({ message: 'You already gave a review' });
      return;
    }
    if (rating > 5) {
      res.status(400).json({ message: 'give rating out of 5' });
      return;
    }
    const newReview = new Review({
      boxId: id,
      userId,
      name,
      comment,
      rating,
    });

    await newReview.save();

    res.json({ message: 'Thanks for giving review', review: newReview });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Failed to add review' });
  }
};

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; 

    const reviews = await Review.find({ boxId: id }).sort({ createdAt: -1 });

    let averageRating = 0;

    if (reviews.length > 0) {
      const total = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = Number((total / reviews.length).toFixed(1)); 
    }

    res.json({
      reviews,
      averageRating: Number(averageRating),
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get reviews' });
  }
};
