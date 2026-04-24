import pool from "../db/connection.js";

// Helper to convert category names back to technician specialties
const getTargetSpecialty = (categoryName) => {
  switch (categoryName) {
    case "AC":
      return "Air Conditioner";
    case "TV":
      return "TV Repair";
    case "WashingMachine":
      return "Washing Machine";
    case "Cooker":
      return "Oven Repair";
    default:
      return categoryName; 
  }
};

export const autoAssignOverdueTasks = async () => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [overdueTasks] = await connection.query(`
      SELECT r.requestid, c.category_name 
      FROM requests r
      JOIN devices d ON r.device_id = d.device_id
      JOIN categories c ON d.category_id = c.category_id
      WHERE r.status_id = 1 
        AND r.technician_id IS NULL
        AND r.created_at <= NOW() - INTERVAL 36 HOUR
    `);

    if (overdueTasks.length === 0) {
      await connection.commit();
      return; // No overdue tasks right now, go back to sleep
    }

    console.log(
      `⚠️ Found ${overdueTasks.length} tasks older than 36h. Auto-assigning...`,
    );

    // 2. Loop through each overdue task and find the perfect technician
    for (const task of overdueTasks) {
      const requiredSpecialty = getTargetSpecialty(task.category_name);

      const [availableTechs] = await connection.query(
        `
        SELECT t.technician_id, COUNT(r.requestid) as active_task_count
        FROM technicians t
        LEFT JOIN requests r ON t.technician_id = r.technician_id AND r.status_id IN (2, 3, 9)
        WHERE t.specialty = ?
        GROUP BY t.technician_id
        ORDER BY active_task_count ASC, RAND()
        LIMIT 1
      `,
        [requiredSpecialty],
      );

      if (availableTechs.length > 0) {
        const selectedTechId = availableTechs[0].technician_id;

        // 3. Assign the task to the chosen technician (Status 2 = Assigned)
        await connection.query(
          "UPDATE requests SET technician_id = ?, status_id = 2 WHERE requestid = ?",
          [selectedTechId, task.requestid],
        );

        console.log(
          `✅ Auto-assigned Task #${task.requestid} to Tech #${selectedTechId}`,
        );
      } else {
        console.log(
          `❌ Could not auto-assign Task #${task.requestid}: No technicians available for ${requiredSpecialty}`,
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Failed to run auto-assignment cron job:", error);
  } finally {
    connection.release();
  }
};
