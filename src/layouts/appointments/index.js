import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";

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
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import { DateCalendar, LocalizationProvider, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import MDBox from "components/MDBox";
import { translateError } from "utils/errorTranslator";
import Slide from "@mui/material/Slide";
import { getAvailability } from "services/availability";
import { useAuth } from "contexts/AuthContext";




dayjs.extend(utc);
dayjs.extend(timezone);

// ===== Helper Snackbar =====
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

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

const normalizeStatus = (status) => {
  if (typeof status === "string") {
    return status.toUpperCase();
  }

  switch (status) {
    case 0: return "SCHEDULED";
    case 1: return "CANCELED";
    case 2: return "DONE";
    case 3: return "NO_SHOW";
    default: return "";
  }
};

function AppointmentsTable() {
  let renderCount = 0;

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
const updatingRef = useRef(false);
const lastDateRef = useRef(null);

const [availableSlots, setAvailableSlots] = useState([]);
const [selectedTime, setSelectedTime] = useState("");
const [loadingSlots, setLoadingSlots] = useState(false);

const [filterClient, setFilterClient] = useState("");
const [filterStatus, setFilterStatus] = useState("");

const [page, setPage] = useState(0);      
const [size, setSize] = useState(10);  
const [totalPages, setTotalPages] = useState(0);
const [totalElements, setTotalElements] = useState(0);

const { user } = useAuth();
const reloadRef = useRef(0);

const from = totalElements === 0 ? 0 : page * size + 1;
const to = Math.min((page + 1) * size, totalElements);

const [rangeStart, setRangeStart] = useState(""); 
const [rangeEnd, setRangeEnd] = useState("");     


  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({ open: true, title, message, onConfirm });
  };
  const handleConfirmClose = () => {
    setConfirmDialog({ ...confirmDialog, open: false });
  };

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

    // 👇 AQUI ESTÁ O SEGREDO PARA ALTERAR OS NOMES DOS DIAS:
    MuiDayCalendar: {
      styleOverrides: {
        weekDayLabel: {
          fontSize: "14px",
          fontWeight: 500,
          opacity: 0.9,
        },
      },
    },
  },
});

  const handleCloseModal = () => {
  setOpen(false);
  setEditingId(null);
  setFormData({ title: "", description: "", dateTime: "", clientId: "" });
  setSelectedTime("");
  setAvailableSlots([]);
  setFieldErrors({});
};

 const loadAppointments = async () => {
  setLoading(true);
  try {
    const params = {};

    // filtros
    if (filterClient) params.clientId = filterClient;
    if (filterStatus) params.status = filterStatus;

   // intervalo de data/hora (range tem prioridade)
let start;
let end;

if (rangeStart || rangeEnd) {
  const startStr = rangeStart || rangeEnd;
  const endStr = rangeEnd || rangeStart;

  start = dayjs(startStr).startOf("day").toISOString();
  end = dayjs(endStr).endOf("day").toISOString();
} else {
  start = dayjs(selectedDate).startOf("day").toISOString();
  end = dayjs(selectedDate).endOf("day").toISOString();
}

params.startDateTime = start;
params.endDateTime = end;

    // paginação
    params.page = page;
    params.size = size;

    const data = await getAppointments(params);

    // ✅ quando vem paginado (Spring Page)
    if (data && Array.isArray(data.content)) {
      setAppointments(data.content);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(data.totalElements ?? 0);
    } else {
      // fallback (se algum dia vier lista)
      setAppointments(data ?? []);
      setTotalPages(1);
      setTotalElements((data ?? []).length);
    }
  } catch (err) {
    showSnackbar("Erro ao carregar agendamentos", "error");
  } finally {
    setLoading(false);
  }
};

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch {
      showSnackbar("Erro ao carregar clientes", "error");
    }
  };

 useEffect(() => {
  loadClients();
}, []);

useEffect(() => {
  setPage((prev) => (prev === 0 ? prev : 0));
}, [selectedDate, filterClient, filterStatus, rangeStart, rangeEnd]);

