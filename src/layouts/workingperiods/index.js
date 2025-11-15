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

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

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
const normalizeTime = (value) => {
  if (!value) return "";
  if (value.length >= 5) return value.slice(0, 5);
  return value;
};

function WorkingPeriods() {
  const [week, setWeek] = useState(initialWeek);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // carrega os working periods do usuário logado
  const loadWorkingPeriods = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getWorkingPeriods(0, 7);

      const content = Array.isArray(data.content) ? data.content : [];

      const mapped = initialWeek.map((day) => {
        const match = content.find((wp) => wp.dayOfWeek === day.key);

        if (!match) {
          // não existe período cadastrado nesse dia
          return {
            ...day,
            enabled: false,
            workingPeriodId: null,
          };
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
      console.error("Erro ao carregar períodos de trabalho:", error);
      alert("Erro ao carregar disponibilidade. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkingPeriods();
  }, [loadWorkingPeriods]);

  const handleToggleDay = (index) => {
    setWeek((prev) =>
      prev.map((day) =>
        day.index === index ? { ...day, enabled: !day.enabled } : day
      )
    );
  };

  const handleTimeChange = (index, field, value) => {
    setWeek((prev) =>
      prev.map((day) =>
        day.index === index ? { ...day, [field]: value } : day
      )
    );
  };

  const hasInvalidTimes = () => {
    for (const day of week) {
      if (day.enabled && day.startTime >= day.endTime) {
        alert(`Verifique os horários de ${day.label}: o início deve ser menor que o fim.`);
        return true;
      }
    }
    return false;
  };

  const handleReset = () => {
    // resetar para o que está no backend (último salvo)
    loadWorkingPeriods();
  };

  const handleSave = async () => {
    if (hasInvalidTimes()) return;

    try {
      setSaving(true);

      const promises = [];

      week.forEach((day) => {
        // ativado + sem id => criar
        if (day.enabled && !day.workingPeriodId) {
          const payload = {
            dayOfWeek: day.key,
            startTime: day.startTime,
            endTime: day.endTime,
          };
          promises.push(createWorkingPeriod(payload));
        }

        // ativado + com id => atualizar
        if (day.enabled && day.workingPeriodId) {
          const payload = {
            startTime: day.startTime,
            endTime: day.endTime,
          };
          promises.push(updateWorkingPeriod(day.workingPeriodId, payload));
        }

        // desativado + com id => deletar
        if (!day.enabled && day.workingPeriodId) {
          promises.push(deleteWorkingPeriod(day.workingPeriodId));
        }
      });

      await Promise.all(promises);
      await loadWorkingPeriods();

      alert("Disponibilidade salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar disponibilidade:", error);
      alert("Erro ao salvar disponibilidade. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Disponibilidade profissional
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Defina os dias e horários em que você atende. Essas informações serão usadas
            para montar os horários disponíveis no agendamento.
          </Typography>

          <Divider sx={{ my: 2 }} />

          {loading ? (
            <Typography>Carregando disponibilidade...</Typography>
          ) : (
            <Grid container spacing={2}>
              {week.map((day) => (
                <React.Fragment key={day.index}>
                  <Grid item xs={12} md={2} sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ mr: 1 }}>{day.label}</Typography>
                    <Switch
                      checked={day.enabled}
                      onChange={() => handleToggleDay(day.index)}
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Início"
                      type="time"
                      value={day.startTime}
                      onChange={(e) => handleTimeChange(day.index, "startTime", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      disabled={!day.enabled}
                    />
                  </Grid>

                  <Grid item xs={6} md={3}>
                    <TextField
                      fullWidth
                      label="Fim"
                      type="time"
                      value={day.endTime}
                      onChange={(e) => handleTimeChange(day.index, "endTime", e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 300 }}
                      disabled={!day.enabled}
                    />
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
          <Button onClick={handleReset} disabled={saving || loading}>
            Resetar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Salvando..." : "Salvar disponibilidade"}
          </Button>
        </CardActions>
      </Card>
      <Footer />
    </DashboardLayout>
  );
}

export default WorkingPeriods;