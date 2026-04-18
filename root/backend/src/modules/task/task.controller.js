import * as taskService from './task.service.js';

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
        
        const result = await taskService.updateTaskStatus(requestId, technicianId, statusId);
        
        return res.status(200).json({
            success: true, message: 'Task status updated successfully', data: result
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
            success: true, message: 'Task claimed successfully', data: result
        });
    } catch (error) {
        next(error);
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
        const { decision, reason } = req.body;
        const result = await taskService.respondToProposal(taskId, decision, reason);
        return res.status(200).json({ success: true, data: result });
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