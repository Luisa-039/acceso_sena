import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import MDInput from "@/components/MDInput";
import MenuItem from "@mui/material/MenuItem";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";
import { exportToCSV, exportToExcel, exportToPDF, formatDateTime } from "@/utils/exportUtils";
import { alerts } from "@/hooks/alerts";
import { useSede } from "@/context/sedeContext";


function movements() {
  const [movements, setMovements] = useState([]);
  const [movementHistory, setMovementHistory] = useState([]);
  const [selectedHistoryMovement, setSelectedHistoryMovement] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [exportFormat, setExportFormat] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.MOVIMIENTO_EQUIPOS);
  const { effectiveSedeId } = useSede();
  const canUpdate = isAdmin || permisos.actualizar;
  const canSelect = isAdmin || permisos.seleccionar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;

  const isDadoDeBaja = (estado = "") =>
    String(estado).trim().toLowerCase().replaceAll("_", " ") === "dado de baja";

  const getLocalDateTimeString = () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  };

  const fetchMovementTypes = async () => {
    try {
      const res = await apiFetch(`type/all-movements-types`);
      setTiposMovimiento(res);
    } catch (error) {
      console.error("Error al traer tipos de movimiento:", error);
    }
  }

  const fetchMovements = async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      page_size: String(pageSize),
    });

    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    if (effectiveSedeId) {
      params.append("sede_id", String(effectiveSedeId));
    }

    const res = await apiFetch(`movements/paginated?${params.toString()}`)
    setMovements(res.movements || []);
    setTotal(res.total_movements || 0);
  }

  const fetchMovementHistory = async (autorizacionId) => {
    if (!autorizacionId) return;

    const res = await apiFetch(`movements/historial/${autorizacionId}`);
    setMovementHistory(Array.isArray(res) ? res : []);
  };

  useEffect(() => {
    fetchMovementTypes();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [page, pageSize, searchTerm, effectiveSedeId, canSelect]);

  const handleSearchMovements = (value) => {
    setPage(0);
    setSearchTerm(value);
  };

  async function handleToggleEstado(movement, nombreMovimiento) {
    if (!canChangeState) return;

    try {
      // Buscar el ID del tipo de movimiento
      const tipoSeleccionado = tiposMovimiento.find(tipo => tipo.nombre_tipo === nombreMovimiento);
      const idTipo = tipoSeleccionado?.id_tipo;

      if (!idTipo) {
        alerts.warning("Tipo de movimiento no válido");
        return;
      }

      await apiFetch(`movements/by-id/${movement.id_movimiento_sede}`, {
        method: "PUT",
        body: {
          tipo_id: idTipo,
          fecha_movimiento: getLocalDateTimeString(),
        },
      });

      await fetchMovements();
      if (openHistory && selectedHistoryMovement?.autorizacion_id === movement.autorizacion_id) {
        await fetchMovementHistory(movement.autorizacion_id);
      }
    } catch (error) {
      const detail = String(error?.detail || "");
      if (detail) {
        alerts.warning(detail);
        return;
      }
      alerts.error("No se pudo actualizar el estado");
    }
  }

  const handleOpenHistory = async (movement) => {
    if (!movement?.autorizacion_id) {
      alerts.warning("Este movimiento no tiene autorización asociada");
      return;
    }

    setSelectedHistoryMovement(movement);
    setOpenHistory(true);
    try {
      await fetchMovementHistory(movement.autorizacion_id);
    } catch (error) {
      alerts.error("No se pudo cargar el historial");
    }
  };

  const handleCloseHistory = () => {
    setOpenHistory(false);
    setSelectedHistoryMovement(null);
    setMovementHistory([]);
  };

  const estadoStyles = {
    Entrada: "success.main",
    Traslado: "warning.main",
    Salida: "error.main",
  };

  const getEstadoStyle = (estado) => ({
    minWidth: "120px",

    "& .MuiInputBase-root": {
      borderRadius: "18px",
      color: estadoStyles[estado],
      fontWeight: 600,
    },

    "& .MuiOutlinedInput-notchedOutline": {
      border: "none",
    },

    "& .MuiSelect-select": {
      color: estadoStyles[estado],
    },

    "&:hover .MuiSelect-select": {
      backgroundColor: estadoStyles[estado],
      color: "#fff",
    }
  });


  const columns = [
    { header: "Autorización N.", accessorKey: "auth_id" },
    { header: "Tipo equipo", accessorKey: "c_equipo" },
    { header: "N. serie", accessorKey: "serie_eq" },
    {
      header: "Movimiento", accessorKey: "tipo_id",
      cell: (info) => {
        const value = info.getValue();
        const movement = info.row.original.movements;

        if (!canChangeState) {
          return (
            <MDTypography
              variant="caption"
              sx={{
                color: estadoStyles[value] || "text.primary",
                fontWeight: 600,
              }}
            >
              {value}
            </MDTypography>
          );
        }

        return (
          <MDInput
            select
            value={value || ""}
            size="small"
            disabled={isDadoDeBaja(value)}
            onChange={(e) => handleToggleEstado(movement, e.target.value)}
            sx={getEstadoStyle(value)}
          >
            {tiposMovimiento.map((tipo) => (
              <MenuItem key={tipo.id_tipo} value={tipo.nombre_tipo}>
                {tipo.nombre_tipo}
              </MenuItem>
            ))}
          </MDInput>
        );
      }
    },
    { header: "Registrado por", accessorKey: "user_registra" },
    { header: "Fecha movimiento", accessorKey: "fecha_movimiento" },
    {
      id: "historial",
      header: "Historial",
      cell: ({ row }) => (
        <MDButton
          variant="text"
          size="small"
          color="info"
          onClick={() => handleOpenHistory(row.original.movements)}
        >
          Ver historial
        </MDButton>
      ),
    },
  ];

  const formatearFecha = (fechaString) => {
    const fecha = new Date(fechaString);

    return fecha.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const rows = movements.map((movements) => ({
    auth_id: movements.autorizacion_id,
    serie_eq: movements.serial_equipo,
    c_equipo: movements.nombre_categoria,
    tipo_id: movements.nombre_tipo,
    user_registra: movements.nombre_usuario,
    fecha_movimiento: formatearFecha(movements.fecha_movimiento),
    movements
  }));

  const exportColumns = [
    { header: "Autorización N.", key: "autorizacion_id" },
    { header: "Tipo equipo", key: "nombre_categoria" },
    { header: "N. serie", key: "serial_equipo" },
    { header: "Movimiento", key: "nombre_tipo" },
    { header: "Registrado por", key: "nombre_usuario" },
    { header: "Fecha movimiento", key: "fecha_movimiento", format: formatDateTime },
  ];

  const handleExport = (format) => {
    const dateTag = new Date().toISOString().slice(0, 10);

    if (!movements.length) {
      alerts.warning("No hay datos para exportar");
      return;
    }

    try {
      if (format === "csv") {
        exportToCSV(movements, exportColumns, `movimientos_${dateTag}.csv`);
        return;
      }

      if (format === "excel") {
        exportToExcel(movements, exportColumns, `movimientos_${dateTag}.xlsx`);
        return;
      }

      exportToPDF(movements, exportColumns, `movimientos_${dateTag}.pdf`, "Reporte de Movimientos");
    } catch (error) {
      console.error("Error exportando movimientos:", error);
      alerts.error("No se pudo generar el archivo de exportación");
    }
  };

  const handleExportSelect = (event) => {
    const format = event.target.value;
    setExportFormat(format);
    if (format) {
      handleExport(format);
      setExportFormat("");
    }
  };

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Historial de equipos</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchMovements}
              searchActions={
                <MDInput
                  select
                  value={exportFormat}
                  onChange={handleExportSelect}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (selected) => (selected ? String(selected).toUpperCase() : "Exportar"),
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          borderRadius: 2,
                          mt: 1,
                        },
                      },
                    },
                  }}
                  sx={{
                    minWidth: 160,
                    maxWidth: 220,
                    "& .MuiInputBase-root": {
                      height: 40,
                      borderRadius: "10px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      backgroundColor: "#ffffff",
                      color: "#002f87",
                      "&:hover": {
                        backgroundColor: "#00347b",
                        "& .MuiSelect-select": {
                          color: "#ffffff",
                        },
                      },
                    },
                    "& .MuiSelect-select": {
                      color: "#071d89",
                      pr: 4,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ffffff",
                    },
                  }}
                >
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                </MDInput>
              }
              pagination={{
                manual: true,
                page, pageSize,
                total, onPageChange: setPage,
              }}
              showTotalEntries
            />
          </MDBox>
        </Card>
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        </Dialog>
        <Dialog open={openHistory} onClose={handleCloseHistory} fullWidth maxWidth="md">
          <DialogTitle>
            Historial de movimiento
            <MDTypography variant="body2" color="text.secondary">
              {selectedHistoryMovement ? `Autorización #${selectedHistoryMovement.autorizacion_id} | Equipo ${selectedHistoryMovement.serial_equipo}` : ""}
            </MDTypography>
          </DialogTitle>
          <DialogContent dividers>
            {movementHistory.length ? (
              movementHistory.map((item, index) => (
                <MDBox key={item.id_movimiento_sede} mb={index === movementHistory.length - 1 ? 0 : 2}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <MDTypography variant="subtitle2">{item.nombre_tipo}</MDTypography>
                    <MDTypography variant="caption" color="text.secondary">
                      {formatearFecha(item.fecha_movimiento)}
                    </MDTypography>
                  </MDBox>
                  <MDTypography variant="body2" color="text.secondary">
                    Registrado por: {item.nombre_usuario}
                  </MDTypography>
                  <Divider sx={{ mt: 1.5 }} />
                </MDBox>
              ))
            ) : (
              <MDTypography variant="body2" color="text.secondary">
                No hay movimientos registrados para esta autorización.
              </MDTypography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseHistory}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default movements;
