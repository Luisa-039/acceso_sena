import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import EncuestaCreateModal from "@/components/encuestas/encuesta_create";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import MDInput from "@/components/MDInput";
import MenuItem from "@mui/material/MenuItem";
import { alerts } from "@/hooks/alerts";
import { useSede } from "@/context/sedeContext";

function Encuestas() {
  const [encuestas, setEncuestas] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [exportFormat, setExportFormat] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.ENCUESTAS);
  const { effectiveSedeId } = useSede();
  const canInsert = isAdmin || permisos.insertar;
  const canSelect = isAdmin || permisos.seleccionar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;


  const fetchencuestas = async () => {
    const params = new URLSearchParams();

    if (effectiveSedeId) {
      params.append("sede_id", String(effectiveSedeId));
    }

    const res = await apiFetch(`encuestas/all_encuestas-pag?${params.toString()}`);
    setEncuestas(Array.isArray(res) ? res : (res.encuestas || []));
  };

  useEffect(() => {
    fetchencuestas();
  }, [effectiveSedeId, canSelect]);

  //fución para cambiar el estado
  async function handleToggleEstado(encuesta) {
    if (!canChangeState) return;

    const nuevoEstado = !encuesta.estado_encuesta;
    try {
      await apiFetch(`encuestas/cambiar-estado/${encuesta.id_encuesta}?nuevo_estado=${nuevoEstado}`, {
        method: "PUT"
      });

      setEncuestas((prevEncuestas) =>
        prevEncuestas.map((e) =>
          e.id_encuesta === encuesta.id_encuesta
            ? { ...e, estado_encuesta: nuevoEstado }
            : e
        )
      );
    } catch (error) {
      alerts.error("No se pudo actualizar el estado");
    }
  }

  async function handleCreateEncuesta(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`encuestas/crear-encuesta`, {
        method: "POST",
        body: data,
      });

      fetchencuestas();
      setOpenCreate(false);
      alerts.success("Encuesta creada con éxito");
    } catch (error) {
      if (error.status === 409) {
        alerts.error(error.detail || "Ya existe una encuesta para este acceso");
        return;
      }
      if (error.status === 401) {
        alerts.error("Error al crear la encuesta");
      }
    }
  }

  const getEditButtonStyle = (activo) => ({
    color: activo ? "success.main" : "error.main",
    minWidth: "80px",
    fontWeight: 400,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: activo ? "success.main" : "error.main",
      color: "#fff",
    }
  });

  const columns = [
    { header: "Registro N.", accessorKey: "acceso_id" },
    { header: "Nombre", accessorKey: "nombre_completo" },
    { header: "Nombre sede", accessorKey: "nombre_sede" },
    { header: "Lugar atendido", accessorKey: "nombre_area" },
    {
      header: "Calificación",
      accessorKey: "calificacion",
      cell: (info) => renderStars(info.getValue()),
    },
    { header: "Sugerencias", accessorKey: "Observacion" },
    {
      header: "Estado", accessorKey: "estado_encuesta",
      cell: (info) => {
        const value = info.getValue();
        return (
          <MDTypography
            variant="button"
            fontWeight="medium"
            color={value ? "success" : "error"}
              sx={{ fontSize: "12px" }}
          >
            {value ? "Finalizada" : "Pendiente"}
          </MDTypography>
        );
      }
    },
   
  ];
  const stars = [1, 2, 3, 4, 5];
  const renderStars = (calificacion) => {
    const rating = Math.max(0, Math.min(5, Number(calificacion) || 0));

    return (
      <MDBox display="flex" alignItems="center">
        {stars.map((star) => (
          <MDTypography
            key={star}
            variant="h6"
            color={star <= rating ? "warning" : "secondary"}
          >
            ★
          </MDTypography>
        ))}
      </MDBox>
    );
  };
  const rows = encuestas.map((encuesta) => ({
    acceso_id: encuesta.acceso_id,
    nombre_completo: encuesta.nombre_completo,
    nombre_sede: encuesta.nombre_sede,
    nombre_area: encuesta.nombre_area,
    calificacion: encuesta.calificacion,
    Observacion: encuesta.observacion,
    estado_encuesta: encuesta.estado_encuesta,
    encuesta
  }));

  const exportColumns = [
    { header: "Registro N.", key: "acceso_id" },
    { header: "Nombre", key: "nombre_completo" },
    { header: "Nombre sede", key: "nombre_sede" },
    { header: "Lugar atendido", key: "nombre_area" },
    { header: "Calificación", key: "calificacion" },
    { header: "Sugerencias", key: "observacion" },
    {
      header: "Estado",
      key: (row) => (row.estado_encuesta ? "Finalizada" : "Pendiente"),
    },
  ];

  const handleExport = (format) => {
    const dateTag = new Date().toISOString().slice(0, 10);

    if (!encuestas.length) {
      alerts.warning("No hay datos para exportar");
      return;
    }

    try {
      if (format === "csv") {
        exportToCSV(encuestas, exportColumns, `encuestas_${dateTag}.csv`);
        return;
      }

      if (format === "excel") {
        exportToExcel(encuestas, exportColumns, `encuestas_${dateTag}.xlsx`);
        return;
      }

      exportToPDF(encuestas, exportColumns, `encuestas_${dateTag}.pdf`, "Reporte de Encuestas");
    } catch (error) {
      console.error("Error exportando encuestas:", error);
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
            <MDTypography variant="h3">Encuestas</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch
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
                    Realizar Encuesta
                  </MDButton>
                ) : null
              }
            />
          </MDBox>
        </Card>
        <Dialog open={openCreate && canInsert} onClose={() => setOpenCreate(false)}>
            <MDBox p={3}>
              <EncuestaCreateModal
                onSave={(data) => {
                  handleCreateEncuesta(data);
                }}
                onCancel={() => setOpenCreate(false)}
              />
            </MDBox>
          </Dialog>
        {/* <Dialog open={Boolean(selectedEncuesta) && canUpdate} onClose={() => setSelectedEncuesta(null)}>
          <MDBox p={3}>
            <EncuestaEditModal
              onSave={handleUpdateEncuesta}
              onCancel={() => { setSelectedEncuesta(null) }}
              encuesta={selectedEncuesta} />
          </MDBox>
        </Dialog> */}
      </MDBox>
    </MDBox>
  );
}

export default Encuestas;
