import { Review } from '../models/Review.js'

export const addReview = async (req, res) => {
  try {
    const userId = req.user._id
    const name = req.user.name
    const { id } = req.params // box ID
    const { comment, rating } = req.body

    // Check if the user already gave a review for this box
    const existingReview = await Review.findOne({ userId, boxId: id })

    if (existingReview) {
      return res.status(400).json({ message: 'You already gave a review' })
    }
    if (rating > 5) {
      return res.status(400).json({ message: 'give rating out of 5' })
    }
    // Create and save new review
    const newReview = new Review({
      boxId: id,
      userId,
      name,
      comment,
      rating,
    })

    await newReview.save()

    res.json({ message: 'Thanks for giving review', review: newReview })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Failed to add review' })
  }
}

export const getReviews = async (req, res) => {
  try {
    const { id } = req.params // boxID

    const reviews = await Review.find({ boxId: id }).sort({ createdAt: -1 })

    let averageRating = 0

    if (reviews.length > 0) {
      const total = reviews.reduce((sum, review) => sum + review.rating, 0)
      averageRating = (total / reviews.length).toFixed(1) // one decimal point
    }

    res.json({
      reviews,
      averageRating: Number(averageRating),
      reviewCount: reviews.length,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to get reviews' })
  }
}
