import axios from "axios";

const API_BASE = "http://localhost:8080/api";

export const registerUser = async (email, password, fullName) => {
  const response = await axios.post(`${API_BASE}/auth/register`, {
    email,
    password,
    fullName,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const getToken = () => localStorage.getItem("careeros_token");

export const saveToken = (token) => localStorage.setItem("careeros_token", token);

export const removeToken = () => localStorage.removeItem("careeros_token");

export const getUser = () => {
  const user = localStorage.getItem("careeros_user");
  return user ? JSON.parse(user) : null;
};

export const saveUser = (user) =>
  localStorage.setItem("careeros_user", JSON.stringify(user));

export const logout = () => {
  localStorage.removeItem("careeros_token");
  localStorage.removeItem("careeros_user");
};