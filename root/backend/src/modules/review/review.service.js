import pool from "../../db/connection.js";
import { AppError } from "../../common/utils/response/error.response.js";

export const submitReview = async (reviewData) => {
  const { request_id, user_id, technician_id, rating, comment } = reviewData;

  const [result] = await pool.query(
    "INSERT INTO reviews (request_id, user_id, technician_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
    [request_id, user_id, technician_id, rating, comment],
  );
  return result.insertId;
};

export const getCustomerReviews = async (userId) => {
  const [rows] = await pool.query(
    `SELECT r.*, req.problem, c.category_name, t.name as technician_name
         FROM reviews r
         JOIN requests req ON r.request_id = req.requestid
         JOIN technicians t ON r.technician_id = t.technician_id
         JOIN devices d ON req.device_id = d.device_id
         JOIN categories c ON d.category_id = c.category_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
    [userId],
  );
  return rows;
};

export const createReview = async (reviewData) => {
  const { user_id, technician_id, rating, comment } = reviewData;

  if (rating < 1 || rating > 5) {
    throw new AppError("Rating must be between 1 and 5", 400);
  }

  const [result] = await pool.query(
    "INSERT INTO reviews (user_id, technician_id, rating, comment) VALUES (?, ?, ?, ?)",
    [user_id, technician_id, rating, comment],
  );

  return result.insertId;
};

export const getTechnicianReviews = async (technicianId) => {
    const [rows] = await pool.query(
        `SELECT r.*, req.problem, c.category_name, u.name as customer_name
         FROM reviews r
         JOIN requests req ON r.request_id = req.requestid
         JOIN users u ON r.user_id = u.userid
         JOIN devices d ON req.device_id = d.device_id
         JOIN categories c ON d.category_id = c.category_id
         WHERE r.technician_id = ?
         ORDER BY r.created_at DESC`,
        [technicianId]
    );
    return rows;
};

export const getAllReviews = async () => {
    const [rows] = await pool.query(
        `SELECT r.*, c.category_name, u.name as customer_name, t.name as technician_name
         FROM reviews r
         JOIN requests req ON r.request_id = req.requestid
         JOIN users u ON r.user_id = u.userid
         JOIN technicians t ON r.technician_id = t.technician_id
         JOIN devices d ON req.device_id = d.device_id
         JOIN categories c ON d.category_id = c.category_id
         ORDER BY r.created_at DESC`
    );
    return rows;
};