// src/services/workingPeriods.js
import api from "./api";

// Lista períodos de trabalho do usuário logado
export const getWorkingPeriods = async (page = 0, size = 7) => {
  const response = await api.get("/working-periods", {
    params: { page, size, sort: "dayOfWeek" },
  });
  return response.data; // Spring Page<WorkingPeriodDTO>
};

// Cria um período de trabalho
export const createWorkingPeriod = async (payload) => {
  // payload: { dayOfWeek: "MONDAY", startTime: "09:00", endTime: "18:00" }
  const response = await api.post("/working-periods", payload);
  return response.data;
};

// Atualiza um período de trabalho existente
export const updateWorkingPeriod = async (id, payload) => {
  // payload: { startTime: "09:00", endTime: "18:00" }
  const response = await api.put(`/working-periods/${id}`, payload);
  return response.data;
};

// Deleta um período de trabalho
export const deleteWorkingPeriod = async (id) => {
  await api.delete(`/working-periods/${id}`);
};
