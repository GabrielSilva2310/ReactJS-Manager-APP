import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, IconButton, Stack, TextField, Button, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import DataTable from "examples/Tables/DataTable"; // seu componente atual

import {
  getClientsPage,
  createClient,
  updateClient,
  deleteClient,
} from "services/clients";

import ClientFormDialog from "./components/ClientFormDialog";

export default function Clients() {
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        name: search || undefined, // ajuste pro nome do param no back (q, search, name...)
      };

      const data = await getClientsPage(params);
      
      // Esperado: { content, totalElements } (padrão Spring)
      setRows(data.content ?? []);
      setTotalElements(data.totalElements ?? 0);
    } catch (e) {
      console.error(e);
      // se você já usa toast/snackbar no projeto, encaixa aqui
      alert("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [page, size, search]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Sempre que mudar a busca, volta pra página 0 (igual agendamentos)
  useEffect(() => {
    setPage((prev) => (prev === 0 ? prev : 0));
  }, [search]);

  function openCreate() {
    setEditingClient(null);
    setDialogOpen(true);
  }

  function openEdit(client) {
    setEditingClient(client);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingClient(null);
  }

  async function handleSubmit(form) {
    setLoading(true);
    try {
      if (editingClient?.id) {
        await updateClient(editingClient.id, form);
      } else {
        await createClient(form);
      }
      closeDialog();
      await loadClients();
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar cliente");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(client) {
    const ok = window.confirm(`Excluir "${client.name}"?`);
    if (!ok) return;

    setLoading(true);
    try {
      await deleteClient(client.id);
      await loadClients();
    } catch (e) {
      console.error(e);
      alert("Erro ao excluir cliente");
    } finally {
      setLoading(false);
    }
  }

  const columns = useMemo(
    () => [
      { Header: "Nome", accessor: "name", align: "left" },
      { Header: "E-mail", accessor: "email", align: "left" },
      { Header: "Telefone", accessor: "phone", align: "left" },
      {
        Header: "Ações",
        accessor: "actions",
        align: "center",
        Cell: ({ row }) => {
          const client = row.original;
          return (
            <Stack direction="row" spacing={1} justifyContent="center">
              <Tooltip title="Editar">
                <span>
                  <IconButton size="small" onClick={() => openEdit(client)} disabled={loading}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Excluir">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(client)}
                    disabled={loading}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          );
        },
      },
    ],
    [loading]
  );

  // DataTable geralmente quer { columns, rows }
  const tableData = useMemo(() => ({ columns, rows }), [columns, rows]);

  return (
    <Box sx={{ p: 2 }}>
      {/* Cabeçalho + ações */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <TextField
          label="Buscar cliente"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ maxWidth: 420, width: "100%" }}
          disabled={loading}
        />

        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={loading}>
          Novo cliente
        </Button>
      </Stack>

      <DataTable
        table={tableData}
        isSorted={false}
        entriesPerPage={false}  // se seu DataTable tiver paginação própria, a gente ajusta depois
        showTotalEntries={false}
        noEndBorder
        canSearch={false}
      />

      {/* Paginação simples (se seu DataTable já tiver, me fala que encaixamos nele) */}
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={loading || page === 0}
        >
          Anterior
        </Button>
        <Box>
          Página {page + 1} ({totalElements} registros)
        </Box>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={loading || (page + 1) * size >= totalElements}
        >
          Próxima
        </Button>

        <TextField
          label="Por página"
          size="small"
          type="number"
          value={size}
          onChange={(e) => setSize(Math.max(1, Number(e.target.value || 10)))}
          sx={{ width: 140 }}
          disabled={loading}
        />
      </Stack>

      <ClientFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSubmit={handleSubmit}
        loading={loading}
        initialData={editingClient}
      />
    </Box>
  );
}
