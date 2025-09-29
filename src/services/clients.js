import api from "./api";

export async function getClients() {
  const response = await api.get("/clients");
  // assumindo que o endpoint retorna um Page<ClientDTO>
  return response.data.content || [];
}