useEffect(() => {
  loadAppointments();
}, [page, size, selectedDate, filterClient, filterStatus, rangeStart, rangeEnd]);


useEffect(() => {
  if (!(open && selectedDate)) return;

  let cancelled = false;

  const loadSlots = async () => {
    try {
      setLoadingSlots(true);
      const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
      if (!user?.id) return;

      const slots = await getAvailability(user.id, formattedDate);

      let enhancedSlots = slots;
      let keepCurrentTime = false;

      if (editingId && formData.dateTime) {
        const originalDate = dayjs(formData.dateTime).startOf("day");
        const selected = dayjs(selectedDate).startOf("day");
        const sameDay = selected.isSame(originalDate, "day");

        if (sameDay) {
          const currentTime = dayjs(formData.dateTime).format("HH:mm");

          const exists = slots.some((slot) =>
            dayjs(slot).format("HH:mm") === currentTime
          );

          if (!exists) {
            const [hourStr, minuteStr] = currentTime.split(":");
            const currentDateTime = dayjs(selectedDate)
              .hour(Number(hourStr))
              .minute(Number(minuteStr))
              .second(0)
              .millisecond(0)
              .toISOString();

            enhancedSlots = [currentDateTime, ...slots];
          }

          keepCurrentTime = true;
        }
      }

      if (!cancelled) {
        setAvailableSlots(enhancedSlots);

        if (!keepCurrentTime) {
          setSelectedTime("");
        }
      }
    } catch (err) {
      if (!cancelled) {
        // 👇 LIMPA TUDO QUANDO DER ERRO
        setAvailableSlots([]);
        setSelectedTime("");

        const backendMsg = err.response?.data?.message || err.response?.data?.error || "";

        if (backendMsg.includes("No working period found")) {
          // dia sem disponibilidade
          showSnackbar("Nenhum horário disponível para este dia.", "warning");
        } else {
          showSnackbar("Erro ao carregar horários disponíveis", "error");
        }
      }
    } finally {
      if (!cancelled) setLoadingSlots(false);
    }
  };

  loadSlots();

  return () => {
    cancelled = true;
  };
}, [open, selectedDate, editingId, user?.id, formData.dateTime]);

 
  // ===== ACTIONS =====
  const handleCancel = (id) => {
    openConfirmDialog("Cancelar Agendamento", "Tem certeza que deseja cancelar este agendamento?", async () => {
      try {
        await cancelAppointment(id);
        await loadAppointments(); // mantém a page atual
        showSnackbar("Agendamento cancelado!");
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || "Erro inesperado";
        showSnackbar(translateError(msg), "error");
      }
    });
  };

  const handleDone = (id) => {
    openConfirmDialog("Concluir Agendamento", "Marcar este agendamento como concluído?", async () => {
      try {
        await doneAppointment(id);
        await loadAppointments(); // mantém a page atual
        showSnackbar("Agendamento concluído!");
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || "Erro inesperado";
        showSnackbar(translateError(msg), "error");
      }
    });
  };

  const handleNoShow = (id) => {
    openConfirmDialog("Não Compareceu", "Marcar este agendamento como 'Não compareceu'?", async () => {
      try {
        await noShowAppointment(id);
        await loadAppointments(); // mantém a page atual
        showSnackbar("Marcado como 'Não Compareceu'.");
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.error || "Erro inesperado";
        showSnackbar(translateError(msg), "error");
      }
    });
  };

   const handleCreate = async () => {
  try {
    if (!selectedTime) {
      showSnackbar("Selecione um horário disponível!", "warning");
      return;
    }

    const fullDateTime = dayjs(selectedDate)
      .hour(selectedTime.split(":")[0])
      .minute(selectedTime.split(":")[1])
      .second(0)
      .millisecond(0)
      .toISOString();

    const payload = {
      ...formData,
      clientId: Number(formData.clientId),
      dateTime: fullDateTime,
    };

    await createAppointment(payload);

    updatingRef.current = true;

    const newDate = dayjs(fullDateTime).startOf("day");
    setSelectedDate(newDate);

    setPage(0);

    lastDateRef.current = newDate;
    setTimeout(() => (updatingRef.current = false), 300);

    setOpen(false);
    setFormData({ title: "", description: "", dateTime: "", clientId: "" });
    setSelectedTime("");
    setAvailableSlots([]);
    setFieldErrors({});
    showSnackbar("Agendamento criado com sucesso!");
  } catch (err) {
    const data = err.response?.data;
    if (data?.errors && Array.isArray(data.errors)) {
      const newErrors = {};
      data.errors.forEach((e) => {
        if (e.fieldName && e.message)
          newErrors[e.fieldName] = translateError(e.message);
      });
      setFieldErrors(newErrors);
    } else {
      const msg = data?.message || data?.error || "Erro inesperado";
      showSnackbar(translateError(msg), "error");
    }
  }
};

