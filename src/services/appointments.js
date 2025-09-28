import api from "./api";

export async function getAppointments() {
  const response = await api.get("/appointments");
  return response.data.content || [];
}

export async function cancelAppointment(id) {
  const response = await api.put(`/appointments/${id}/cancel`);
   return response.data;
}
