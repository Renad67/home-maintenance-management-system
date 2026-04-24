import axios from "axios";
import { getAuthHeader } from "./auth.service.js";

const API_URL = "http://localhost:3000/api/tasks";

export const getPendingPool = async (technicianId) => {
  // Make sure your exact route matches what you set in task.routes.js
  const response = await axios.get(`${API_URL}/pending/${technicianId}`, {
    headers: getAuthHeader(),
  });
  return response.data.data || response.data;
};

export const getMyTasks = async (technicianId) => {
  const response = await axios.get(`${API_URL}/${technicianId}`, {
    headers: getAuthHeader(),
  });
  return response.data.data || [];
};

export const claimTask = async (requestId, technicianId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/claim`,
    { technicianId },
    { headers: getAuthHeader() },
  );
  return response.data;
};

export const updateTaskStatus = async (requestId, technicianId, statusId) => {
  const response = await axios.put(
    `${API_URL}/${requestId}/status`,
    { technicianId, statusId },
    { headers: getAuthHeader() },
  );
  return response.data;
};

export const submitProposal = async (requestId, proposalData) => {
  const response = await axios.post(
    `${API_URL}/${requestId}/proposal`,
    proposalData,
    { headers: getAuthHeader() },
  );
  return response.data;
};

export const completeTaskWithReport = async (taskId, reportData) => {
  const response = await axios.post(
    `${API_URL}/${taskId}/complete-report`,
    reportData,
    { headers: getAuthHeader() },
  );
  return response.data;
};
