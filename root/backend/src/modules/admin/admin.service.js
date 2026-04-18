import pool from "../../db/connection.js";

export const getDashboardData = async () => {
  // 1. Get Summary Stats
  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) as total FROM requests",
  );
  const [[{ pending }]] = await pool.query(
    "SELECT COUNT(*) as pending FROM requests WHERE status_id = 1",
  );
  const [[{ accepted }]] = await pool.query(
    "SELECT COUNT(*) as accepted FROM requests WHERE status_id IN (2, 3)",
  ); // assigned or in_progress
  const [[{ completed }]] = await pool.query(
    "SELECT COUNT(*) as completed FROM requests WHERE status_id = 4",
  );

  // 2. Get All Recent Requests (For the bottom table)
  const [recentRequests] = await pool.query(`
        SELECT r.requestid, u.name as user_name, r.problem, t.name as technician_name, r.district as location, s.name as status
        FROM requests r
        JOIN users u ON r.user_id = u.userid
        LEFT JOIN technicians t ON r.technician_id = t.technician_id
        JOIN statuses s ON r.status_id = s.status_id
        ORDER BY r.created_at DESC
        LIMIT 6
    `);

  // 3. Get Top Technicians (For the side panel with stars)
  const [topTechnicians] = await pool.query(`
        SELECT t.name, COALESCE(ROUND(AVG(rev.rating)), 5) as avg_rating
        FROM technicians t
        LEFT JOIN reviews rev ON t.technician_id = rev.technician_id
        GROUP BY t.technician_id
        ORDER BY avg_rating DESC
        LIMIT 4
    `);

  // 4. Get Latest Feedback (For the middle table)
  const [latestFeedback] = await pool.query(`
        SELECT rev.id as requestid, u.name as user_name, rev.rating, rev.comment
        FROM reviews rev
        JOIN users u ON rev.user_id = u.userid
        ORDER BY rev.created_at DESC
        LIMIT 3
    `);

  return {
    stats: { total, pending, accepted, completed },
    recentRequests,
    topTechnicians,
    latestFeedback,
  };
};

export const getAllRequests = async () => {
  const [requests] = await pool.query(`
        SELECT r.*, u.name as user_name, r.problem, t.name as technician_name, r.district as location, s.name as status, r.created_at
        FROM requests r
        JOIN users u ON r.user_id = u.userid
        LEFT JOIN technicians t ON r.technician_id = t.technician_id
        JOIN statuses s ON r.status_id = s.status_id
        ORDER BY r.created_at DESC
    `);
  return requests;
};
