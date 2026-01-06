import React, { useEffect, useState, useCallback } from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";

import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

import {
  getWorkingPeriods,
  createWorkingPeriod,
  updateWorkingPeriod,
  deleteWorkingPeriod,
} from "services/workingPeriods";

// estrutura base: 1 linha por dia
const initialWeek = [
  { index: 1, label: "Seg", key: "MONDAY", enabled: false, startTime: "09:00", endTime: "18:00", workingPeriodId: null },
  { index: 2, label: "Ter", key: "TUESDAY", enabled: false, startTime: "09:00", endTime: "18:00", workingPeriodId: null },
  { index: 3, label: "Qua", key: "WEDNESDAY", enabled: false, startTime: "09:00", endTime: "18:00", workingPeriodId: null },
  { index: 4, label: "Qui", key: "THURSDAY", enabled: false, startTime: "09:00", endTime: "18:00", workingPeriodId: null },
  { index: 5, label: "Sex", key: "FRIDAY", enabled: false, startTime: "09:00", endTime: "18:00", workingPeriodId: null },
  { index: 6, label: "Sáb", key: "SATURDAY", enabled: false, startTime: "09:00", endTime: "13:00", workingPeriodId: null },
  { index: 7, label: "Dom", key: "SUNDAY", enabled: false, startTime: "09:00", endTime: "13:00", workingPeriodId: null },
];

// normaliza "09:00:00" -> "09:00"
const normalizeTime = (value) => (value && value.length >= 5 ? value.slice(0, 5) : value || "");

// ---- Componente visual para cada dia ----
function DayCard({ day, onToggle, onTimeChange }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: day.enabled ? "primary.main" : "divider",
        opacity: day.enabled ? 1 : 0.7,
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardContent sx={{ pb: 2 }}>
        {/* Header: nome do dia + switch */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
          <Typography variant="subtitle1" fontWeight={600}>
            {day.label}
          </Typography>

          <Box display="flex" alignItems="center" columnGap={1}>
            <Typography variant="caption">{day.enabled ? "Ativo" : "Inativo"}</Typography>
            <Switch size="small" checked={day.enabled} onChange={() => onToggle(day.index)} />
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Campos de horário */}
        <Grid container spacing={1}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Início"
              type="time"
              size="small"
              value={day.startTime}
              onChange={(e) => onTimeChange(day.index, "startTime", e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              disabled={!day.enabled}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Fim"
              type="time"
              size="small"
              value={day.endTime}
              onChange={(e) => onTimeChange(day.index, "endTime", e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              disabled={!day.enabled}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function WorkingPeriods() {
  const [week, setWeek] = useState(initialWeek);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // carrega dados do backend
  const loadWorkingPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getWorkingPeriods(0, 7);
      const content = Array.isArray(data.content) ? data.content : [];

      const mapped = initialWeek.map((day) => {
        const match = content.find((wp) => wp.dayOfWeek === day.key);

        if (!match) {
          return { ...day, enabled: false, workingPeriodId: null };
        }

        return {
          ...day,
          enabled: match.active ?? true,
          workingPeriodId: match.id,
          startTime: normalizeTime(match.startTime) || day.startTime,
          endTime: normalizeTime(match.endTime) || day.endTime,
        };
      });

      setWeek(mapped);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar disponibilidade.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkingPeriods();
  }, [loadWorkingPeriods]);

  const handleToggleDay = (index) => {
    setWeek((prev) => prev.map((d) => (d.index === index ? { ...d, enabled: !d.enabled } : d)));
  };

  const handleTimeChange = (index, field, value) => {
    setWeek((prev) => prev.map((d) => (d.index === index ? { ...d, [field]: value } : d)));
  };

  const hasInvalidTimes = () => {
    for (const day of week) {
      if (day.enabled && day.startTime >= day.endTime) {
        alert(`Verifique os horários de ${day.label}.`);
        return true;
      }
    }
    return false;
  };

  const handleSave = async () => {
    if (hasInvalidTimes()) return;

    try {
      setSaving(true);

      const promises = [];

      week.forEach((day) => {
        if (day.enabled && !day.workingPeriodId) {
          promises.push(createWorkingPeriod({ dayOfWeek: day.key, startTime: day.startTime, endTime: day.endTime }));
        }
        if (day.enabled && day.workingPeriodId) {
          promises.push(updateWorkingPeriod(day.workingPeriodId, { startTime: day.startTime, endTime: day.endTime }));
        }
        if (!day.enabled && day.workingPeriodId) {
          promises.push(deleteWorkingPeriod(day.workingPeriodId));
        }
      });

      await Promise.all(promises);
      await loadWorkingPeriods();

      alert("Disponibilidade salva com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar disponibilidade.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Disponibilidade profissional
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Defina seus dias e horários de atendimento.
                </Typography>

                <Divider sx={{ my: 2 }} />

                {loading ? (
                  <Typography>Carregando...</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {week.map((day) => (
                      <Grid item xs={12} sm={6} md={4} key={day.index}>
                        <DayCard day={day} onToggle={handleToggleDay} onTimeChange={handleTimeChange} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                <Button onClick={loadWorkingPeriods} disabled={saving || loading}>
                  Resetar
                </Button>

                <Button variant="contained" color="primary" onClick={handleSave} disabled={saving || loading}>
                  {saving ? "Salvando..." : "Salvar disponibilidade"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default WorkingPeriods;
