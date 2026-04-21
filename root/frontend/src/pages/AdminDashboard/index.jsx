import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRequests, getAllReviews } from "../../services/admin.service.js";
import { getStoredUser, logout } from "../../services/auth.service.js";
import StatCard from "../../components/StatCard.jsx";
import StatusPill from "../../components/StatusPill.jsx";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    setAdmin(user);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const fetchedRequests = await getAllRequests();
      const fetchedReviews = await getAllReviews();

      setRequests(fetchedRequests || []);
      setReviews(fetchedReviews || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      if (error.response?.status === 401) {
        logout();
      }
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
          className={`star-icon ${i < rating ? "star-active" : "star-inactive"}`}
        >
          ★
        </span>
      ));

  if (!admin) return null;

  const stats = {
    total: requests.length,
    pending: requests.filter(
      (r) => r.status_id === 1 || r.status?.toLowerCase() === "pending",
    ).length,
    accepted: requests.filter(
      (r) =>
        [2, 3].includes(r.status_id) ||
        ["assigned", "in progress", "in_progress"].includes(
          r.status?.toLowerCase(),
        ),
    ).length,
    completed: requests.filter(
      (r) => r.status_id === 4 || r.status?.toLowerCase() === "completed",
    ).length,
  };

  const recentRequests = requests.slice(0, 5);
  const latestFeedback = reviews.slice(0, 3);

  // 🔥 ADVANCED TECHNICIAN RANKING LOGIC (Matches the Performance Page!) 🔥
  const techMap = {};
  (requests || []).forEach((req) => {
    const name = req.technician_name;
    if (!name) return;
    if (!techMap[name])
      techMap[name] = {
        name,
        totalTasks: 0,
        completedTasks: 0,
        ratingSum: 0,
        ratingCount: 0,
      };
    techMap[name].totalTasks++;
    if (req.status_id === 4 || req.status?.toLowerCase() === "completed") {
      techMap[name].completedTasks++;
    }
  });

  (reviews || []).forEach((rev) => {
    const name = rev.technician_name;
    if (!name) return;
    if (!techMap[name])
      techMap[name] = {
        name,
        totalTasks: 0,
        completedTasks: 0,
        ratingSum: 0,
        ratingCount: 0,
      };
    techMap[name].ratingSum += rev.rating;
    techMap[name].ratingCount++;
  });

  let techArray = Object.values(techMap).map((tech) => {
    tech.avgRating =
      tech.ratingCount > 0 ? Math.round(tech.ratingSum / tech.ratingCount) : 0;
    tech.shouldTerminate = tech.ratingCount > 0 && tech.avgRating <= 2;
    tech.shouldBonus = false;
    return tech;
  });

  techArray.sort((a, b) => b.completedTasks - a.completedTasks);

  let bonusCount = 0;
  techArray.forEach((tech) => {
    if (tech.avgRating >= 4 && bonusCount < 3) {
      tech.shouldBonus = true;
      bonusCount++;
    }
  });

  techArray.sort((a, b) => {
    if (a.shouldBonus && !b.shouldBonus) return -1;
    if (!a.shouldBonus && b.shouldBonus) return 1;
    if (a.shouldTerminate && !b.shouldTerminate) return -1;
    if (!a.shouldTerminate && b.shouldTerminate) return 1;
    return b.completedTasks - a.completedTasks;
  });

  const rankedTechnicians = techArray.slice(0, 4); // Show top 4 in widget

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div>
          <div className="admin-logo">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2F6BFF"
              strokeWidth="2.5"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <div>
              <h2>Maintenance System</h2>
              <p>ADMIN PORTAL</p>
            </div>
          </div>
        </div>

        {/* LOGOUT PROFILE BOX */}
        <div className="admin-sidebar-user">
          <div className="admin-user-info-wrap">
            <div className="admin-user-avatar">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <h4>{admin.name.split(" ")[0]}</h4>
              <p>{admin.email}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header-inner">
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

        <div className="admin-content">
          <h2 className="page-title">Dashboard</h2>

          {/* STATS */}
          <div className="stats-grid">
            <StatCard
              label="Total Tasks"
              value={stats.total}
              icon="📋"
              variant="blue"
            />
            <StatCard
              label="Pending Tasks"
              value={stats.pending}
              icon="❗"
              variant="orange"
            />
            <StatCard
              label="Accepted Tasks"
              value={stats.accepted}
              icon="➖"
              variant="lightblue"
            />
            <StatCard
              label="Completed Tasks"
              value={stats.completed}
              icon="✔️"
              variant="green"
            />
          </div>

          {/* MIDDLE GRID */}
          <div className="middle-grid">
            {/* Feedback Panel */}
            <div className="panel feedback-panel">
              <div className="panel-header">
                <h3>Technician Feedback</h3>
                <span
                  className="view-all-link"
                  onClick={() => navigate("/admin-reviews")}
                >
                  View All &gt;
                </span>
              </div>
              {latestFeedback.length === 0 ? (
                <div className="panel-empty-state">No feedback yet.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Rating</th>
                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestFeedback.map((fb, idx) => (
                      <tr key={idx}>
                        <td>#{fb.request_id || fb.requestid}</td>
                        <td className="user-cell">
                          <div className="mini-avatar" />
                          {fb.customer_name?.split(" ")[0] || "Customer"}
                        </td>
                        <td>{renderStars(fb.rating)}</td>
                        <td className="comment-cell">
                          {fb.comment
                            ? fb.comment.length > 30
                              ? fb.comment.substring(0, 30) + "..."
                              : fb.comment
                            : "No comment."}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 🔥 UPDATED: Technician Rankings Panel (with Tags!) 🔥 */}
            <div className="panel top-tech-panel">
              <div className="panel-header">
                <h3>Technician Rankings</h3>
                <span
                  className="view-all-link"
                  onClick={() => navigate("/admin-technicians")}
                >
                  View All &gt;
                </span>
              </div>
              {rankedTechnicians.length === 0 ? (
                <div className="panel-empty-state">No ratings yet.</div>
              ) : (
                <div className="tech-list">
                  {rankedTechnicians.map((tech, idx) => (
                    <div className="tech-item" key={idx}>
                      <div className="tech-info">
                        <div className="mini-avatar" />
                        <div>
                          <div className="tech-name-wrapper">
                            <h4>{tech.name.split(" ")[0]}</h4>
                            {/* THE BADGES */}
                            {tech.shouldBonus && (
                              <span className="badge-bonus">Bonus</span>
                            )}
                            {tech.shouldTerminate && (
                              <span className="badge-terminate">Terminate</span>
                            )}
                          </div>
                          <p>{tech.completedTasks} Tasks Completed</p>
                        </div>
                      </div>
                      <div>{renderStars(tech.avgRating)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RECENT REQUESTS */}
          <div className="panel recent-requests-panel">
            <div className="panel-header">
              <h3>Recent Requests</h3>
              <span
                className="view-all-link"
                onClick={() => navigate("/admin-tasks")}
              >
                View All &gt;
              </span>
            </div>
            {loading ? (
              <div className="panel-empty-state">Loading...</div>
            ) : recentRequests.length === 0 ? (
              <div className="panel-empty-state">
                No maintenance requests yet.
              </div>
            ) : (
              <table className="full-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Customer</th>
                    <th>Problem</th>
                    <th>Technician</th>
                    <th>Status</th>
                    {/* 🔥 ADDED DATE HEADER HERE 🔥 */}
                    <th>Dates</th>
                    <th>Rejection Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((req) => (
                    <tr key={req.requestid}>
                      <td>#{req.requestid}</td>
                      <td className="user-cell">
                        <div className="mini-avatar" />
                        {
                          (
                            req.user_name ||
                            req.customer_name ||
                            "Customer"
                          ).split(" ")[0]
                        }
                      </td>
                      <td className="problem-cell">
                        {req.problem
                          ? req.problem.length > 20
                            ? req.problem.substring(0, 20) + "..."
                            : req.problem
                          : "Maintenance"}
                      </td>
                      <td
                        className={
                          req.technician_name
                            ? "tech-assigned"
                            : "tech-unassigned"
                        }
                      >
                        {req.technician_name || "Unassigned"}
                      </td>
                      <td>
                        <StatusPill
                          status={req.status || req.status_name || "pending"}
                        />
                      </td>

                      <td className="admin-dates-cell">
                        <div className="text-gray proposed-dates-text">
                          Proposed:{" "}
                          {req.proposed_date_1
                            ? `${req.proposed_date_1.split("T")[0]} / ${req.proposed_date_2.split("T")[0]}`
                            : "—"}
                        </div>
                        <div className="confirmed-date-text">
                          Confirmed:{" "}
                          {req.visit_date?.split("T")[0] || "Pending"}
                        </div>
                      </td>

                      <td
                        className={
                          req.rejection_reason
                            ? "rejection-reason-active"
                            : "rejection-reason-none"
                        }
                      >
                        {req.rejection_reason
                          ? `"${req.rejection_reason}"`
                          : "—"}
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
