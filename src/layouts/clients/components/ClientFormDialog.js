import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Button,
} from "@mui/material";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  document: "",
};

export default function ClientFormDialog({
  open,
  onClose,
  onSubmit,
  loading,
  initialData,
}) {
  const isEdit = useMemo(() => !!initialData?.id, [initialData]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      setForm({
        name: initialData?.name ?? "",
        email: initialData?.email ?? "",
        phone: initialData?.phone ?? "",
        document: initialData?.document ?? "",
      });
    }
  }, [open, initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit() {
    // validação simples (mínimo)
    if (!form.name.trim()) return;
    onSubmit(form);
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Editar cliente" : "Novo cliente"}</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nome"
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
            required
            autoFocus
          />
          <TextField
            label="E-mail"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            label="Telefone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            disabled={loading}
          />
          <TextField
            label="Documento (CPF/CNPJ)"
            name="document"
            value={form.document}
            onChange={handleChange}
            disabled={loading}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !form.name.trim()}>
          {isEdit ? "Salvar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
