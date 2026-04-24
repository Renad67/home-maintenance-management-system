import * as taskService from "./task.service.js";

export const getTasks = async (req, res, next) => {
  try {
    const { technicianId } = req.params;
    const tasks = await taskService.getAssignedTasks(technicianId);

    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { technicianId, statusId } = req.body;

    const result = await taskService.updateTaskStatus(
      requestId,
      technicianId,
      statusId,
    );

    return res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPending = async (req, res, next) => {
  try {
    const { technicianId } = req.params;

    const tasks = await taskService.getPendingTasks(technicianId);

    return res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const claimTask = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { technicianId } = req.body;

    const result = await taskService.claimTask(requestId, technicianId);

    return res.status(200).json({
      success: true,
      message: "Task claimed successfully",
      data: result,
    });
  } catch (error) {
    next(error); // This will pass the 5-task limit error cleanly to the frontend!
  }
};

export const submitProposal = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const result = await taskService.submitProposal(taskId, req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const respondToProposal = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    // 🔥 FIX: Added chosenDate so it actually passes to the service!
    const { decision, reason, chosenDate } = req.body;
    const result = await taskService.respondToProposal(
      taskId,
      decision,
      reason,
      chosenDate,
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// 🔥 NEW LOGIC: Route for when a tech rejects a task
export const rejectTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { reason } = req.body;
    const result = await taskService.rejectTask(taskId, reason);
    return res
      .status(200)
      .json({
        success: true,
        message: "Task returned to the pool.",
        data: result,
      });
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const result = await taskService.completeTask(taskId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const cancelTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const result = await taskService.cancelTask(taskId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const completeTaskWithReport = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const result = await taskService.completeTaskWithReport(taskId, req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
