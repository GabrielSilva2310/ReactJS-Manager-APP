import { useEffect, useState } from "react";
import {
  getAppointments,
  cancelAppointment,
  createAppointment,
  updateAppointment,
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

// Utils
import { translateError } from "utils/errorTranslator";

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
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // modal
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dateTime: "",
    clientId: "",
  });

  // erros de validação por campo
  const [fieldErrors, setFieldErrors] = useState({});

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

  return (
    <>
      {/* Botão Novo Appointment */}
      <Button
        variant="contained"
        color="primary"
        style={{ marginBottom: "16px" }}
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

      {/* DataTable */}
      <DataTable
        table={{
          columns: [
            { Header: "Cliente", accessor: "client" },
            { Header: "Título", accessor: "title" },
            { Header: "Descrição", accessor: "description" }, // 👈 nova coluna
            { Header: "Data/Horário", accessor: "dateTime" },
            { Header: "Status", accessor: "status" },
            { Header: "Ações", accessor: "actions", align: "center" },
          ],
          rows: appointments.map((a) => ({
            client: a.client?.name,
            title: a.title,
            description: a.description, // 👈 valor da descrição
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
              </>
            ),
          })),
        }}
        isSorted={false}
        entriesPerPage={false}
        showTotalEntries={false}
        noEndBorder
      />

      {/* Modal (criar/editar) */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {editingId ? "Editar Appointment" : "Novo Appointment"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Título"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                error={!!fieldErrors.title}
                helperText={fieldErrors.title}
                disabled={!!editingId} // título não editável
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descrição"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, dateTime: e.target.value })
                }
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
                disabled={!!editingId} // cliente não editável
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
    </>
  );
}

export default AppointmentsTable;
