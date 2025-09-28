import api from "./api";

export async function getAppointments() {
  const response = await api.get("/appointments");
  return response.data.content || [];
}
