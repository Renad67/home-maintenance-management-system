import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, logout } from "../../services/auth.service.js";
import {
  submitRequest,
  getMyRequests,
  getDeviceId,
  submitReview,
  getMyReviews,
  respondToProposal,
} from "../../services/request.service.js";
import StatusPill from "../../components/StatusPill.jsx";
import "./CustomerDashboard.css";

const CATEGORIES = [
  "AC",
  "Cooker",
  "Dishwasher",
  "Refrigerator",
  "TV",
  "WashingMachine",
];
const BRANDS = [
  "ARISTON",
  "BEKO",
  "FRESH",
  "LG",
  "MIDEA",
  "SAMSUNG",
  "SHARP",
  "TOSHIBA",
  "ZANUSSI",
];
const CAT_ICONS = {
  AC: "❄️",
  Cooker: "🔥",
  Dishwasher: "🍽️",
  Refrigerator: "🧊",
  TV: "📺",
  WashingMachine: "🫧",
};

const RequestCard = ({ req, fetchRequests, user }) => {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [chosenDate, setChosenDate] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // 🔥 NEW: Professional Error State

  const handleAction = async (decision) => {
    setErrorMsg(""); // Clear old errors

    if (decision === "reject" && !reason) {
      return setShowReject(true);
    }

    if (decision === "accept" && !chosenDate) {
      return setErrorMsg("Please select your preferred date before accepting.");
    }

    try {
      await respondToProposal(req.requestid, decision, reason, chosenDate);
      fetchRequests(user.id);
    } catch (err) {
      setErrorMsg("Failed to process request. Please try again.");
    }
  };

  return (
    <div className="track-card">
      <div className="track-card-header">
        <StatusPill
          status={
            req.status_id === 9 ? "Action Required" : req.status || "pending"
          }
        />
        <span className="req-id">ID: #{req.requestid}</span>
      </div>
      <h3>{req.category_name ?? "Device"}</h3>
      <p>{req.problem}</p>

      {req.status_id === 9 && (
        <div className="approval-popup">
          <h4 className="approval-title">
            ⚠️ Cost Proposal Awaiting Your Approval
          </h4>

          {errorMsg && (
            <div
              style={{
                backgroundColor: "#FEE2E2",
                color: "#991B1B",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "13px",
                marginBottom: "12px",
                border: "1px solid #FCA5A5",
              }}
            >
              {errorMsg}
            </div>
          )}

          <p className="approval-text">
            <strong>Diagnosis:</strong> {req.diagnosis_note}
          </p>
          <div className="approval-cost-row">
            <span>Parts: {req.spare_parts_cost} EGP</span>
            <span>Labor: {req.labor_cost} EGP</span>
            <span className="font-bold">
              Total: {Number(req.spare_parts_cost) + Number(req.labor_cost)} EGP
            </span>
          </div>

          <div className="date-selection-box">
            <p className="font-bold date-selection-title">
              Select your preferred date:
            </p>
            <label className="date-radio-label">
              <input
                type="radio"
                name={`date-${req.requestid}`}
                value={req.proposed_date_1?.split("T")[0]}
                onChange={(e) => setChosenDate(e.target.value)}
              />{" "}
              {req.proposed_date_1?.split("T")[0]}
            </label>
            <label className="date-radio-label date-radio-second">
              <input
                type="radio"
                name={`date-${req.requestid}`}
                value={req.proposed_date_2?.split("T")[0]}
                onChange={(e) => setChosenDate(e.target.value)}
              />{" "}
              {req.proposed_date_2?.split("T")[0]}
            </label>
          </div>

          {!showReject ? (
            <div className="flex-gap-10">
              <button
                onClick={() => handleAction("accept")}
                className="btn-accept-proposal"
              >
                ✓ Accept & Proceed
              </button>
              <button
                onClick={() => setShowReject(true)}
                className="btn-reject-proposal"
              >
                ✕ Reject Proposal
              </button>
            </div>
          ) : (
            <div className="reject-form-container">
              <input
                type="text"
                placeholder="Reason for rejection..."
                className="reject-input"
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex-gap-10">
                <button
                  onClick={() => handleAction("reject")}
                  className="btn-reject-proposal"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowReject(false);
                    setErrorMsg("");
                  }}
                  className="btn-cancel-reject"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="track-footer">
        {/* Footer content remains the same */}
      </div>
    </div>
  );
};

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");

  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [myRequests, setMyRequests] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({});

  const fetchRequests = useCallback(async (userId) => {
    setLoadingReqs(true);
    try {
      const data = await getMyRequests(userId);
      setMyRequests(data || []);

      const reviews = await getMyReviews(userId);
      setMyReviews(reviews || []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoadingReqs(false);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      navigate("/");
      return;
    }
    setUser(stored);
    fetchRequests(stored.id);
  }, [navigate, fetchRequests]);

  const handleSubmitRequest = async (e) => {
    if (e) e.preventDefault();
    if (
      !selectedCategory ||
      !selectedBrand ||
      !issueDescription ||
      !district ||
      !address ||
      !preferredDate
    ) {
      setSubmitStatus({
        type: "error",
        text: "Please fill out all fields including the date.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const device_id = await getDeviceId(selectedCategory, selectedBrand);

      if (!device_id) {
        setSubmitStatus({
          type: "error",
          text: "No device found for that brand and category.",
        });
        setSubmitting(false);
        return;
      }

      const response = await submitRequest({
        user_id: user.id,
        device_id: device_id,
        problem: issueDescription,
        district: district,
        address: address,
        preferredDate: preferredDate,
      });

      if (response.success) {
        setSubmitStatus({
          type: "success",
          text: "Request submitted successfully!",
        });

        await fetchRequests(user.id);

        setSelectedCategory("");
        setSelectedBrand("");
        setIssueDescription("");
        setDistrict("");
        setAddress("");
        setPreferredDate("");

        setTimeout(() => {
          setSubmitStatus(null);
          setActiveTab("track");
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus({
        type: "error",
        text: err.response?.data?.message || "Failed to submit request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPageTitle = () =>
    ({
      dashboard: "Customer Dashboard",
      submit: "Submit Request",
      track: "Track Requests",
      reviews: "Submit Review",
    })[activeTab];

  if (!user) return null;

  const activeCnt = myRequests.filter((r) =>
    ["assigned", "in_progress"].includes(r.status?.toLowerCase()),
  ).length;
  const completedCnt = myRequests.filter(
    (r) => r.status?.toLowerCase() === "completed",
  ).length;

  const assignedReqs = myRequests.filter(
    (r) => r.status?.toLowerCase() === "assigned",
  );
  const pendingReqs = myRequests.filter(
    (r) => r.status?.toLowerCase() === "pending",
  );
  const inProgressReqs = myRequests.filter(
    (r) =>
      r.status?.toLowerCase() === "in_progress" ||
      r.status?.toLowerCase() === "in progress",
  );
  const completedReqs = myRequests.filter(
    (r) => r.status?.toLowerCase() === "completed",
  );
  const actionReqs = myRequests.filter(
    (r) => r.status_id === 9 || r.status?.toLowerCase() === "pending_approval",
  );

  const renderSection = (title, data, countColor, emptyText) => (
    <div className="section-wrapper">
      <div className="section-header-flex">
        <h3 className="section-title">{title}</h3>
        <span
          className="count-badge"
          style={{ backgroundColor: countColor.bg, color: countColor.text }}
        >
          {data.length}
        </span>
      </div>
      {data.length === 0 ? (
        <div className="section-empty-box">{emptyText}</div>
      ) : (
        <div className="request-list-container">
          {data.map((req) => (
            <RequestCard
              key={req.requestid}
              req={req}
              fetchRequests={fetchRequests}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );

  const getMinDate = () => {
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 2);
    return minDate.toISOString().split("T")[0];
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div className="logo-text">
            <h2>Maintenance system</h2>
            <p>Customer Portal</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "submit", label: "Submit Request" },
            { id: "track", label: "Track Requests" },
            { id: "reviews", label: "Submit Review" },
          ].map(({ id, label }) => (
            <button
              key={id}
              className={`nav-item ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-info-wrap">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>{user.email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main-area">
        <header className="topbar">
          <h1>{getPageTitle()}</h1>
          <div className="topbar-right">
            <div className="search-bar">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search anything..." />
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          {/* ── Dashboard Tab ── */}
          {activeTab === "dashboard" && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon blue">📋</div> Total Requests
                  </div>
                  <h3>{myRequests.length}</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon yellow">⏳</div> Active
                  </div>
                  <h3>{activeCnt}</h3>
                </div>
                <div className="stat-card">
                  <div className="stat-header">
                    <div className="stat-icon green">✅</div> Completed
                  </div>
                  <h3>{completedCnt}</h3>
                </div>
              </div>

              {/* RECENT REQUESTS */}
              <div className="panel recent-requests-panel">
                <div className="recent-header-flex">
                  <h3 className="recent-title">Recent Requests</h3>
                  <span
                    className="view-all-link"
                    onClick={() => setActiveTab("track")}
                  >
                    View All &gt;
                  </span>
                </div>

                {myRequests.length === 0 ? (
                  <div className="recent-empty">
                    You don't have any recent requests.
                  </div>
                ) : (
                  <table className="recent-table">
                    <thead>
                      <tr className="recent-th-row">
                        <th className="recent-th">Request ID</th>
                        <th className="recent-th">Device</th>
                        <th className="recent-th">Problem</th>
                        <th className="recent-th">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myRequests.slice(0, 3).map((req) => (
                        <tr key={req.requestid} className="recent-tr">
                          <td className="recent-td-id">#{req.requestid}</td>
                          <td className="recent-td">
                            {req.category_name || "Device"}
                          </td>
                          <td className="recent-td">
                            {req.problem
                              ? req.problem.length > 25
                                ? req.problem.substring(0, 25) + "..."
                                : req.problem
                              : ""}
                          </td>
                          <td className="recent-td-status">
                            <StatusPill
                              status={
                                req.status_id === 9
                                  ? "Action Required"
                                  : req.status || "pending"
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {/* ── Submit Tab ── */}
          {activeTab === "submit" && (
            <div className="submit-container">
              <div className="submit-header">
                <h3>New Maintenance Request</h3>
                <p>Select your device and describe the issue.</p>
              </div>

              {submitStatus && (
                <div
                  className={`submit-alert ${
                    submitStatus.type === "success"
                      ? "submit-alert-success"
                      : "submit-alert-error"
                  }`}
                >
                  {submitStatus.text}
                </div>
              )}

              {/* Category */}
              <div className="form-section">
                <div className="form-label">📦 Device Category</div>
                <div className="category-grid">
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat}
                      className={`category-card ${
                        selectedCategory === cat ? "selected" : ""
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span className="category-icon-large">
                        {CAT_ICONS[cat]}
                      </span>
                      <span className="category-text">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div className="form-section">
                <div className="form-label">🏷 Brand</div>
                <div className="brand-grid">
                  {BRANDS.map((brand) => (
                    <div
                      key={brand}
                      className={`brand-pill ${
                        selectedBrand === brand ? "selected" : ""
                      }`}
                      onClick={() => setSelectedBrand(brand)}
                    >
                      {brand}
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="form-section">
                <div className="form-label">📍 Location</div>
                <div className="fancy-input-wrapper">
                  <input
                    className="fancy-input"
                    type="text"
                    placeholder="District (e.g. New Cairo)"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div className="fancy-input-wrapper">
                  <input
                    className="fancy-input"
                    type="text"
                    placeholder="Detailed address (Street, Building, Apartment)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Date Picker */}
              <div className="form-section">
                <div className="form-label">📅 Preferred Visit Date</div>
                <div className="fancy-input-wrapper">
                  <input
                    className="fancy-input"
                    type="date"
                    min={getMinDate()} /* 🔥 ADD THIS LINE HERE! 🔥 */
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-section">
                <div className="form-label">📝 Issue Description</div>
                <textarea
                  className="issue-textarea"
                  placeholder="Describe the problem in detail..."
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>

              <button
                className="submit-btn"
                onClick={handleSubmitRequest}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          )}

          {/* ── Track Tab ── */}
          {activeTab === "track" && (
            <div>
              {loadingReqs ? (
                <p className="text-gray">Loading your requests...</p>
              ) : myRequests.length === 0 ? (
                <div className="track-empty-container">
                  <div className="empty-icon empty-icon-lg">🔧</div>
                  <h4 className="empty-title">No requests found</h4>
                  <p className="empty-subtitle">
                    You haven't submitted any requests yet.
                  </p>
                </div>
              ) : (
                <>
                  {renderSection(
                    "Action Required",
                    actionReqs,
                    { bg: "#FEE2E2", text: "#991B1B" },
                    "No pending proposals.",
                  )}
                  {renderSection(
                    "Assigned",
                    assignedReqs,
                    { bg: "#DBEAFE", text: "#1D4ED8" },
                    "No assigned requests.",
                  )}
                  {renderSection(
                    "Pending",
                    pendingReqs,
                    { bg: "#FEF3C7", text: "#B45309" },
                    "No pending requests.",
                  )}
                  {renderSection(
                    "In Progress",
                    inProgressReqs,
                    { bg: "#E0E7FF", text: "#3730A3" },
                    "No requests currently in progress.",
                  )}
                  {renderSection(
                    "Completed",
                    completedReqs,
                    { bg: "#D1FAE5", text: "#065F46" },
                    "No completed requests yet.",
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Reviews Tab ── */}
          {activeTab === "reviews" && (
            <div className="reviews-container">
              <div className="section-header">
                <h3>Pending Reviews</h3>
                <p className="text-gray">
                  Rate your recent completed services.
                </p>
              </div>

              {myRequests
                .filter((req) => req.status?.toLowerCase() === "completed")
                .filter(
                  (req) =>
                    !myReviews.some((rev) => rev.request_id === req.requestid),
                )
                .map((req) => (
                  <div
                    className="track-card pending-review-card"
                    key={req.requestid}
                  >
                    <h4>
                      {req.category_name} Repair (ID: #{req.requestid})
                    </h4>
                    <p className="tech-name-label">
                      Technician: {req.technician_name}
                    </p>

                    <div className="stars-container">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star-icon ${
                            (reviewForm[req.requestid]?.rating || 0) >= star
                              ? "star-active"
                              : "star-inactive"
                          }`}
                          onClick={() =>
                            setReviewForm((prev) => ({
                              ...prev,
                              [req.requestid]: {
                                ...prev[req.requestid],
                                rating: star,
                              },
                            }))
                          }
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <textarea
                      placeholder="Leave a comment for the technician..."
                      className="review-textarea"
                      value={reviewForm[req.requestid]?.comment || ""}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          [req.requestid]: {
                            ...prev[req.requestid],
                            comment: e.target.value,
                          },
                        }))
                      }
                    />

                    <button
                      className="submit-btn btn-submit-review"
                      onClick={async () => {
                        const rating = reviewForm[req.requestid]?.rating;
                        if (!rating)
                          return alert("Please select a star rating!");

                        try {
                          await submitReview({
                            request_id: req.requestid,
                            user_id: user.id,
                            technician_id: req.technician_id,
                            rating: rating,
                            comment: reviewForm[req.requestid]?.comment || "",
                          });

                          fetchRequests(user.id);
                        } catch (error) {
                          console.error(error);
                          alert("Failed to submit review. Check backend logs.");
                        }
                      }}
                    >
                      Submit Review
                    </button>
                  </div>
                ))}

              <hr className="review-divider" />

              <div className="section-header">
                <h3>Your Past Reviews</h3>
              </div>

              {myReviews.length === 0 ? (
                <p className="text-gray">
                  You haven't submitted any reviews yet.
                </p>
              ) : (
                myReviews.map((rev) => (
                  <div key={rev.review_id} className="past-review-card">
                    <div className="past-review-header">
                      <h4 className="m-0">
                        {rev.category_name} (Tech: {rev.technician_name})
                      </h4>
                      <div className="text-yellow">
                        {"★".repeat(rev.rating)}
                        {"☆".repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <p className="past-review-comment">"{rev.comment}"</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
