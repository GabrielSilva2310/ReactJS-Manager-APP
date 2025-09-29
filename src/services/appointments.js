import api from "./api";

export async function getAppointments() {
  const response = await api.get("/appointments");
  return response.data.content || [];
}

export async function createAppointment(data) {
  const response = await api.post("/appointments", data);
  return response.data; 
}

export async function cancelAppointment(id) {
  const response = await api.put(`/appointments/${id}/cancel`);
   return response.data;
}

export async function updateAppointment(id, data) {
  const response = await api.put(`/appointments/${id}`, data);
   return response.data;
}
