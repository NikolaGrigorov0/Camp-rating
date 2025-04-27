import React, { useState, useEffect } from 'react';
import { FaStar, FaEdit, FaTrash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Reviews({ campId }) {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: ''
  });
  const [editingReview, setEditingReview] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [campId]);

  const fetchReviews = async () => {
    try {
      const jwtToken = localStorage.getItem("jwt");
      if (!jwtToken) {
        router.push("/login");
        return;
      }

      const res = await fetch(`https://localhost:5022/api/Review/GetReviewsByCampId/${campId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error('Failed to fetch reviews');
      }

      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const jwtToken = localStorage.getItem("jwt");
      if (!jwtToken) {
        router.push("/login");
        return;
      }

      const endpoint = editingReview 
        ? `https://localhost:5022/api/Review/UpdateReview/${editingReview.id}`
        : 'https://localhost:5022/api/Review/CreateReview';

      const res = await fetch(endpoint, {
        method: editingReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          campId,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save review');
      }

      const savedReview = await res.json();
      if (editingReview) {
        setReviews(reviews.map(r => r.id === savedReview.id ? savedReview : r));
      } else {
        setReviews([...reviews, savedReview]);
      }
      
      setNewReview({ rating: 5, comment: '' });
      setEditingReview(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to save review:', err);
      setError(err.message);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setNewReview({
      rating: review.rating,
      comment: review.comment
    });
    setShowForm(true);
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const jwtToken = localStorage.getItem("jwt");
      if (!jwtToken) {
        router.push("/login");
        return;
      }

      const res = await fetch(`https://localhost:5022/api/Review/DeleteReview/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error('Failed to delete review');
      }

      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Reviews</h2>
        <button
          onClick={() => {
            setEditingReview(null);
            setNewReview({ rating: 5, comment: '' });
            setShowForm(!showForm);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Review'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-xl">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Rating
            </label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="mr-2"
                >
                  <FaStar
                    className={`text-2xl ${
                      star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Comment
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
              minLength="10"
              maxLength="500"
              placeholder="Share your experience with this campsite..."
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {editingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`text-xl ${
                          star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600">{review.rating}/5</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(review)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <p className="text-gray-800 mb-2">{review.comment}</p>
              <div className="text-sm text-gray-500">
                By {review.userName} on {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 