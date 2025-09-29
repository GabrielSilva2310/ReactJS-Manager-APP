// src/utils/errorTranslator.js

const errorTranslations = {
  // Appointment cancel
  "Appointment not found": "Agendamento não encontrado",
  "Only scheduled appointments can be canceled": "Somente agendamentos em andamento podem ser cancelados",
  "Appointments can only be canceled": "Agendamentos só podem ser cancelados com antecedência mínima",

  // Appointment insert - validations (DTO)
  "Title is required!": "Título é obrigatório!",
  "Title must be between 3 and 70 characters long": "Título deve ter entre 3 e 70 caracteres",

  "Description is required!": "Descrição é obrigatória!",
  "Description must be between 3 and 150 characters long": "Descrição deve ter entre 3 e 150 caracteres",

  "Date and time is required!": "Data e hora são obrigatórias!",
  "Date must be in the future": "A data deve ser no futuro",

  "ClientId is required!": "Cliente é obrigatório!",

  // Appointment service errors
  "Client Id not found": "Cliente não encontrado",
  "This time slot is already booked.": "Horário indisponível",
  "Access denied": "Acesso negado",
};

// Função genérica para traduzir mensagens
export function translateError(msg) {
  for (const key in errorTranslations) {
    if (msg.includes(key)) {
      return errorTranslations[key];
    }
  }
  return msg; // fallback
}