const handleEditOpen = (appointment) => {
  document.activeElement?.blur();

  setEditingId(appointment.id);

  const apptDate = dayjs(appointment.dateTime);

  setFormData({
    title: appointment.title || "",
    description: appointment.description || "",
    dateTime: appointment.dateTime || "",
    clientId: appointment.client?.id ? String(appointment.client.id) : "",
  });

  // dia e horário atuais do agendamento
  setSelectedDate(apptDate.startOf("day"));
  setSelectedTime(apptDate.format("HH:mm"));

  setFieldErrors({});
  setOpen(true);
};  

  const handleUpdate = async () => {
  try {
    if (!selectedTime) {
      showSnackbar("Informe o horário do agendamento!", "warning");
      return;
    }

    const [hourStr, minuteStr] = selectedTime.split(":");
    const fullDateTime = dayjs(selectedDate)
      .hour(Number(hourStr))
      .minute(Number(minuteStr))
      .second(0)
      .millisecond(0)
      .toISOString();

    const payload = {
      description: formData.description,
      dateTime: fullDateTime,
    };

    await updateAppointment(editingId, payload);

    setOpen(false);
    setEditingId(null);
    setFormData({ title: "", description: "", dateTime: "", clientId: "" });
    setFieldErrors({});
    setSelectedTime("");
    setAvailableSlots([]);

    reloadRef.current++;
    loadAppointments();
    showSnackbar("Agendamento atualizado com sucesso!");
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
      showSnackbar(translateError(msg), "error");
    }
  }
};

  function TransitionUp(props) {
  return <Slide {...props} direction="up" />;
  }


const filteredAppointments = useMemo(() => appointments, [appointments]);

