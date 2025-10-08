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

// MUI Components
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
import { StaticDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";

// Creative Tim component
import MDBox from "components/MDBox";

// Utils
import { translateError } from "utils/errorTranslator";

const formatStatus = (status) => {
  switch (status) {
    case 0:
      return "Agendado";
    case 1:
      return "Cancelado";
    case 2:
      return "Concluído";
    case 3:
      return "Não Compareceu";
    default:
      return status;
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

  // 🧩 Herdar o tema base do Material Dashboard e sobrescrever apenas o calendário
  const baseTheme = useTheme();

  const theme = createTheme({
    ...baseTheme,
    components: {
      ...baseTheme.components,
      MuiPickersDay: {
        styleOverrides: {
          root: {
            "&.Mui-selected": {
              backgroundColor: "#1A73E8 !important", // azul padrão ManagerApp
              color: "#fff",
              "&:hover": {
                backgroundColor: "#1669c1 !important",
              },
            },
            "&.MuiPickersDay-today": {
              borderColor: "#1A73E8",
            },
          },
        },
      },
    },
  });

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

  const handleCancel = async (id) => {
    if (window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      try {
        await cancelAppointment(id);
        await loadAppointments();
      } catch (err) {
        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Erro inesperado";
        alert(translateError(backendMessage));
      }
    }
  };

  const handleDone = async (id) => {
    if (window.confirm("Marcar este agendamento como concluído?")) {
      try {
        await doneAppointment(id);
        await loadAppointments();
      } catch (err) {
        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Erro inesperado";
        alert(translateError(backendMessage));
      }
    }
  };

  const handleNoShow = async (id) => {
    if (window.confirm("Marcar este agendamento como 'Não compareceu'?")) {
      try {
        await noShowAppointment(id);
        await loadAppointments();
      } catch (err) {
        const backendMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Erro inesperado";
        alert(translateError(backendMessage));
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
          if (e.fieldName && e.message) {
            newErrors[e.fieldName] = translateError(e.message);
          }
        });
        setFieldErrors(newErrors);
      } else {
        const backendMessage = data?.message || data?.error || "Erro inesperado";
        alert(translateError(backendMessage));
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
          if (e.fieldName && e.message) {
            newErrors[e.fieldName] = translateError(e.message);
          }
        });
        setFieldErrors(newErrors);
      } else {
        const backendMessage = data?.message || data?.error || "Erro inesperado";
        alert(translateError(backendMessage));
      }
    }
  };

  const filteredAppointments = appointments.filter((a) =>
    dayjs(a.dateTime).isSame(selectedDate, "day")
  );

  return (
    <ThemeProvider theme={theme}>
      <MDBox pt={3} pb={3} px={2} ml={{ xs: 0, lg: 30 }}>
        <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
          <CardContent>
            {/* Cabeçalho */}
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                Agendamentos
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ height: "40px", color: "#fff" }}
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    title: "",
                    description: "",
                    dateTime: "",
                    clientId: "",
                  });
                  setFieldErrors({});
                  setOpen(true);
                }}
              >
                Novo Agendamento
              </Button>
            </MDBox>

            {/* Calendário + Tabela */}
            <MDBox display="flex" gap={4} flexWrap="wrap" justifyContent="flex-start">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <StaticDatePicker
                  displayStaticWrapperAs="desktop"
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  sx={{
                    "& .MuiPickersDay-root": { fontSize: "0.9rem" },
                    "& .MuiDayCalendar-weekDayLabel": { fontWeight: 600 },
                  }}
                />
              </LocalizationProvider>

              <MDBox flex={1}>
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
                      status: formatStatus(a.status),
                      actions: (
                        <>
                          <Tooltip title="Editar">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleEditOpen(a)}
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
                          <Tooltip title="Concluir">
                            <IconButton
                              color="success"
                              size="small"
                              onClick={() => handleDone(a.id)}
                            >
                              <i className="material-icons">check</i>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Não Compareceu">
                            <IconButton
                              color="warning"
                              size="small"
                              onClick={() => handleNoShow(a.id)}
                            >
                              <i className="material-icons">block</i>
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
              </MDBox>
            </MDBox>
          </CardContent>
        </Card>

        {/* Modal (criar/editar) */}
        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{editingId ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={!!fieldErrors.title}
                  helperText={fieldErrors.title}
                  disabled={!!editingId}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  error={!!fieldErrors.description}
                  helperText={fieldErrors.description}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="datetime-local"
                  label="Data/Horário"
                  InputLabelProps={{ shrink: true }}
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  error={!!fieldErrors.dateTime}
                  helperText={fieldErrors.dateTime}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Cliente"
                  value={formData.clientId}
                  onChange={(e) =>
                    setFormData({ ...formData, clientId: String(e.target.value) })
                  }
                  error={!!fieldErrors.clientId}
                  helperText={fieldErrors.clientId}
                  InputLabelProps={{ shrink: true }}
                  disabled={!!editingId}
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancelar</Button>
            {editingId ? (
              <Button onClick={handleUpdate} variant="contained" color="primary">
                Atualizar
              </Button>
            ) : (
              <Button onClick={handleCreate} variant="contained" color="primary">
                Salvar
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </MDBox>
    </ThemeProvider>
  );
}

export default AppointmentsTable;
