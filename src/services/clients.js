import api from "./api";

export async function getClients() {
  const response = await api.get("/clients");
  // assumindo que o endpoint retorna um Page<ClientDTO>
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

export async function deleteClient(id) {
  const response = await api.delete(`/clients/${id}`);
   return response.data;
}
