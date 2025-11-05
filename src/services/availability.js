import api from "./api";


export async function getAvailability(userId, date) {
  const response = await api.get(`/users/${userId}/availability?date=${date}`);
  return response.data;
}