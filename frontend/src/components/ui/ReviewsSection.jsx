import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Star, MessageSquarePlus, User } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import api from '../../utils/api'
import { motion, AnimatePresence } from 'framer-motion'

const ReviewsSection = ({ boxId }) => {
  const [reviews, setReviews] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { isAuthenticated } = useContext(AuthContext)

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${boxId}`)
      setReviews(res.data.reviews)
    } catch (err) {
      console.log(err)
    }
  }

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5 || comment.trim() === '') {
      setErrorMsg('Please enter a valid rating (1-5) and comment.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      await api.post(
        `/reviews/create/${boxId}`,
        { rating, comment }
      )
      setRating(0)
      setComment('')
      setShowForm(false)
      fetchReviews()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [boxId])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <h2 className="text-2xl font-bold text-primary font-display tracking-tight">
          Reviews & Ratings
        </h2>
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="text-primary hover:text-primary hover:bg-primary/10"
          >
            {showForm ? 'Cancel' : (
                <>
                    <MessageSquarePlus className="w-4 h-4 mr-2" />
                    Write a Review
                </>
            )}
          </Button>
        )}
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 rounded-xl p-6 space-y-4 border border-white/10">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Rating</label>
                    <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, index) => (
                            <Star
                            key={index}
                            size={24}
                            className={`cursor-pointer transition-all duration-200 hover:scale-110 ${
                                index < rating ? 'text-primary fill-primary' : 'text-muted-foreground/30 hover:text-primary/50'
                            }`}
                            onClick={() => setRating(index + 1)}
                            />
                        ))}
                        <span className="ml-2 text-sm font-medium text-primary">
                            {rating > 0 ? `${rating} / 5` : 'Select stars'}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Review</label>
                    <Textarea
                        rows={4}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Share your experience with this box..."
                        className="bg-black/20 border-white/10 focus:border-primary resize-none"
                    />
                </div>

                {errorMsg && <p className="text-destructive text-sm font-medium">{errorMsg}</p>}

                <div className="flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-primary text-black hover:bg-primary/90 font-bold"
                    >
                        {loading ? 'Submitting...' : 'Post Review'}
                    </Button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <p className="text-muted-foreground italic">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={review._id}
              className="group border-b border-white/5 pb-6 last:border-0"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {review.profilePic ? (
                      <img
                        src={review.profilePic}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/5 text-primary flex items-center justify-center font-bold text-sm border border-white/10">
                        {review.name?.charAt(0).toUpperCase() || <User size={16} />}
                      </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-foreground text-sm">{review.name}</h4>
                            <div className="flex items-center gap-1 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                    key={i}
                                    size={12}
                                    className={`${
                                        i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground/20'
                                    }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 group-hover:text-foreground transition-colors">
                        {review.comment}
                    </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default ReviewsSection