const renderDay = useCallback(
  (day, _value, DayComponentProps) => {
    const hasAppointment = appointments.some((a) =>
      dayjs(a.dateTime).isSame(day, "day")
    );

    const isPast = day.isBefore(dayjs(), "day");
    const isOutsideMonth = day.month() !== selectedDate.month();

    return (
      <div style={{ position: "relative" }}>
        <PickersDay {...DayComponentProps} />
        {hasAppointment && !isOutsideMonth && (
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
  },
  [appointments] // ⬅️ remove o selectedDate daqui
);

// ===== Controle anti-loop do calendário =====
const changingDateRef = useRef(false);

useEffect(() => {
  if (changingDateRef.current) {
    const timeout = setTimeout(() => {
      changingDateRef.current = false;
    }, 150);
    return () => clearTimeout(timeout);
  }
}, [selectedDate]);

const columns = useMemo(() => [
  { Header: "Cliente", accessor: "client" },
  { Header: "Título", accessor: "title" },
  { Header: "Descrição", accessor: "description" },
  { Header: "Data/Horário", accessor: "dateTime" },
  { Header: "Status", accessor: "status" },
  { Header: "Ações", accessor: "actions", align: "center" },
], []);

const rows = useMemo(() => 
  filteredAppointments.map((a) => ({
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
    {a.canEdit && (
      <Tooltip title="Editar">
        <IconButton color="primary" size="small" onClick={() => handleEditOpen(a)}>
          <i className="material-icons">edit</i>
        </IconButton>
      </Tooltip>
    )}

    {a.canCancel && (
      <Tooltip title="Cancelar">
        <IconButton color="error" size="small" onClick={() => handleCancel(a.id)}>
          <i className="material-icons">close</i>
        </IconButton>
      </Tooltip>
    )}

    {a.canDone && (
      <Tooltip title="Concluir">
        <IconButton color="success" size="small" onClick={() => handleDone(a.id)}>
          <i className="material-icons">check</i>
        </IconButton>
      </Tooltip>
    )}

    {a.canNoShow && (
      <Tooltip title="Não Compareceu">
        <IconButton color="warning" size="small" onClick={() => handleNoShow(a.id)}>
          <i className="material-icons">block</i>
        </IconButton>
      </Tooltip>
    )}

    {!a.canEdit && !a.canCancel && !a.canDone && !a.canNoShow && (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    )}
  </MDBox>
),
  }))
, [filteredAppointments]);


  useEffect(() => {
  const weekLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

  const labels = document.querySelectorAll(".MuiDayCalendar-weekDayLabel");
  labels.forEach((el, index) => {
    el.innerHTML = weekLabels[index];
  });
});


const memoizedTable = useMemo(() => ({ columns, rows }), [columns, rows]);

// Capitalizar primeira letra do mês no header
useEffect(() => {
  const headerLabel = document.querySelector(".MuiPickersCalendarHeader-label");

  if (headerLabel) {
    const text = headerLabel.textContent;
    const capitalized = text.charAt(0).toUpperCase() + text.slice(1);
    headerLabel.textContent = capitalized;
  }
});

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
                color="primary"
                disableElevation
                sx={{
                  height: "40px",
                  color: "#fff",
                  backgroundColor: "#1A73E8",
                  "&:hover": { backgroundColor: "#1669c1" },
                  cursor: "pointer",
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

            {/* Card de Filtros */}
            
            <MDBox mb={3}>
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: 1,
      p: 2,
      backgroundColor: "#fff",
    }}
  >
    <Grid container spacing={2} alignItems="center">
      {/* Filtro por Cliente */}
      <Grid item xs={12} md={4}>
        <TextField
          select
          fullWidth
          size="small"
          label="Cliente"
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          InputLabelProps={{ shrink: true }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (value) => {
              if (!value) {
                return "Todos os clientes";
              }
              const selected = clients.find(
                (c) => String(c.id) === String(value)
              );
              return selected ? selected.name : "";
            },
          }}
        >
          <MenuItem value="">
            <em>Todos os clientes</em>
          </MenuItem>
          {clients.map((c) => (
            <MenuItem key={c.id} value={String(c.id)}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      {/* Filtro por Status */}
      <Grid item xs={12} md={4}>
        <TextField
          select
          fullWidth
          size="small"
          label="Status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          InputLabelProps={{ shrink: true }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (value) => {
              if (!value) {
                return "Todos os status";
              }
              switch (value) {
                case "SCHEDULED":
                  return "Agendado";
                case "CANCELED":
                  return "Cancelado";
                case "DONE":
                  return "Concluído";
                case "NO_SHOW":
                  return "Não Compareceu";
                default:
                  return "";
              }
            },
          }}
        >
          <MenuItem value="">
            <em>Todos os status</em>
          </MenuItem>
          <MenuItem value="SCHEDULED">Agendado</MenuItem>
          <MenuItem value="CANCELED">Cancelado</MenuItem>
          <MenuItem value="DONE">Concluído</MenuItem>
          <MenuItem value="NO_SHOW">Não Compareceu</MenuItem>
        </TextField>
      </Grid>

       {/* Range: Início */}
<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    size="small"
    type="date"
    label="Início"
    InputLabelProps={{ shrink: true }}
    value={rangeStart}
    onChange={(e) => setRangeStart(e.target.value)}
  />
</Grid>

{/* Range: Fim */}
<Grid item xs={12} md={4}>
  <TextField
    fullWidth
    size="small"
    type="date"
    label="Fim"
    InputLabelProps={{ shrink: true }}
    value={rangeEnd}
    onChange={(e) => setRangeEnd(e.target.value)}
  />
</Grid>

      {/* Botão Limpar */}
      <Grid
        item
        xs={12}
        md={4}
        sx={{
          display: "flex",
          justifyContent: { xs: "flex-start", md: "flex-end" },
          alignItems: "center",
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          onClick={() => {
            setFilterClient("");
            setFilterStatus("");
            setRangeStart("");
            setRangeEnd("");
          }}
        >
          Limpar filtros
        </Button>
      </Grid>
    </Grid>
  </Card>
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
   <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
  <DateCalendar
  value={selectedDate}
  onChange={(newDate) => {
  if (!newDate) return;

  const normalized = dayjs(newDate).startOf("day");
  const current = dayjs(selectedDate).startOf("day");

  if (normalized.isSame(current, "day")) return;
  if (updatingRef.current) return;

  // 👇 sair do modo range ao clicar no calendário
  setRangeStart("");
  setRangeEnd("");

  updatingRef.current = true;
  setSelectedDate(normalized);
  requestAnimationFrame(() => {
    updatingRef.current = false;
  });
}}
 slots={{
  day: (dayProps) => renderDay(dayProps.day, dayProps.value, dayProps),
}}
  sx={{
    width: "100%",
    maxWidth: 360,
    "& .MuiPickersDay-root.Mui-selected": {
      backgroundColor: "#1A73E8",
      color: "#fff",
      "&:hover": { backgroundColor: "#1669c1" },
    },
    "& .MuiPickersDay-today": {
      borderColor: "#1A73E8",
    },
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
     <MDBox>
    <DataTable
      table={memoizedTable}
      isSorted={false}
      entriesPerPage={false}
      showTotalEntries={false}
      noEndBorder
    />

    {/* Paginação */}
    {/* Paginação */}
<MDBox
  mt={2}
  display="flex"
  justifyContent="space-between"
  alignItems="center"
  flexWrap="wrap"
  gap={1}
>
  <Typography variant="button" color="text.secondary">
    {totalElements === 0
      ? "Nenhum registro"
      : `Mostrando ${from}-${to} de ${totalElements} • Página ${page + 1} de ${totalPages}`}
  </Typography>

  <MDBox display="flex" gap={1} alignItems="center">
    <Button
      variant="outlined"
      disabled={page <= 0}
      onClick={() => setPage((p) => Math.max(0, p - 1))}
    >
      Anterior
    </Button>

    <Button
      variant="outlined"
      disabled={totalPages === 0 || page >= totalPages - 1}
      onClick={() => setPage((p) => p + 1)}
    >
      Próxima
    </Button>

    {/* Só mostra quando fizer sentido */}
    {totalElements > 10 && (
      <TextField
        select
        size="small"
        label="Por página"
        value={size}
        onChange={(e) => setSize(Number(e.target.value))}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 140 }}
      >
        <MenuItem value={5}>5</MenuItem>
        <MenuItem value={10}>10</MenuItem>
        <MenuItem value={20}>20</MenuItem>
        <MenuItem value={50}>50</MenuItem>
      </TextField>
    )}
  </MDBox>
</MDBox>

  </MDBox>
)}
</MDBox>

              </MDBox>
            )}
          </CardContent>
        </Card>
        
        {/* Modal Criar/Editar */}
  <Dialog
  open={open}
  onClose={handleCloseModal}
  fullWidth
  maxWidth="sm"
  sx={{
    "& .MuiDialog-paper": {
      display: "flex",
      flexDirection: "column",
      alignItems: "stretch",
      p: 0,
    },
  }}
