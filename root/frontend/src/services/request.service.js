import axios from "axios";
import { getAuthHeader } from "./auth.service.js";

const API_URL = "http://localhost:3000/api/requests";

export const submitRequest = async (requestData) => {
  const response = await axios.post(API_URL, requestData, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const getMyRequests = async (userId) => {
  const response = await axios.get(`${API_URL}/user/${userId}`, {
    headers: getAuthHeader(),
  });
  return response.data.data || response.data;
};

export const getDeviceId = async (category, brand) => {
  // We changed the URL to point to our requests router instead
  const response = await axios.get(
    `http://localhost:3000/api/requests/device-lookup`,
    {
      params: { category, brand },
      headers: getAuthHeader(),
    },
  );
  return response.data.data?.device_id;
};
export const submitReview = async (reviewData) => {
  const response = await axios.post(
    `http://localhost:3000/api/reviews/submit`,
    reviewData,
    {
      headers: getAuthHeader(),
    },
  );
  return response.data;
};

export const getMyReviews = async (userId) => {
  const response = await axios.get(
    `http://localhost:3000/api/reviews/user/${userId}`,
    {
      headers: getAuthHeader(),
    },
  );
  return response.data.data || [];
};

export const getTechnicianReviews = async (techId) => {
  const response = await axios.get(
    `http://localhost:3000/api/reviews/technician/${techId}`,
    {
      headers: getAuthHeader(),
    },
  );
  return response.data.data || [];
};

export const respondToProposal = async (requestId, decision, reason = null) => {
    const response = await axios.post(`http://localhost:3000/api/tasks/${requestId}/proposal/respond`, { decision, reason }, { headers: getAuthHeader() });
    return response.data;
};