import { useEffect, useState } from "react";
import { getAppointments, cancelAppointment } from "services/appointments";

// MUI Components
import DataTable from "examples/Tables/DataTable";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

// Função auxiliar para formatar status
const formatStatus = (status) => {
  switch (status) {
    case 0:
      return "Agendado";
    case 1:
      return "Cancelado";
    case 2:
      return "Concluído";
    default:
      return status;
  }
};

// Traduções de mensagens de erro vindas do backend
const errorTranslations = {
  "Appointment not found": "Agendamento não encontrado",
  "Only scheduled appointments can be canceled": "Somente agendamentos em andamento podem ser cancelados",
  "Appointments can only be canceled": "Agendamentos só podem ser cancelados com antecedência mínima",
};

function translateError(msg) {
  for (const key in errorTranslations) {
    if (msg.includes(key)) {
      return errorTranslations[key];
    }
  }
  return msg; // fallback: retorna mensagem original
}

function AppointmentsTable() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleEdit = (appointment) => {
    console.log("Editar:", appointment);
  };

  const handleCancel = async (id) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await cancelAppointment(id);
        await loadAppointments();
      } catch (err) {
        const backendMessage = err.response?.data?.error || "Erro inesperado";
        alert(translateError(backendMessage));
        console.error("Erro ao cancelar appointment:", err);
      }
    }
  };

  return (
    <DataTable
      table={{
        columns: [
          { Header: "Cliente", accessor: "client" },
          { Header: "Título", accessor: "title" },
          { Header: "Data/Horário", accessor: "dateTime" },
          { Header: "Status", accessor: "status" },
          { Header: "Ações", accessor: "actions", align: "center" },
        ],
        rows: appointments.map((a) => ({
          client: a.client?.name,
          title: a.title,
          dateTime: new Date(a.dateTime).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          }),
          status: formatStatus(a.status),
          actions: (
            <>
              <Tooltip title="Editar">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => handleEdit(a)}
                >
                  <i className="material-icons">edit</i>
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancelar">
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => handleCancel(a.id)}
                >
                  <i className="material-icons">close</i>
                </IconButton>
              </Tooltip>
            </>
          ),
        })),
      }}
      isSorted={false}
      entriesPerPage={false}
      showTotalEntries={false}
      noEndBorder
    />
  );
}

export default AppointmentsTable;
