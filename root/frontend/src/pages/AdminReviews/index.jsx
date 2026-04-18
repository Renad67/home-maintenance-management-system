import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllReviews } from "../../services/admin.service.js";
import { getStoredUser } from "../../services/auth.service.js";
import "../AdminDashboard/AdminDashboard.css";
import "./AdminReviews.css"; // Specific styles for this page

export default function AdminReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchReviews();
  }, [navigate]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching all reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) =>
    Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          className={`star ${i < rating ? "star-filled" : "star-empty"}`}
        >
          ★
        </span>
      ));

  return (
    <div className="admin-layout">
      <main className="admin-main full-width-main">
        <header className="admin-header left-aligned-header">
          <button
            className="back-btn"
            onClick={() => navigate("/admin-dashboard")}
          >
            ← Back to Dashboard
          </button>
        </header>

        <div className="admin-content padded-content">
          <h2 className="page-title left-title">All Technician Feedback</h2>

          <div className="panel recent-requests-panel">
            {loading ? (
              <div className="empty-state-msg">Loading all feedback...</div>
            ) : reviews.length === 0 ? (
              <div className="empty-state-msg">
                No reviews found in the system.
              </div>
            ) : (
              <table className="full-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Technician</th>
                    <th>Device</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((rev) => (
                    <tr key={rev.review_id}>
                      <td>#{rev.request_id || rev.requestid}</td>
                      <td className="user-cell">
                        <div className="mini-avatar" />
                        {rev.customer_name || "Unknown"}
                      </td>
                      <td className="tech-assigned fw-500">
                        {rev.technician_name}
                      </td>
                      <td>{rev.category_name}</td>
                      <td>{renderStars(rev.rating)}</td>
                      <td className="italic-comment">
                        "{rev.comment || "No comment provided."}"
                      </td>
                      <td className="date-text">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
