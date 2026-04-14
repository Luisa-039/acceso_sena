import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";

import DataTable from "@/examples/Tables/DataTable";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import MDInput from "@/components/MDInput";
import MenuItem from "@mui/material/MenuItem";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";
import { alerts } from "@/hooks/alerts";
import { useSede } from "@/context/sedeContext";


function movements() {
  const [movements, setMovements] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.MOVIMIENTO_EQUIPOS);
  const { effectiveSedeId } = useSede();
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;

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

  useEffect(() => {
    fetchMovementTypes();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [page, pageSize, searchTerm]);

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
        body: { tipo_id: idTipo },
      });

      setMovements(prev =>
        prev.map(m =>
          m.id_movimiento_sede === movement.id_movimiento_sede
            ? { ...m, nombre_tipo: nombreMovimiento }
            : m
        )
      );
      //fetchMovements();
    } catch (error) {
      alerts.error("No se pudo actualizar el estado");
    }
  }

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

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Movimientos</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchMovements}
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
      </MDBox>
    </MDBox>
  );
}

export default movements;
