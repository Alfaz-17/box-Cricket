import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { Star } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import api from "../../utils/api";
const ReviewsSection = ({ boxId }) => {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { isAuthenticated } = useContext(AuthContext);

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${boxId}`);
      setReviews(res.data.reviews);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5 || comment.trim() === "") {
      setErrorMsg("Please enter a valid rating (1-5) and comment.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      await axios.post(
        `http://localhost:5001/api/reviews/create/${boxId}`,
        { rating, comment },
        {
          withCredentials: true,
        }
      );
      setRating(0);
      setComment("");
      setShowForm(false);
      fetchReviews();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [boxId]);

return (
  <Card className="p-4 md:p-6 mt-8 rounded-2xl shadow-sm bg-base-300">
    <div className="flex justify-between items-center mb-6">
      <h2 style={{ fontFamily: "Bebas Neue" }}  className="text-2xl font-bold text-primary">Reviews</h2>
      {isAuthenticated && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg px-4 py-1 text-sm font-medium"
        >
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      )}
    </div>

    {/* Review Form */}
    {showForm && (
      <div className="mb-8 space-y-4 animate-fade-in">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              size={28}
              className={`cursor-pointer transition-transform duration-200 hover:scale-110 ${
                index < rating ? "text-primary fill-current" : "text-gray-400"
              }`}
              onClick={() => setRating(index + 1)}
            />
          ))}
        </div>

        <textarea
          rows="4"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-white transition"
          placeholder="Write your comment..."
        />

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="btn btn-primary rounded-lg px-6 py-2 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    )}

    {/* Review List */}
    {reviews.length === 0 ? (
      <div className="text-gray-500 dark:text-gray-400 text-sm italic">
        No reviews yet.
      </div>
    ) : (
      reviews.map((review) => (
        <div
          key={review._id}
          className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700 last:mb-0 last:pb-0 last:border-none"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              {review.profilePic ? (
                <img
                  src={review.profilePic}
                  alt={review.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-300"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm uppercase">
                  {review.name?.charAt(0)}
                </div>
              )}
              <span className="font-medium">{review.name}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(review.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, index) => (
              <Star
                key={index}
                size={18}
                className={`mr-1 ${
                  index < review.rating
                    ? "text-primary fill-current"
                    : "text-gray-400"
                }`}
              />
            ))}
          </div>

          <p className="text-base-content text-sm">{review.comment}</p>
        </div>
      ))
    )}
  </Card>
);
 
};

export default ReviewsSection;
