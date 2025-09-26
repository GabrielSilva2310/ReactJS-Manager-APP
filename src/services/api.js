import axios from "axios";
import { getAuthData } from "./auth";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080", // ← aqui
});

api.interceptors.request.use((config) => {
  const token = getAuthData();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
