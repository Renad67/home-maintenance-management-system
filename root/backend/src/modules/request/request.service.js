import pool from "../../db/connection.js";
import { AppError } from "../../common/utils/response/error.response.js";

const CATEGORY_TO_SPECIALTY = {
  WashingMachine: "Washing Machine",
  Refrigerator: "Refrigerator",
  AC: "Air Conditioner",
  Dishwasher: "Dishwasher",
  Cooker: "Oven Repair",
  TV: "TV Repair",
};

export const createServiceRequest = async (requestData) => {
  const { user_id, device_id, problem, district, address, preferredDate } =
    requestData;

  // Put it straight into the pending pool
  const technician_id = null;
  const status_id = 1; // 1 = pending

  // Automatically generate today's date so the database doesn't crash
  const today = new Date().toISOString().split("T")[0];

  const [result] = await pool.query(
    `INSERT INTO requests (user_id, technician_id, device_id, status_id, problem, district, address, preferred_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      technician_id,
      device_id,
      status_id,
      problem,
      district,
      address,
      preferredDate || null,
    ],
  );

  return {
    requestId: result.insertId,
    assignedTechnician: null,
    statusId: status_id,
    categoryMatched: "none",
  };
};

export const lookupDeviceId = async (category, brand) => {
  // 1. Try to find the exact Category + Brand match
  let [rows] = await pool.query(
    `SELECT d.device_id
         FROM devices d
         JOIN categories c ON d.category_id = c.category_id
         JOIN brands b ON d.brand_id = b.brand_id
         WHERE c.category_name = ? AND b.brand_name = ?`,
    [category, brand],
  );

  // 2. If it exists, perfect! Return it.
  if (rows.length > 0) {
    return rows[0].device_id;
  }

  // 3. If it DOES NOT exist, let's Auto-Create it in the devices table!
  console.log(
    `Exact match not found for ${brand} ${category}. Auto-creating it in the database...`,
  );

  // Find the standalone Category ID and Brand ID
  const [catRows] = await pool.query(
    "SELECT category_id FROM categories WHERE category_name = ?",
    [category],
  );
  const [brandRows] = await pool.query(
    "SELECT brand_id FROM brands WHERE brand_name = ?",
    [brand],
  );

  // If both exist, link them together as a new device!
  if (catRows.length > 0 && brandRows.length > 0) {
    const [insertResult] = await pool.query(
      "INSERT INTO devices (category_id, brand_id) VALUES (?, ?)",
      [catRows[0].category_id, brandRows[0].brand_id],
    );
    console.log(`Successfully created new device ID: ${insertResult.insertId}`);
    return insertResult.insertId; // Return the brand new EXACT match ID!
  }

  // 4. Ultimate fallback (just in case the brand table itself is missing the word)
  console.log("Could not auto-create. Falling back to category only.");
  const [fallbackRows] = await pool.query(
    `SELECT d.device_id
         FROM devices d
         JOIN categories c ON d.category_id = c.category_id
         WHERE c.category_name = ?
         LIMIT 1`,
    [category],
  );

  return fallbackRows.length ? fallbackRows[0].device_id : null;
};

export const getRequestsByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT r.*, s.name as status, t.name as technician_name, 
                c.category_name, b.brand_name
         FROM requests r
         JOIN statuses s ON r.status_id = s.status_id
         LEFT JOIN technicians t ON r.technician_id = t.technician_id
         JOIN devices d ON r.device_id = d.device_id
         JOIN categories c ON d.category_id = c.category_id
         JOIN brands b ON d.brand_id = b.brand_id
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
    [userId],
  );
  return rows;
};
