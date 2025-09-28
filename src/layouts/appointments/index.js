import { useEffect, useState } from "react";
import { getAppointments } from "services/appointments";

// MUI Components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";

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

  return (
    <DataTable
  table={{
    columns: [
      { Header: "Cliente", accessor: "client" },
      { Header: "Título", accessor: "title" },
      { Header: "Data/Horário", accessor: "dateTime" },
      { Header: "Status", accessor: "status" },
    ],
    rows: appointments.map((a) => ({
      client: a.client?.name,
      title: a.title,
      dateTime: new Date(a.dateTime).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      status: a.status,
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
