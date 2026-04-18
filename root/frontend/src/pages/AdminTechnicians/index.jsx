import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRequests, getAllReviews } from "../../services/admin.service.js";
import { getStoredUser } from "../../services/auth.service.js";
import "../AdminDashboard/AdminDashboard.css";
import "./AdminTechnicians.css"; // Specific styles for this page

export default function AdminTechnicians() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchTechnicianData();
  }, [navigate]);

  const fetchTechnicianData = async () => {
    try {
      setLoading(true);
      const requests = await getAllRequests();
      const reviews = await getAllReviews();

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
          tech.ratingCount > 0
            ? Math.round(tech.ratingSum / tech.ratingCount)
            : 0;
        tech.shouldTerminate = tech.ratingCount > 0 && tech.avgRating <= 2;
        tech.shouldBonus = false;
        return tech;
      });

      techArray.sort((a, b) => {
        if (b.completedTasks !== a.completedTasks)
          return b.completedTasks - a.completedTasks;
        return b.avgRating - a.avgRating;
      });

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
        return b.completedTasks - a.completedTasks;
      });

      setTechnicians(techArray);
    } catch (error) {
      console.error("Error fetching technician data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (sum, count) => {
    if (count === 0)
      return <span className="text-gray-light text-13">No ratings yet</span>;
    const avg = Math.round(sum / count);
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span
          key={i}
          className={`star ${i < avg ? "star-filled" : "star-empty"}`}
        >
          ★
        </span>
      ));
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
          <h2 className="page-title left-title">Technician Performance</h2>

          <div className="panel recent-requests-panel">
            {loading ? (
              <div className="empty-state-msg">
                Calculating performance stats...
              </div>
            ) : technicians.length === 0 ? (
              <div className="empty-state-msg">
                No technicians found with assigned tasks.
              </div>
            ) : (
              <table className="full-table">
                <thead>
                  <tr>
                    <th>Technician Name</th>
                    <th className="text-center">Total Tasks Assigned</th>
                    <th className="text-center">Tasks Completed</th>
                    <th className="pr-60">Completion Rate</th>
                    <th>Average Rating</th>
                    <th>Status / Action</th>
                  </tr>
                </thead>
                <tbody>
                  {technicians.map((tech, idx) => {
                    const completionRate =
                      tech.totalTasks > 0
                        ? Math.round(
                            (tech.completedTasks / tech.totalTasks) * 100,
                          )
                        : 0;
                    const fillClass = completionRate > 50 ? "good" : "average";

                    return (
                      <tr key={idx}>
                        <td className="user-cell">
                          <div className="mini-avatar" />
                          <span className="fw-500 text-dark">{tech.name}</span>
                        </td>
                        <td className="text-center">{tech.totalTasks}</td>
                        <td className="text-success-bold">
                          {tech.completedTasks}
                        </td>
                        <td className="pr-60">
                          <div className="progress-track">
                            <div
                              className={`progress-fill ${fillClass}`}
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                          <span className="progress-text">
                            {completionRate}%
                          </span>
                        </td>
                        <td>{renderStars(tech.ratingSum, tech.ratingCount)}</td>
                        <td>
                          {tech.shouldTerminate ? (
                            <span className="badge-terminate">Terminate</span>
                          ) : tech.shouldBonus ? (
                            <span className="badge-bonus">Bonus</span>
                          ) : (
                            <span className="badge-neutral">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
