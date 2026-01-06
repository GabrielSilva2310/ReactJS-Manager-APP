import api from "./api";

export const getAppointments = async (params) => {
  const response = await api.get("/appointments", { params });
  return response.data;
};

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

export async function doneAppointment(id) {
  const response = await api.put(`/appointments/${id}/done`);
  return response.data;
}

export async function noShowAppointment(id) {
  const response = await api.put(`/appointments/${id}/noShow`);
  return response.data;
}