>
  <DialogTitle sx={{ fontWeight: "bold" }}>
    {editingId ? "Editar Agendamento" : "Novo Agendamento"}
  </DialogTitle>

 <DialogContent
  sx={{
    pt: 2,
    pb: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: 2,
    overflow: "visible !important", // 👈 garante que o conteúdo não force rolagem
    "& .MuiFormControl-root": {
      width: "100%",
    },
  }}
>

  {/* Campo Título */}
  <TextField
    fullWidth
    label="Título"
    value={formData.title}
    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
    error={!!fieldErrors.title}
    helperText={fieldErrors.title}
    disabled={!!editingId}
  />

  {/* Campo Descrição */}
  <TextField
    fullWidth
    label="Descrição"
    multiline
    minRows={3}
    value={formData.description}
    onChange={(e) =>
      setFormData({ ...formData, description: e.target.value })
    }
    error={!!fieldErrors.description}
    helperText={fieldErrors.description}
  />

{editingId && (
  <TextField
    select
    fullWidth
    label="Horário"
    value={selectedTime}
    onChange={(e) => setSelectedTime(e.target.value)}
  >
    {availableSlots.map((slot) => {
      const time = dayjs(slot).format("HH:mm");
      return (
        <MenuItem key={slot} value={time}>
          {time}
        </MenuItem>
      );
    })}
  </TextField>
)}
 
 <TextField
  fullWidth
  type="date"
  label="Data"
  InputLabelProps={{ shrink: true }}
  value={dayjs(selectedDate).format("YYYY-MM-DD")}
  onChange={(e) => setSelectedDate(dayjs(e.target.value))}
  sx={{ mt: 1 }}
