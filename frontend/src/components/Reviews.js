import React, { useEffect, useState } from "react";
import { addReview, deleteReview, getReviews } from "../services/reviewService";
import { useAuth } from "../context/AuthContext";
import "../styles/Reviews.css";

const REVIEWS_PER_PAGE = 10;

const Reviews = ({ playroomId }) => {
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!playroomId) return;
    loadReviews();
  }, [playroomId, page]);

  const loadReviews = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getReviews(playroomId, page);

      if (result?.success) {
        setReviews(Array.isArray(result.data) ? result.data : []);
        setTotal(Number(result.total) || 0);
      } else {
        setReviews([]);
        setTotal(0);
        setError(result?.error || "Greška pri učitavanju recenzija.");
      }
    } catch (err) {
      setReviews([]);
      setTotal(0);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Greška pri učitavanju recenzija.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setError("Morate biti prijavljeni da biste ostavili recenziju.");
      return;
    }

    if (user?.role !== "roditelj" && user?.role !== "admin") {
      setError("Samo roditelj može da ostavi recenziju.");
      return;
    }

    if (!comment.trim()) {
      setError("Komentar je obavezan.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await addReview(playroomId, rating, comment.trim());

      if (result?.success) {
        setSuccess("Recenzija je uspešno dodata.");
        setComment("");
        setRating(5);
        setPage(1);
        await loadReviews();

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(result?.error || "Dodavanje recenzije nije uspelo.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Dodavanje recenzije nije uspelo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Da li ste sigurni da želite da obrišete ovu recenziju?",
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const result = await deleteReview(id);

      if (result?.success) {
        setSuccess("Recenzija je uspešno obrisana.");

        if (reviews.length === 1 && page > 1) {
          setPage((prev) => prev - 1);
        } else {
          await loadReviews();
        }

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(result?.error || "Brisanje recenzije nije uspelo.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Brisanje recenzije nije uspelo.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const renderStars = (value, interactive = false) =>
    [...Array(5)].map((_, i) => (
      <button
        key={i}
        type="button"
        className={`star ${i < value ? "filled" : ""} ${
          interactive ? "interactive" : ""
        }`}
        onClick={() => interactive && setRating(i + 1)}
        disabled={!interactive}
        aria-label={`${i + 1} zvezdica`}
      >
        ★
      </button>
    ));

  const totalPages = Math.max(1, Math.ceil(total / REVIEWS_PER_PAGE));

  if (!playroomId) {
    return null;
  }

  if (loading && page === 1) {
    return <div className="reviews-loading">Učitavanje recenzija...</div>;
  }

  return (
    <div className="reviews-section" id="reviews-section">
      <div className="reviews-header">
        <h3>⭐ Recenzije ({total})</h3>
      </div>

      {isAuthenticated &&
        (user?.role === "roditelj" || user?.role === "admin") && (
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
                  maxLength={1000}
                />
              </div>

              <button
                type="submit"
                className="btn-submit"
                disabled={submitting}
              >
                {submitting ? "Slanje..." : "📝 Ostavi recenziju"}
              </button>
            </form>
          </div>
        )}

      {!isAuthenticated && error && (
        <div className="error-message">{error}</div>
      )}

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>Još nema recenzija. Budite prvi koji će ostaviti utisak.</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => {
            const reviewUserId =
              typeof review.userId === "object"
                ? review.userId?._id
                : review.userId;

            return (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-name">
                      👤 {review.userName || "Nepoznat korisnik"}
                    </span>
                    <span className="review-date">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString("sr-RS")
                        : "-"}
                    </span>
                  </div>

                  <div className="review-rating">
                    {renderStars(Number(review.rating) || 0)}
                  </div>
                </div>

                <div className="review-comment">
                  <p>{review.comment || ""}</p>
                </div>

                {(user?.role === "admin" || user?.id === reviewUserId) && (
                  <button
                    type="button"
                    className="btn-delete-review"
                    onClick={() => handleDelete(review._id)}
                    disabled={deletingId === review._id}
                  >
                    {deletingId === review._id ? "Brisanje..." : "🗑 Obriši"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="btn-page"
          >
            ← Prethodna
          </button>

          <span className="page-info">
            Strana {page} od {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
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
