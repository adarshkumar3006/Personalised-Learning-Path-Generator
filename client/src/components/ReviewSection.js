import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FiStar, FiThumbsUp } from 'react-icons/fi';
import './ReviewSection.css';

const ReviewSection = ({ type, targetId }) => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await api.get(`/reviews?type=${type}&targetId=${targetId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  }, [type, targetId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reviews', {
        type,
        targetId,
        rating,
        comment,
      });
      toast.success('Review submitted successfully!');
      setRating(0);
      setComment('');
      setShowForm(false);
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      toast.error('Please login to mark as helpful');
      return;
    }

    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      fetchReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const renderStars = (value, interactive = false, onChange = null) => {
    return (
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`star ${star <= value ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="review-section">
      <h3 className="review-title">Reviews & Feedback</h3>

      {isAuthenticated && !showForm && (
        <button
          className="btn-add-review"
          onClick={() => setShowForm(true)}
        >
          Write a Review
        </button>
      )}

      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating</label>
            {renderStars(rating, true, setRating)}
          </div>
          <div className="form-group">
            <label>Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows="4"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setShowForm(false);
                setRating(0);
                setComment('');
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <strong>{review.userId?.name || 'Anonymous'}</strong>
                  {renderStars(review.rating)}
                </div>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="review-comment">{review.comment}</p>
              )}
              <div className="review-footer">
                <button
                  className="btn-helpful"
                  onClick={() => handleHelpful(review._id)}
                >
                  <FiThumbsUp /> Helpful ({review.helpful?.count || 0})
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;

