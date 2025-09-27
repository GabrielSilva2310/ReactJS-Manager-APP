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


api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("com.mybusiness.managerapp/authToken:v1");
        sessionStorage.removeItem("com.mybusiness.managerapp/authToken:v1");
      } finally {
        if (window.location.pathname !== "/authentication/sign-in") {
          window.location.href = "/authentication/sign-in";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
