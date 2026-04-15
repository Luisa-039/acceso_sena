import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import Auth_salidaEditModal from "@/components/auth_salida/auth_salida_edit";
import Auth_salidaCreateModal from "@/components/auth_salida/auth_salida_create";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";
import { exportToCSV, exportToExcel, exportToPDF, formatDateTime } from "@/utils/exportUtils";
import MDInput from "@/components/MDInput";
import MenuItem from "@mui/material/MenuItem";
import { alerts } from "@/hooks/alerts";
import { useSede } from "@/context/sedeContext";
function Auth_salida() {
  const [auth_salida, setAuth_salida] = useState([]);
  const [selectedAuth_salida, setSelectedAuth_salida] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exportFormat, setExportFormat] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.AUTORIZACION_SALIDA);
  const { effectiveSedeId } = useSede();
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canSelect = isAdmin || permisos.seleccionar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;


  const fetchAuth_salida = async () => {
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

    const res = await apiFetch(`autorizacion_salida/paginated?${params.toString()}`)
    setAuth_salida(res.auth_salida || []);
    setTotal(res.total_auth_salida || 0);
  }

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

  useEffect(() => {
    fetchAuth_salida();
  }, [page, pageSize, searchTerm, effectiveSedeId, canSelect]);

  const handleSearchAuthSalida = (value) => {
    setPage(0);
    setSearchTerm(value);
  };

  //fución para cambiar el estado
  async function handleToggleEstado(auth_salida) {
    if (!canChangeState) return;
    if (auth_salida.estado) return;

    const nuevoEstado = true;
    const now = new Date();
    const fecha_actual =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");
    try {
      await apiFetch(`autorizacion_salida/${auth_salida.id_autorizacion}/estado?nuevo_estado`, {
        method: "PUT",
        body: {
          estado: nuevoEstado,
          fecha_movimiento: fecha_actual
        }
      });

      setAuth_salida(auth_salidas =>
        auth_salidas.map(a =>
          a.id_autorizacion === auth_salida.id_autorizacion
            ? { ...a, estado: nuevoEstado }
            : a
        )
      );
      fetchAuth_salida();
    } catch (error) {
      alerts.error("No se pudo actualizar el estado");
    }
  }
  

  async function handleCreate_authSalida(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`autorizacion_salida/create`, {
        method: "POST",
        body: data,
      });
      fetchAuth_salida();
      setOpenCreate(false);
      alerts.success("Autorización de salida creado con éxito");

    } catch (error) {
      alerts.error(error?.detail || "Error al crear la autorización de salida");
    }
  }

  //Función para actualizar equipo
  async function handleUpdateAuth_salida(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `autorizacion_salida/${selectedAuth_salida.id_autorizacion}`,
        {
          method: "PUT",
          body: data,
        }
      );
      setAuth_salida(equipo =>
        equipo.map(e =>
          e.id_autorizacion === selectedAuth_salida.id_autorizacion
            ? { ...e, ...data }
            : e
        )
      );

      if (response) {
        alerts.success("Equipo actualizado con exito");
        fetchAuth_salida();
        setSelectedAuth_salida(null);
      }

    } catch (error) {
      console.error(error);
      alerts.error("Error al actualizar el equipo");
    }
  }

  const getEditButtonStyle = (activo) => ({
    color: activo ? "success.main" : "error.main",
    minWidth: "80px",
    fontWeight: 600,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: activo ? "success.main" : "error.main",
      color: "#fff",
    }
  });

  const columns = [
    { header: "Autorizado por", accessorKey: "nom_user_auth" },
    { header: "Tipo equipo", accessorKey: "t_equipo" },
    { header: "N. serie", accessorKey: "serie_eq" },
    { header: "Destino", accessorKey: "destino_eq" },
    { header: "Motivo", accessorKey: "motivo_salida",
      cell: (info) => (
        <div style={{
          whiteSpace: "normal",
          wordBreak: "break-word",
          maxWidth: "200px"
        }}>
          {info.getValue()}
        </div>
      )
    },
    { header: "Fecha autorizacion", accessorKey: "fecha_autorizacion" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const auth_salida = info.row.original.auth_salida;

        if (!canChangeState) {
          return value ? "Autorizado" : "Pendiente";
        }

        return (
          <MDButton
            variant="text"
            size="small"
            disabled={value}
            onClick={() => handleToggleEstado(auth_salida)}
            sx={{
              ...getEditButtonStyle(value),
              ...(value
                ? {
                    opacity: 0.7,
                    cursor: "not-allowed",
                    "&:hover": {
                      backgroundColor: "transparent",
                      color: "success.main",
                    },
                  }
                : {}),
            }}
          >
            {value ? "Autorizado" : "Pendiente"}
          </MDButton>
        );
      }
    },
    ...(canUpdate
      ? [
          {
            id: "acciones",
            header: "Acciones",
            cell: ({ row }) => (
              <MDButton
                variant="text"
                size="small"
                sx={getEditButtonStyle}
                onClick={() => setSelectedAuth_salida(row.original.auth_salida)}
              >
                Editar
              </MDButton>
            ),
          },
        ]
      : [])
  ];

  const rows = auth_salida.map((auth_salida) => ({
    nom_user_auth: auth_salida.nombre_usuario,
    t_equipo: auth_salida.nombre_categoria,
    motivo_auth: auth_salida.motivo,
    serie_eq: auth_salida.serial,
    destino_eq: auth_salida.destino,
    motivo_salida: auth_salida.motivo,
    estado: (auth_salida.estado),
    fecha_autorizacion: formatearFecha(auth_salida.fecha_autorizacion),
    auth_salida
  }));

  const exportColumns = [
    { header: "Autorizado por", key: "nombre_usuario" },
    { header: "Tipo equipo", key: "nombre_categoria" },
    { header: "N. serie", key: "serial" },
    { header: "Destino", key: "destino" },
    { header: "Motivo", key: "motivo" },
    {
      header: "Estado",
      key: (row) => (row.estado ? "Autorizado" : "Pendiente"),
    },
    { header: "Fecha autorizacion", key: "fecha_autorizacion", format: formatDateTime },
  ];

  const handleExport = (format) => {
    const dateTag = new Date().toISOString().slice(0, 10);

    if (!auth_salida.length) {
      alerts.warning("No hay datos para exportar");
      return;
    }

    try {
      if (format === "csv") {
        exportToCSV(auth_salida, exportColumns, `autorizacion_salida_${dateTag}.csv`);
        return;
      }

      if (format === "excel") {
        exportToExcel(auth_salida, exportColumns, `autorizacion_salida_${dateTag}.xlsx`);
        return;
      }

      exportToPDF(
        auth_salida,
        exportColumns,
        `autorizacion_salida_${dateTag}.pdf`,
        "Reporte de Autorización de Salida"
      );
    } catch (error) {
      console.error("Error exportando autorización de salida:", error);
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
            <MDTypography variant="h3">Autorización salida</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchAuthSalida}
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
              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}>
                    Registrar autorización
                  </MDButton>
                ) : null
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
        <Dialog open={openCreate && canInsert} onClose={() => setOpenCreate(false)}>
          <MDBox p={3}>
            <Auth_salidaCreateModal
              onSave={(data) => {
                handleCreate_authSalida(data);
              }}
              onCancel={() => setOpenCreate(false)}
            />
          </MDBox>
        </Dialog>
        <Dialog open={Boolean(selectedAuth_salida) && canUpdate} onClose={() => setSelectedAuth_salida(null)}>
          <MDBox p={3}>
            <Auth_salidaEditModal
              onSave={handleUpdateAuth_salida}
              onCancel={() => { setSelectedAuth_salida(null) }}
              auth_salida={selectedAuth_salida}
            />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Auth_salida;
