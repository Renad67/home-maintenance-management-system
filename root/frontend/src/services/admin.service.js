import axios from "axios";
import { getAuthHeader } from "./auth.service.js";

const API_URL = "http://localhost:3000/api/admin";

export const getDashboard = async () => {
  const response = await axios.get(`${API_URL}/dashboard`, {
    headers: getAuthHeader(),
  });
  // Our backend successResponse helper wraps the actual data inside a 'data' property
  return response.data.data || response.data;
};

export const getAllRequests = async () => {
  const response = await axios.get(`${API_URL}/requests`, {
    headers: getAuthHeader(),
  });
  return response.data.data || response.data;
};
export const getAllReviews = async () => {
  const response = await axios.get("http://localhost:3000/api/reviews", {
    headers: getAuthHeader(),
  });
  return response.data.data || [];
};
