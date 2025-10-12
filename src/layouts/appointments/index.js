import { useEffect, useState } from "react";
import {
  getAppointments,
  cancelAppointment,
  createAppointment,
  updateAppointment,
  doneAppointment,
  noShowAppointment,
} from "services/appointments";
import { getClients } from "services/clients";

import DataTable from "examples/Tables/DataTable";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import { StaticDatePicker, LocalizationProvider, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import MDBox from "components/MDBox";
import { translateError } from "utils/errorTranslator";

dayjs.extend(utc);
dayjs.extend(timezone);

// ===== Helper para Status =====
const getStatusChip = (status) => {
  const normalized = typeof status === "string" ? status.toUpperCase() : status;

  switch (normalized) {
    case 0:
    case "SCHEDULED":
      return <Chip label="Agendado" sx={{ backgroundColor: "#1A73E8", color: "#fff" }} />;
    case 1:
    case "CANCELED":
      return <Chip label="Cancelado" sx={{ backgroundColor: "#E53935", color: "#fff" }} />;
    case 2:
    case "DONE":
      return <Chip label="Concluído" sx={{ backgroundColor: "#43A047", color: "#fff" }} />;
    case 3:
    case "NO_SHOW":
      return <Chip label="Não Compareceu" sx={{ backgroundColor: "#9E9E9E", color: "#fff" }} />;
    default:
      return <Chip label="Desconhecido" sx={{ backgroundColor: "#BDBDBD", color: "#fff" }} />;
  }
};

function AppointmentsTable() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dateTime: "",
    clientId: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const baseTheme = useTheme();
  const theme = createTheme({
    ...baseTheme,
    components: {
      MuiPickersDay: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor: "#1A73E8 !important",
              color: "#fff",
              "&:hover": { backgroundColor: "#1669c1 !important" },
            },
            "&.MuiPickersDay-today": { borderColor: "#1A73E8" },
          },
        },
      },
    },
  });

  // ===== LOAD DATA =====
  const loadAppointments = async () => {
    setLoading(true);
    try {
      const data = await getAppointments();
      setAppointments(data);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch {
      console.error("Erro ao carregar clientes");
    }
  };

  useEffect(() => {
    loadAppointments();
    loadClients();
  }, []);

  // ===== ACTIONS =====
  const handleCancel = async (id) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await cancelAppointment(id);
        await loadAppointments();
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || "Erro inesperado";
        alert(translateError(msg));
      }
    }
  };

  const handleDone = async (id) => {
    if (window.confirm("Marcar este agendamento como concluído?")) {
      try {
        await doneAppointment(id);
        await loadAppointments();
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || "Erro inesperado";
        alert(translateError(msg));
      }
    }
  };

  const handleNoShow = async (id) => {
    if (window.confirm("Marcar este agendamento como 'Não compareceu'?")) {
      try {
        await noShowAppointment(id);
        await loadAppointments();
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || "Erro inesperado";
        alert(translateError(msg));
      }
    }
  };

  const handleCreate = async () => {
    try {
      const payload = {
        ...formData,
        clientId: Number(formData.clientId),
        dateTime: new Date(formData.dateTime).toISOString(),
      };
      await createAppointment(payload);
      setOpen(false);
      setFormData({ title: "", description: "", dateTime: "", clientId: "" });
      setFieldErrors({});
      await loadAppointments();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const newErrors = {};
        data.errors.forEach((e) => {
          if (e.fieldName && e.message) newErrors[e.fieldName] = translateError(e.message);
        });
        setFieldErrors(newErrors);
      } else {
        const msg = data?.message || data?.error || "Erro inesperado";
        alert(translateError(msg));
      }
    }
  };

  const handleEditOpen = (appointment) => {
    document.activeElement.blur();
    setEditingId(appointment.id);
    setFormData({
      title: appointment.title || "",
      description: appointment.description || "",
      dateTime: new Date(appointment.dateTime).toISOString().slice(0, 16),
      clientId: appointment.client?.id ? String(appointment.client.id) : "",
    });
    setFieldErrors({});
    setOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const payload = {
        description: formData.description,
        dateTime: new Date(formData.dateTime).toISOString(),
      };
      await updateAppointment(editingId, payload);
      setOpen(false);
      setEditingId(null);
      setFormData({ title: "", description: "", dateTime: "", clientId: "" });
      setFieldErrors({});
      await loadAppointments();
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const newErrors = {};
        data.errors.forEach((e) => {
          if (e.fieldName && e.message) newErrors[e.fieldName] = translateError(e.message);
        });
        setFieldErrors(newErrors);
      } else {
        const msg = data?.message || data?.error || "Erro inesperado";
        alert(translateError(msg));
      }
    }
  };

  const filteredAppointments = appointments.filter((a) =>
    dayjs(a.dateTime).isSame(selectedDate, "day")
  );

  // ===== RENDER =====
  return (
    <ThemeProvider theme={theme}>
      <MDBox pt={3} pb={3} px={2} ml={{ xs: 0, lg: 30 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
          <CardContent>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Agendamentos
              </Typography>
              <Button
                variant="contained"
                sx={{
                  height: "40px",
                  color: "#fff",
                  backgroundColor: "#1A73E8",
                  "&:hover": { backgroundColor: "#1669c1" },
                }}
                onClick={() => {
                  setEditingId(null);
                  setFormData({ title: "", description: "", dateTime: "", clientId: "" });
                  setFieldErrors({});
                  setOpen(true);
                }}
              >
                Novo Agendamento
              </Button>
            </MDBox>

            {loading ? (
              <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                <CircularProgress color="primary" />
              </MDBox>
            ) : (
              <MDBox
                display="flex"
                justifyContent="flex-start"
                alignItems="flex-start"
                gap={3}
                sx={{
                  flexDirection: { xs: "column", md: "row" },
                  flexWrap: { xs: "wrap", md: "nowrap" },
                }}
              >
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    value={selectedDate}
                    onChange={(newDate) => setSelectedDate(newDate)}
                    sx={{ flexShrink: 0, flexBasis: { xs: "100%", md: "360px" } }}
                    renderDay={(day, _value, DayComponentProps) => {
                      const appointment = appointments.find((a) =>
                        dayjs(a.dateTime).isSame(day, "day")
                      );
                      const isPast = day.isBefore(dayjs(), "day");
                      const isOutsideMonth = day.month() !== selectedDate.month();
                      return (
                        <div style={{ position: "relative" }}>
                          <PickersDay {...DayComponentProps} />
                          {appointment && !isOutsideMonth && (
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: isPast ? "#b0b0b0" : "#1A73E8",
                                position: "absolute",
                                bottom: 4,
                                left: "50%",
                                transform: "translateX(-50%)",
                              }}
                            />
                          )}
                        </div>
                      );
                    }}
                  />
                </LocalizationProvider>

                <MDBox flexGrow={1} sx={{ width: "100%", overflowX: "auto" }}>
                  {filteredAppointments.length === 0 ? (
                    <MDBox
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      minHeight="200px"
                      sx={{ color: "#9e9e9e", fontStyle: "italic" }}
                    >
                      Nenhum agendamento neste dia
                    </MDBox>
                  ) : (
                    <DataTable
                      table={{
                        columns: [
                          { Header: "Cliente", accessor: "client" },
                          { Header: "Título", accessor: "title" },
                          { Header: "Descrição", accessor: "description" },
                          { Header: "Data/Horário", accessor: "dateTime" },
                          { Header: "Status", accessor: "status" },
                          { Header: "Ações", accessor: "actions", align: "center" },
                        ],
                        rows: filteredAppointments.map((a) => ({
                          client: a.client?.name,
                          title: a.title,
                          description: a.description,
                          dateTime: new Date(a.dateTime).toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          }),
                          status: getStatusChip(a.status),
                          actions: (
                            <MDBox display="flex" justifyContent="center" gap={0.5}>
                              <Tooltip title="Editar">
                                <IconButton color="primary" size="small" onClick={() => handleEditOpen(a)}>
                                  <i className="material-icons">edit</i>
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancelar">
                                <IconButton color="error" size="small" onClick={() => handleCancel(a.id)}>
                                  <i className="material-icons">close</i>
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Concluir">
                                <IconButton color="success" size="small" onClick={() => handleDone(a.id)}>
                                  <i className="material-icons">check</i>
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Não Compareceu">
                                <IconButton color="warning" size="small" onClick={() => handleNoShow(a.id)}>
                                  <i className="material-icons">block</i>
                                </IconButton>
                              </Tooltip>
                            </MDBox>
                          ),
                        })),
                      }}
                      isSorted={false}
                      entriesPerPage={false}
                      showTotalEntries={false}
                      noEndBorder
                    />
                  )}
                </MDBox>
              </MDBox>
            )}
          </CardContent>
        </Card>
      </MDBox>
    </ThemeProvider>
  );
}

export default AppointmentsTable;
