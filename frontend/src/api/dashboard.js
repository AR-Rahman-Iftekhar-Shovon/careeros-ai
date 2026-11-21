import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const getBurnoutStatus = async () => {
  const token = localStorage.getItem("careeros_token");
  const response = await axios.get(`${API_BASE}/burnout`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data; // Backend already { success, data } পাঠায়
};

export const getCareerAnalysis = async () => {
  const token = localStorage.getItem("careeros_token");
  const response = await axios.get(`${API_BASE}/careers/analyze`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getSessions = async () => {
  const token = localStorage.getItem("careeros_token");
  const response = await axios.get(`${API_BASE}/sessions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data; 
};