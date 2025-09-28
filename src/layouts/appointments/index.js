import { useEffect, useState } from "react";
import { getAppointments } from "services/appointments";

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

function AppointmentsTable() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppointments()
      .then((data) => setAppointments(data))
      .finally(() => setLoading(false));
  }, []);

  // handlers para ações
  const handleEdit = (appointment) => {
    console.log("Editar:", appointment);
    // aqui depois abriremos o modal de edição
  };

  const handleCancel = (id) => {
    console.log("Cancelar:", id);
    // aqui depois vamos chamar o service cancelAppointment()
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
