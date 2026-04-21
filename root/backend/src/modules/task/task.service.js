import pool from "../../db/connection.js";
import { AppError } from "../../common/utils/response/error.response.js";

export const getAssignedTasks = async (technicianId) => {
  const [tasks] = await pool.query(
    `SELECT r.*, u.name as customer_name, u.phone as customer_phone,
                c.category_name, b.brand_name
         FROM requests r
         JOIN users u ON r.user_id = u.userid
         JOIN devices d ON r.device_id = d.device_id
         JOIN categories c ON d.category_id = c.category_id
         JOIN brands b ON d.brand_id = b.brand_id
         WHERE r.technician_id = ?
         ORDER BY r.created_at DESC`,
    [technicianId],
  );
  return tasks;
};

export const updateTaskStatus = async (requestId, technicianId, statusId) => {
  const [request] = await pool.query(
    "SELECT * FROM requests WHERE requestid = ? AND technician_id = ?",
    [requestId, technicianId],
  );

  if (request.length === 0) {
    throw new AppError(
      "Task not found or not assigned to this technician",
      404,
    );
  }

  await pool.query("UPDATE requests SET status_id = ? WHERE requestid = ?", [
    statusId,
    requestId,
  ]);

  return { requestId, newStatusId: statusId };
};

export const getPendingTasks = async (technicianId) => {
  const [techRows] = await pool.query(
    "SELECT specialty FROM technicians WHERE technician_id = ?",
    [technicianId],
  );

  if (techRows.length === 0) {
    throw new AppError("Technician not found", 404);
  }

  const techSpecialty = techRows[0].specialty;

  let targetCategory = "";
  switch (techSpecialty) {
    case "Air Conditioner":
      targetCategory = "AC";
      break;
    case "TV Repair":
      targetCategory = "TV";
      break;
    case "Washing Machine":
      targetCategory = "WashingMachine";
      break;
    case "Oven Repair":
      targetCategory = "Cooker";
      break;
    default:
      targetCategory = techSpecialty; // Refrigerator & Dishwasher match exactly
  }

  const [rows] = await pool.query(
    `SELECT r.*, u.name as customer_name, u.phone as customer_phone,
            c.category_name, b.brand_name
     FROM requests r
     JOIN users u ON r.user_id = u.userid
     JOIN devices d ON r.device_id = d.device_id
     JOIN categories c ON d.category_id = c.category_id
     JOIN brands b ON d.brand_id = b.brand_id
     WHERE r.status_id = 1 
       AND r.technician_id IS NULL 
       AND c.category_name = ?
     ORDER BY r.created_at ASC`,
    [targetCategory],
  );

  return rows;
};

export const claimTask = async (requestId, technicianId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `SELECT requestid, status_id, technician_id
             FROM requests
             WHERE requestid = ?
             FOR UPDATE`,
      [requestId],
    );

    if (rows.length === 0) {
      throw new AppError("Request not found", 404);
    }

    const request = rows[0];

    if (request.status_id !== 1 || request.technician_id !== null) {
      throw new AppError(
        "Task is no longer available — it was just claimed by another technician",
        400,
      );
    }

    await connection.query(
      "UPDATE requests SET technician_id = ?, status_id = 2 WHERE requestid = ?",
      [technicianId, requestId],
    );

    await connection.commit();

    return { requestId, technicianId, newStatusId: 2 };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// 1. Update submitProposal to save both dates
export const submitProposal = async (requestId, proposalData) => {
  const { diagnosis, spareParts, labor, date1, date2 } = proposalData;
  await pool.query(
    `UPDATE requests 
     SET diagnosis_note = ?, spare_parts_cost = ?, labor_cost = ?, proposed_date_1 = ?, proposed_date_2 = ?, status_id = 9 
     WHERE requestid = ?`,
    [diagnosis, spareParts, labor, date1, date2, requestId],
  );
  return { success: true };
};

export const respondToProposal = async (
  requestId,
  decision,
  reason,
  chosenDate,
) => {
  if (decision === "accept") {
    await pool.query(
      `UPDATE requests SET status_id = 3, visit_date = ? WHERE requestid = ?`,
      [chosenDate, requestId],
    );
  } else {
    await pool.query(
      `UPDATE requests SET status_id = 6, rejection_reason = ? WHERE requestid = ?`,
      [reason, requestId],
    );
  }
  return { success: true };
};


