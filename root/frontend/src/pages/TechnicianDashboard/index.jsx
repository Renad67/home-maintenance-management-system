import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getStoredUser, logout } from "../../services/auth.service.js";
import { getTechnicianReviews } from "../../services/request.service.js";
import {
  getPendingPool,
  getMyTasks,
  claimTask,
  submitProposal,
  updateTaskStatus,
  completeTaskWithReport,
} from "../../services/task.service.js";
import StatusPill from "../../components/StatusPill.jsx";
import "./TechnicianDashboard.css";

export default function TechnicianDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks");

  // Task States
  const [pendingTasks, setPendingTasks] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [myReviews, setMyReviews] = useState([]);

  // Store all proposal form data and errors here
  const [proposalForms, setProposalForms] = useState({});
  const [proposalErrors, setProposalErrors] = useState({});
  const [formModes, setFormModes] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const fetchAllData = useCallback(async (tech) => {
    try {
      const techId = tech.technician_id || tech.userid || tech.id;

      const pool = await getPendingPool(techId);
      setPendingTasks(pool || []);

      const tasks = await getMyTasks(techId);
      if (tasks) {
        setActiveTasks(
          tasks.filter(
            (t) =>
              [2, 3, 9].includes(t.status_id) ||
              t.status?.toLowerCase() === "pending_approval",
          ),
        );
        setCompletedTasks(
          tasks.filter(
            (t) => t.status_id === 4 || t.status?.toLowerCase() === "completed",
          ),
        );
      }

      const reviews = await getTechnicianReviews(techId);
      setMyReviews(reviews || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      fetchAllData(stored);
    } else {
      navigate("/");
    }
  }, [navigate, fetchAllData]);

  const handleAcceptTask = async (requestId) => {
    try {
      setErrorMessage(""); // Clear old errors
      await claimTask(requestId, user.id);
      fetchAllData(user);
    } catch (error) {
      console.error("Failed to claim task", error);
      // Catches the daily limit error from backend
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to accept task.",
      );
    }
  };

  const handleReject = (requestId) => {
    setPendingTasks((prev) => prev.filter((t) => t.requestid !== requestId));
  };

  const handleFormChange = (taskId, field, value) => {
    // Clear the error for this specific task when they start typing again
    setProposalErrors((prev) => ({ ...prev, [taskId]: "" }));

    setProposalForms((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      },
    }));
  };

  const sendProposal = async (taskId) => {
    const form = proposalForms[taskId];

    // Check for errors and set the professional message instead of an alert
    if (
      !form ||
      !form.diag ||
      !form.parts ||
      !form.labor ||
      !form.date1 ||
      !form.date2
    ) {
      setProposalErrors((prev) => ({
        ...prev,
        [taskId]:
          "Please fill out all fields (Diagnosis, Parts, Labor, and both Dates)!",
      }));
      return;
    }

    try {
      await submitProposal(taskId, {
        diagnosis: form.diag,
        spareParts: form.parts,
        labor: form.labor,
        date1: form.date1,
        date2: form.date2,
      });

      // Clear the form and any errors on success
      setProposalForms((prev) => ({
        ...prev,
        [taskId]: { diag: "", parts: "", labor: "", date1: "", date2: "" },
      }));
      setProposalErrors((prev) => ({ ...prev, [taskId]: "" }));
      setFormModes((prev) => ({ ...prev, [taskId]: null }));

      fetchAllData(user);
    } catch (err) {
      console.error(err);
      setProposalErrors((prev) => ({
        ...prev,
        [taskId]: "Failed to send proposal. Please try again.",
      }));
    }
  };

  const sendFinalReport = async (taskId) => {
    const form = proposalForms[taskId];

    if (!form || !form.diag || !form.parts || !form.labor) {
      setProposalErrors((prev) => ({
        ...prev,
        [taskId]: "Please fill out Diagnosis, Parts, and Labor costs!",
      }));
      return;
    }

    try {
      await completeTaskWithReport(taskId, {
        diagnosis: form.diag,
        spareParts: form.parts,
        labor: form.labor,
      });

      setProposalForms((prev) => ({
        ...prev,
        [taskId]: { diag: "", parts: "", labor: "", date1: "", date2: "" },
      }));
      setProposalErrors((prev) => ({ ...prev, [taskId]: "" }));
      setFormModes((prev) => ({ ...prev, [taskId]: null }));

      fetchAllData(user);
    } catch (err) {
      console.error(err);
      setProposalErrors((prev) => ({
        ...prev,
        [taskId]: "Failed to submit final report. Please try again.",
      }));
    }
  };

  const handleMarkComplete = async (requestId) => {
    try {
      await updateTaskStatus(requestId, user.id, 4);
      fetchAllData(user);
    } catch (error) {
      console.error("Failed to complete task", error);
    }
  };

  const isOverdue = (createdAt) => {
    if (!createdAt) return false;
    const hoursDifference = Math.abs(new Date() - new Date(createdAt)) / 36e5;
    return hoursDifference > 24;
  };

  const overdueTasks = pendingTasks.filter((req) => {
    if (req.status_id !== 1 && req.status?.toLowerCase() !== "pending")
      return false;
    return isOverdue(req.created_at);
  });

  if (!user) return null;

  return (
    <div className="tech-dashboard-layout">
      {/* SIDEBAR */}
      <aside className="tech-sidebar">
        <div>
          <div className="tech-sidebar-logo">
            <div className="tech-logo-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div className="tech-logo-text">
              <h2>Maintenance system</h2>
              <p>Technician Portal</p>
            </div>
          </div>

          <nav className="tech-sidebar-nav">
            <button
              className={`tech-nav-item ${activeTab === "tasks" ? "active" : ""}`}
              onClick={() => setActiveTab("tasks")}
            >
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
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              My Tasks
            </button>
            <button
              className={`tech-nav-item ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
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
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              My Reviews
            </button>
          </nav>
        </div>

        {/* LOGOUT PROFILE BOX */}
        <div className="tech-sidebar-user">
          <div className="tech-user-info-wrap">
            <div className="tech-user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="tech-user-details">
              <h4>{user.name.split(" ")[0]}</h4>
              <p>{user.email}</p>
            </div>
          </div>
          <button className="tech-logout-btn" onClick={logout}>
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

      {/* MAIN CONTENT AREA */}
      <main className="tech-main-area">
        <header className="tech-topbar">
          <h1>{activeTab === "tasks" ? "My Tasks" : "My Reviews"}</h1>
          <div className="tech-topbar-right">
            <div className="tech-search-bar">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input type="text" placeholder="Search anything..." />
            </div>
          </div>
        </header>

        <div className="tech-content-wrapper">
          {/* --- TASKS VIEW --- */}
          {activeTab === "tasks" && (
            <>
              {overdueTasks.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#FEF2F2",
                    borderLeft: "5px solid #EF4444",
                    padding: "16px 20px",
                    borderRadius: "8px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>⚠️</span>
                  <div>
                    <h4
                      style={{
                        margin: "0 0 4px 0",
                        color: "#991B1B",
                        fontSize: "16px",
                      }}
                    >
                      Urgent: Unclaimed Tasks Detected
                    </h4>
                    <p
                      style={{ margin: 0, color: "#B91C1C", fontSize: "14px" }}
                    >
                      There are <strong>{overdueTasks.length}</strong>{" "}
                      request(s) that have been waiting for over 24 hours
                      without being claimed by a technician. Please reassign
                      them immediately.
                    </p>
                  </div>
                </div>
              )}

              {/* 🔥 Professional Error Message Box (For the 5-task limit) 🔥 */}
              {errorMessage && (
                <div
                  style={{
                    backgroundColor: "#FEE2E2",
                    color: "#991B1B",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "20px",
                    border: "1px solid #FCA5A5",
                  }}
                >
                  <strong>Error:</strong> {errorMessage}
                </div>
              )}

              {/* 1. THE POOL */}
              <div className="task-section">
                <div className="task-header">
                  <h3>Available Requests (Pool)</h3>
                  <span className="task-badge badge-warning">
                    {pendingTasks.length}
                  </span>
                </div>

                {pendingTasks.length === 0 ? (
                  <div className="empty-task-box">
                    No new requests available at the moment.
                  </div>
                ) : (
                  <div className="task-list">
                    {pendingTasks.map((req) => (
                      <div className="track-card" key={req.requestid}>
                        <div className="track-card-header">
                          <span className="req-id">
                            ID: #{req.requestid}
                            {/* 🔥 The Red Overdue Warning Badge 🔥 */}
                            {isOverdue(req.created_at) && (
                              <span
                                style={{
                                  backgroundColor: "#EF4444",
                                  color: "white",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  padding: "3px 6px",
                                  borderRadius: "4px",
                                  marginLeft: "8px",
                                  verticalAlign: "middle",
                                }}
                              >
                                OVERDUE
                              </span>
                            )}
                          </span>
                        </div>

                        <h3>{req.problem}</h3>
                        <p>
                          Device: {req.brand_name} {req.category_name}
                        </p>
                        <p>Customer: {req.customer_name}</p>

                        {/* 🔥 The Customer's Preferred Visit Date 🔥 */}
                        <p
                          style={{
                            fontWeight: "600",
                            color: "#4B5563",
                            marginTop: "6px",
                            backgroundColor: "#F3F4F6",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            display: "inline-block",
                          }}
                        >
                          📅 Preferred Date:{" "}
                          {req.preferred_date
                            ? req.preferred_date.split("T")[0]
                            : "Not Specified"}
                        </p>

                        <div
                          className="flex-gap-10"
                          style={{ marginTop: "12px" }}
                        >
                          <button
                            onClick={() => handleAcceptTask(req.requestid)}
                            className="btn-accept-proposal"
                            style={{ padding: "8px 24px" }}
                          >
                            ✓ Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. ACTIVE TASKS */}
              <div className="task-section">
                <div className="task-header">
                  <h3>Active Tasks</h3>
                  <span className="task-badge badge-active">
                    {activeTasks.length}
                  </span>
                </div>

                {activeTasks.length === 0 ? (
                  <div className="empty-task-box">
                    No active tasks assigned.
                  </div>
                ) : (
                  <div className="task-list">
                    {activeTasks.map((task) => {
                      const form = proposalForms[task.requestid] || {
                        diag: "",
                        parts: "",
                        labor: "",
                        date1: "",
                        date2: "",
                      };

                      return (
                        <div key={task.requestid} className="active-task-card">
                          <div className="active-task-header">
                            <span className="active-task-title">
                              {task.problem}
                            </span>
                            <StatusPill
                              status={
                                task.status_id === 2
                                  ? "ASSIGNED"
                                  : task.status_id === 9
                                    ? "PENDING APPROVAL"
                                    : "IN PROGRESS"
                              }
                            />
                          </div>
                          <div className="active-task-details">
                            <p>
                              #{task.requestid} — {task.address},{" "}
                              {task.district}
                            </p>
                            <p>
                              Device: {task.brand_name} {task.category_name}
                            </p>

                            <p className={task.visit_date ? "" : "no-margin"}>
                              Customer: {task.customer_name}{" "}
                              {task.customer_phone
                                ? `(${task.customer_phone})`
                                : ""}
                            </p>

                            {/* Show the chosen visit date if it exists */}
                            {task.visit_date && (
                              <p className="scheduled-date no-margin">
                                📅 Scheduled Visit:{" "}
                                {task.visit_date.split("T")[0]}
                              </p>
                            )}
                          </div>

                          {task.status_id === 2 &&
                            !formModes[task.requestid] && (
                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                  marginTop: "15px",
                                }}
                              >
                                <button
                                  className="btn-finish-repair"
                                  style={{
                                    flex: 1,
                                    padding: "8px 10px",
                                    backgroundColor: "#10B981",
                                    fontSize: "13px",
                                    whiteSpace: "nowrap",
                                  }}
                                  onClick={() =>
                                    setFormModes((prev) => ({
                                      ...prev,
                                      [task.requestid]: "complete",
                                    }))
                                  }
                                >
                                  ✓ Finish Repair & Mark Complete
                                </button>

                                <button
                                  className="btn-accept-proposal"
                                  style={{
                                    flex: 1,
                                    padding: "8px 10px",
                                    fontSize: "13px",
                                    whiteSpace: "nowrap",
                                  }}
                                  onClick={() =>
                                    setFormModes((prev) => ({
                                      ...prev,
                                      [task.requestid]: "second_visit",
                                    }))
                                  }
                                >
                                  📅 Apply for Second Visit
                                </button>
                              </div>
                            )}

                          {task.status_id === 2 &&
                            formModes[task.requestid] === "complete" && (
                              <div
                                className="proposal-form-container"
                                style={{ borderLeft: "4px solid #10B981" }}
                              >
                                <h4 className="proposal-form-title">
                                  📝 Final Visit Report (Job Completed)
                                </h4>

                                {proposalErrors[task.requestid] && (
                                  <div className="proposal-error-box">
                                    ⚠️ {proposalErrors[task.requestid]}
                                  </div>
                                )}

                                <textarea
                                  className="proposal-textarea"
                                  placeholder="Diagnosis Note (What did you fix?)"
                                  value={form.diag || ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      task.requestid,
                                      "diag",
                                      e.target.value,
                                    )
                                  }
                                />
                                <div className="proposal-inputs-row">
                                  <input
                                    className="proposal-input"
                                    type="number"
                                    placeholder="Spare Parts Cost (EGP)"
                                    value={form.parts || ""}
                                    onChange={(e) =>
                                      handleFormChange(
                                        task.requestid,
                                        "parts",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <input
                                    className="proposal-input"
                                    type="number"
                                    placeholder="Labor Cost (EGP)"
                                    value={form.labor || ""}
                                    onChange={(e) =>
                                      handleFormChange(
                                        task.requestid,
                                        "labor",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="flex-gap-10">
                                  <button
                                    className="btn-submit-proposal"
                                    style={{ backgroundColor: "#10B981" }}
                                    onClick={() =>
                                      sendFinalReport(task.requestid)
                                    }
                                  >
                                    Submit Report & Complete Task
                                  </button>
                                  <button
                                    className="btn-reject-proposal"
                                    onClick={() =>
                                      setFormModes((prev) => ({
                                        ...prev,
                                        [task.requestid]: null,
                                      }))
                                    }
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                          {/* 🔥 NEW WORKFLOW: Step 2B - The "Second Visit" Form (WITH DATES) 🔥 */}
                          {task.status_id === 2 &&
                            formModes[task.requestid] === "second_visit" && (
                              <div className="proposal-form-container">
                                <h4 className="proposal-form-title">
                                  📝 Cost Proposal & Second Visit
                                </h4>

                                {proposalErrors[task.requestid] && (
                                  <div className="proposal-error-box">
                                    ⚠️ {proposalErrors[task.requestid]}
                                  </div>
                                )}

                                <textarea
                                  className="proposal-textarea"
                                  placeholder="Diagnosis Note (e.g. Needs new compressor)"
                                  value={form.diag || ""}
                                  onChange={(e) =>
                                    handleFormChange(
                                      task.requestid,
                                      "diag",
                                      e.target.value,
                                    )
                                  }
                                />
                                <div className="proposal-inputs-row">
                                  <input
                                    className="proposal-input"
                                    type="number"
                                    placeholder="Spare Parts Cost (EGP)"
                                    value={form.parts || ""}
                                    onChange={(e) =>
                                      handleFormChange(
                                        task.requestid,
                                        "parts",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <input
                                    className="proposal-input"
                                    type="number"
                                    placeholder="Labor Cost (EGP)"
                                    value={form.labor || ""}
                                    onChange={(e) =>
                                      handleFormChange(
                                        task.requestid,
                                        "labor",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>

                                <div className="proposal-dates-row">
                                  <div className="proposal-date-col">
                                    <label className="proposal-label">
                                      Option 1:
                                    </label>
                                    <input
                                      className="proposal-input"
                                      type="date"
                                      value={form.date1 || ""}
                                      onChange={(e) =>
                                        handleFormChange(
                                          task.requestid,
                                          "date1",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="proposal-date-col">
                                    <label className="proposal-label">
                                      Option 2:
                                    </label>
                                    <input
                                      className="proposal-input"
                                      type="date"
                                      value={form.date2 || ""}
                                      onChange={(e) =>
                                        handleFormChange(
                                          task.requestid,
                                          "date2",
                                          e.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="flex-gap-10">
                                  <button
                                    className="btn-submit-proposal"
                                    onClick={() => sendProposal(task.requestid)}
                                  >
                                    Send Proposal to Customer
                                  </button>
                                  <button
                                    className="btn-reject-proposal"
                                    onClick={() =>
                                      setFormModes((prev) => ({
                                        ...prev,
                                        [task.requestid]: null,
                                      }))
                                    }
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}

                          {/* IF PENDING APPROVAL */}
                          {task.status_id === 9 && (
                            <div className="status-alert-pending">
                              ⏳ Waiting for customer to approve the proposal...
                            </div>
                          )}

                          {/* IF IN PROGRESS */}
                          {task.status_id === 3 && (
                            <button
                              className="btn-finish-repair"
                              onClick={() => handleMarkComplete(task.requestid)}
                            >
                              ✓ Finish Repair & Mark Complete
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. COMPLETED TASKS */}
              <div className="task-section">
                <div className="task-header">
                  <h3>Completed</h3>
                  <span className="task-badge gray">
                    {completedTasks.length}
                  </span>
                </div>
                {completedTasks.length === 0 ? (
                  <div className="empty-task-box">No completed tasks yet.</div>
                ) : (
                  <div className="task-list">
                    {completedTasks.map((task) => (
                      <div key={task.requestid} className="completed-task-card">
                        <div className="task-info">
                          <div className="completed-task-title">
                            {task.problem}
                          </div>
                          <div className="completed-task-details">
                            #{task.requestid} — {task.address}, {task.district}
                          </div>
                          <div className="completed-task-details">
                            Device: {task.brand_name} {task.category_name}
                          </div>
                          <div className="completed-task-customer">
                            Customer: {task.customer_name}{" "}
                            {task.customer_phone
                              ? `(${task.customer_phone})`
                              : ""}
                            <StatusPill status="completed" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* --- REVIEWS VIEW --- */}
          {activeTab === "reviews" && (
            <div className="task-section">
              <div className="task-header">
                <h3>Customer Feedback</h3>
                <span className="task-badge badge-success">
                  {myReviews.length} Total
                </span>
              </div>

              {myReviews.length === 0 ? (
                <div className="empty-task-box">
                  You don't have any reviews yet. Complete some jobs to get
                  feedback!
                </div>
              ) : (
                <div className="task-list">
                  {myReviews.map((rev) => (
                    <div key={rev.review_id} className="review-card">
                      <div className="review-header">
                        <div className="review-customer-info">
                          <div className="review-avatar">
                            {rev.customer_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="review-name">
                            {rev.customer_name}
                          </span>
                        </div>
                        <div className="review-rating">
                          {"★".repeat(rev.rating)}
                          {"☆".repeat(5 - rev.rating)}
                        </div>
                      </div>
                      <p className="review-comment">"{rev.comment}"</p>
                      <div className="review-footer">
                        <span>Device: {rev.category_name}</span>
                        <span>
                          {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
