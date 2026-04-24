import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRequests } from "../../services/admin.service.js";
import { getStoredUser } from "../../services/auth.service.js";
import StatusPill from "../../components/StatusPill.jsx";
import "../AdminDashboard/AdminDashboard.css"; // For global layout (sidebar, etc)
import "./AdminAllTasks.css"; // Specific styles for this page

export default function AdminAllTasks() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchRequests();
  }, [navigate]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getAllRequests();
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };
  // 1. Helper function to check if older than 24 hours
  const isOverdue = (createdAt) => {
    if (!createdAt) return false;
    const hoursDifference = Math.abs(new Date() - new Date(createdAt)) / 36e5;
    return hoursDifference > 24;
  };

  // 2. Find tasks older than 24 hours that are still pending
  const overdueTasks = requests.filter((req) => {
    if (req.status_id !== 1 && req.status?.toLowerCase() !== "pending")
      return false;
    return isOverdue(req.created_at);
  });

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
          <h2 className="page-title left-title">All Maintenance Requests</h2>

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
                <p style={{ margin: 0, color: "#B91C1C", fontSize: "14px" }}>
                  There are <strong>{overdueTasks.length}</strong> request(s)
                  that have been waiting for over 24 hours without being claimed
                  by a technician. Please reassign them immediately.
                </p>
              </div>
            </div>
          )}

          <div className="panel recent-requests-panel scrollable-panel">
            {loading ? (
              <div className="empty-state-msg">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="empty-state-msg">
                No maintenance requests yet.
              </div>
            ) : (
              <table className="full-table nowrap-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Customer</th>
                    <th>Problem</th>
                    <th>Technician</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Dates</th>
                    <th>Diagnosis</th>
                    <th>Parts Cost</th>
                    <th>Labor Cost</th>
                    <th>Rejection Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.requestid}>
                      <td
                        className={
                          req.status_id === 1 && isOverdue(req.created_at)
                            ? "id-text-urgent"
                            : "id-text-normal"
                        }
                      >
                        #{req.requestid}
                        {/* 🔥 2. Added a space and margin so it doesn't squish! 🔥 */}
                        {req.status_id === 1 && isOverdue(req.created_at) && (
                          <span
                            className="urgent-badge"
                            style={{ marginLeft: "5px" }}
                          >
                           OVERDUE
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="user-cell">
                          <div className="mini-avatar" />
                          {
                            (
                              req.user_name ||
                              req.customer_name ||
                              "Customer"
                            ).split(" ")[0]
                          }
                        </div>
                      </td>
                      <td className="fw-500">
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
                      <td>{req.address || req.district || req.location}</td>
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
                        className={`text-13 ${req.diagnosis_note ? "text-gray-dark" : "text-gray-light"}`}
                      >
                        {req.diagnosis_note
                          ? req.diagnosis_note.length > 20
                            ? req.diagnosis_note.substring(0, 20) + "..."
                            : req.diagnosis_note
                          : "—"}
                      </td>
                      <td
                        className={`text-13 ${req.spare_parts_cost > 0 ? "text-dark fw-500" : "text-gray-light"}`}
                      >
                        {req.spare_parts_cost > 0
                          ? `${req.spare_parts_cost} EGP`
                          : "—"}
                      </td>
                      <td
                        className={`text-13 ${req.labor_cost > 0 ? "text-dark fw-500" : "text-gray-light"}`}
                      >
                        {req.labor_cost > 0 ? `${req.labor_cost} EGP` : "—"}
                      </td>
                      <td
                        className={
                          req.rejection_reason
                            ? "rejection-text"
                            : "text-gray-light text-13"
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
