import React, { useState, useEffect } from "react";
import { getReviews, addReview, deleteReview } from "../services/reviewService";
import { useAuth } from "../context/AuthContext";
import "../styles/Reviews.css";

const Reviews = ({ playroomId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [playroomId, page]);

  const loadReviews = async () => {
    setLoading(true);
    const result = await getReviews(playroomId, page);
    if (result.success) {
      setReviews(result.data);
      setTotal(result.total);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Morate biti prijavljeni da biste ostavili recenziju");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    const result = await addReview(playroomId, rating, comment);
    if (result.success) {
      setSuccess("Recenzija je uspešno dodata!");
      setComment("");
      setRating(5);
      loadReviews();
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(result.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Da li ste sigurni da želite da obrišete ovu recenziju?")
    ) {
      const result = await deleteReview(id);
      if (result.success) {
        loadReviews();
      } else {
        alert(result.error);
      }
    }
  };

  const renderStars = (rating, interactive = false) => {
    return [...Array(5)].map((_, i) => (
      <span
        key={i}
        className={`star ${i < rating ? "filled" : ""} ${interactive ? "interactive" : ""}`}
        onClick={() => interactive && setRating(i + 1)}
      >
        ★
      </span>
    ));
  };

  if (loading && page === 1) {
    return <div className="reviews-loading">Učitavanje recenzija...</div>;
  }

  return (
    <div className="reviews-section" id="reviews-section">
      <div className="reviews-header">
        <h3>⭐ Recenzije ({total})</h3>
      </div>

      {/* Forma za dodavanje recenzije */}
      {isAuthenticated && user?.role === "roditelj" && (
        <div className="review-form">
          <h4>Ostavite vašu recenziju</h4>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="rating-input">
              <label>Vaša ocena:</label>
              <div className="stars">{renderStars(rating, true)}</div>
            </div>

            <div className="comment-input">
              <textarea
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Podelite vaše iskustvo sa ovom igraonicom..."
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Slanje..." : "📝 Ostavi recenziju"}
            </button>
          </form>
        </div>
      )}

      {/* Lista recenzija */}
      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>Još uvek nema recenzija. Budite prvi koji će ostaviti utisak!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">👤 {review.userName}</span>
                  <span className="review-date">
                    {new Date(review.createdAt).toLocaleDateString("sr-RS")}
                  </span>
                </div>
                <div className="review-rating">
                  {renderStars(review.rating)}
                </div>
              </div>
              <div className="review-comment">
                <p>{review.comment}</p>
              </div>
              {(user?.role === "admin" || user?.id === review.userId) && (
                <button
                  className="btn-delete-review"
                  onClick={() => handleDelete(review._id)}
                >
                  🗑 Obriši
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paginacija */}
      {total > 10 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-page"
          >
            ← Prethodna
          </button>
          <span className="page-info">
            Strana {page} od {Math.ceil(total / 10)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="btn-page"
          >
            Sledeća →
          </button>
        </div>
      )}
    </div>
  );
};

export default Reviews;