/>

  {/* Horários disponíveis */}
  {!editingId && (
    <>
      <Typography
        variant="subtitle1"
        sx={{
          mb: 1,
          mt: 0.5,
          fontWeight: 500,
          color: "text.primary",
        }}
      >
        Horários disponíveis
      </Typography>

      {loadingSlots ? (
        <MDBox display="flex" justifyContent="center" alignItems="center" py={2}>
          <CircularProgress size={24} />
        </MDBox>
      ) : availableSlots.length === 0 ? (
        <Typography
          color="text.secondary"
          fontStyle="italic"
          textAlign="center"
          sx={{ py: 1 }}
        >
          Nenhum horário disponível neste dia
        </Typography>
      ) : (
       <MDBox
  display="flex"
  flexWrap="wrap"
  gap={1}
  justifyContent="flex-start"
  sx={{
    backgroundColor: "#f9f9f9",
    borderRadius: 2,
    p: 1.5,
    minHeight: 46,
    mt: 1, // espaço pequeno acima
    mb: 3, // 👈 mais espaço abaixo dos horários
  }}
>
          {availableSlots.map((slot) => {
            const time = dayjs(slot).format("HH:mm");
            const isSelected = selectedTime === time;
            return (
              <Button
                key={slot}
                variant={isSelected ? "contained" : "outlined"}
                color={isSelected ? "primary" : "inherit"}
                onClick={() => setSelectedTime(time)}
                sx={{
                  minWidth: 80,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  px: 1.5,
                  py: 0.7,
                }}
              >
                {time}
              </Button>
            );
          })}
        </MDBox>
      )}
    </>
  )}

  {/* Campo Cliente */}
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
  sx={{ mt: 2 }} // 👈 espaçamento extra acima do campo
>
  {clients.map((c) => (
    <MenuItem key={c.id} value={String(c.id)}>
      {c.name}
    </MenuItem>
  ))}
</TextField>
</DialogContent>


  <DialogActions sx={{ pr: 3, pb: 2 }}>
    <Button onClick={handleCloseModal}>Cancelar</Button>   {/* 👈 substitui aqui também */}
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


        {/* Dialog de Confirmação */}
        <Dialog open={confirmDialog.open} onClose={handleConfirmClose}>
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <Typography>{confirmDialog.message}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmClose}>Não</Button>
            <Button
              onClick={() => {
                confirmDialog.onConfirm?.();
                handleConfirmClose();
              }}
              color="primary"
              variant="contained"
            >
              Sim
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          TransitionComponent={TransitionUp}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert> 
        </Snackbar>
      </MDBox>
    </ThemeProvider>
  );
}

export default AppointmentsTable;
