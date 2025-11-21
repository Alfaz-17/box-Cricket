import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star } from 'lucide-react'
import AuthContext from '../../context/AuthContext'
import api from '../../utils/api'

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
      await axios.post(
        `http://localhost:5001/api/reviews/create/${boxId}`,
        { rating, comment },
        {
          withCredentials: true,
        }
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
    <Card className="mt-8 bg-muted/30">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle style={{ fontFamily: 'Bebas Neue' }} className="text-2xl font-bold text-primary">
          Reviews
        </CardTitle>
        {isAuthenticated && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Write a Review'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {/* Review Form */}
        {showForm && (
          <div className="mb-8 space-y-4 animate-fade-in bg-card p-4 rounded-lg border border-border">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={28}
                  className={`cursor-pointer transition-transform duration-200 hover:scale-110 ${
                    index < rating ? 'text-primary fill-current' : 'text-muted-foreground/30'
                  }`}
                  onClick={() => setRating(index + 1)}
                />
              ))}
            </div>

            <Textarea
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Write your comment..."
              className="bg-background"
            />

            {errorMsg && <p className="text-destructive text-sm">{errorMsg}</p>}

            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        )}

        {/* Review List */}
        {reviews.length === 0 ? (
          <div className="text-muted-foreground text-sm italic">No reviews yet.</div>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <div
                key={review._id}
                className="border-b border-border pb-6 last:mb-0 last:pb-0 last:border-none"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    {review.profilePic ? (
                      <img
                        src={review.profilePic}
                        alt={review.name}
                        className="w-9 h-9 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm uppercase">
                        {review.name?.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium">{review.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center mb-2">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={18}
                      className={`mr-1 ${
                        index < review.rating ? 'text-primary fill-current' : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-foreground text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ReviewsSection
