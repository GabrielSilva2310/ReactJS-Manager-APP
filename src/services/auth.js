import api from "./api";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "com.mybusiness.managerapp/authToken:v1";

const CLIENT_ID = process.env.REACT_APP_AUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_AUTH_CLIENT_SECRET;

export function saveAuthData(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthData() {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeAuthData() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getTokenData() {
  const token = getAuthData();
  if (token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }
  return null;
}

// Helper: valida o JWT considerando uma margem (clock skew)
export function isTokenValid(skewSeconds = 30) {
  const td = getTokenData(); // já existe no seu arquivo
  if (!td?.exp) return false;               // sem exp -> inválido
  const nowSec = Date.now() / 1000;         // ms -> s
  return nowSec < (td.exp - skewSeconds);   // válido com folga
}

export async function login(username, password) {
  const data = new URLSearchParams();
  data.append("grant_type", "password");
  data.append("username", username);
  data.append("password", password);

  const response = await api.post("/oauth2/token", data, {
     headers: { "Content-Type": "application/x-www-form-urlencoded" },
     auth: { username: CLIENT_ID, password: CLIENT_SECRET }, 
  });

  const { access_token } = response.data;
  saveAuthData(access_token);
  return response.data;
}

export async function getMe() {
  const response = await api.get("/users/me");
  return response.data;
}

