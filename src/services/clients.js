import api from "./api";

export async function getClients() {
  const response = await api.get("/clients");
  return response.data.content || [];

}

export async function getClientsPage(params) {
  const response = await api.get("/clients", { params });
  return response.data; // Page { content, totalElements, ... }
}

export async function createClient(data) {
  const response = await api.post("/clients", data);
  return response.data; 
}

export async function updateClient(id, data) {
  const response = await api.put(`/clients/${id}`, data);
   return response.data;
}

export async function cancelClient(id) {
  const res = await api.patch(`/clients/${id}/cancel`); 
  return res.data;
}
