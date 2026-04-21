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
                      <td>#{req.requestid}</td>
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
