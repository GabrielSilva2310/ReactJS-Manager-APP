import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  IconButton,
  TextField,
  Button,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import DataTable from "examples/Tables/DataTable";
import MDBox from "components/MDBox";

import { getClientsPage, createClient, updateClient, deleteClient } from "services/clients";
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

  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);
  const [totalPages, setTotalPages] = useState(0);

  

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        name: search || undefined, // ajuste pro param do back
      };

      const data = await getClientsPage(params); // ✅ deve retornar Page (com content)
      setRows(data.content ?? []);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (e) {
      console.error(e);
      alert("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }, [page, size, search]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

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
            <MDBox display="flex" justifyContent="center" gap={0.5}>
              <Tooltip title="Editar">
                <span>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => openEdit(client)}
                    disabled={loading}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Excluir">
                <span>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDelete(client)}
                    disabled={loading}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </MDBox>
          );
        },
      },
    ],
    [loading]
  );

  const tableData = useMemo(() => ({ columns, rows }), [columns, rows]);

  return (
    <MDBox pt={3} pb={3} px={2} ml={{ xs: 0, lg: 30 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
        <CardContent>
          {/* Header igual appointments */}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold">
              Clientes
            </Typography>

            <Button
              variant="contained"
              disableElevation
              startIcon={<AddIcon />}
              onClick={openCreate}
              disabled={loading}
              sx={{
                height: "40px",
                color: "#fff",
                backgroundColor: "#1A73E8",
                "&:hover": { backgroundColor: "#1669c1" },
              }}
            >
              Novo cliente
            </Button>
          </MDBox>

          {/* Card de filtro (mesmo estilo do appointments) */}
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
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Buscar cliente"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    InputLabelProps={{ shrink: true }}
                    disabled={loading}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
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
                      setSearch("");
                      setPage(0);
                    }}
                    disabled={loading || !search}
                  >
                    Limpar
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </MDBox>

          {/* Tabela + paginação no padrão */}
          <MDBox sx={{ width: "100%", overflowX: "auto" }}>
            <DataTable
              table={tableData}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
              pagination={false}
              noEndBorder
              canSearch={false}
            />

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
                  : `Mostrando ${from}-${to} de ${totalElements} • Página ${page + 1} de ${Math.max(
                      1,
                      totalPages
                    )}`}
              </Typography>

              <MDBox display="flex" gap={1} alignItems="center">

    <Button
  variant="outlined"
  disabled={loading || page <= 0}
  onClick={() => setPage((p) => Math.max(0, p - 1))}
  sx={{
    height: 36,
    minWidth: 110,
    color: "primary.main",
    borderColor: "primary.main",
    "&:hover": {
      borderColor: "primary.dark",
      backgroundColor: "action.hover",
    },
  }}
>
  Anterior
</Button>

<Button
  variant="outlined"
  disabled={loading || totalPages === 0 || page >= totalPages - 1}
  onClick={() => setPage((p) => p + 1)}
  sx={{
    height: 36,
    minWidth: 110,
    color: "primary.main",
    borderColor: "primary.main",
    "&:hover": {
      borderColor: "primary.dark",
      backgroundColor: "action.hover",
    },
  }}
>
  Próxima
</Button>
   


                {totalElements > size && (
  <TextField
    select
    size="small"
    label="Por página"
    value={size}
    onChange={(e) => {
      setSize(Number(e.target.value));
      setPage(0);
    }}
    InputLabelProps={{ shrink: true }}
    sx={{ width: 140 }}
    disabled={loading}
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

          <ClientFormDialog
            open={dialogOpen}
            onClose={closeDialog}
            onSubmit={handleSubmit}
            loading={loading}
            initialData={editingClient}
          />
        </CardContent>
      </Card>
    </MDBox>
  );
}
