import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import ConsumibleEditModal from "@/components/consumibles/consumible_edit";
import ConsumibleCreateModal from "@/components/consumibles/consumible_create";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";
import { exportToCSV, exportToExcel, exportToPDF, formatDateTime } from "@/utils/exportUtils";
import MDInput from "@/components/MDInput";
import MenuItem from "@mui/material/MenuItem";
import { alerts } from "@/hooks/alerts";
import { useSede } from "@/context/sedeContext";

function Inv_consumible() {
  const [Inv_consumible, setInv_consumible] = useState([]);
  const [selectedInv_consumible, setSelectedInv_consumible] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [exportFormat, setExportFormat] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.EQUIPOS_SEDE);
  const { effectiveSedeId } = useSede();
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;

  const fetchInv_consumibles = async () => {
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

    const res = await apiFetch(`inv_consumibles/all_consumibles-pag?${params.toString()}`)
    setInv_consumible(res.consumibles || []);
    setTotal(res.total_consumibles || 0);
  }

  useEffect(() => {
    fetchInv_consumibles();
  }, [page, pageSize, searchTerm, effectiveSedeId]);

  useEffect(() => {
    setPage(0);
  }, [effectiveSedeId]);

  const handleSearchConsumibles = (value) => {
    setPage(0);
    setSearchTerm(value);
  };

  //fución para cambiar el estado
  async function handleToggleEstado(consumible, nuevoEstado) {
    if (!canChangeState) return;

    try {
      await apiFetch(`inv_consumibles/estado/${consumible.id_consumible}`, {
        method: "PUT",
        body: { estado: nuevoEstado },
      });

      setInv_consumible(consumibles =>
        consumibles.map(c =>
          c.id_consumible === consumible.id_consumible
            ? { ...c, estado: nuevoEstado }
            : c
        )
      );
    } catch (error) {
      alerts.error("No se pudo actualizar el estado");
    }
  }

  async function handleCreateConsumible(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`inv_consumibles/crear`, {
        method: "POST",
        body: data,
      });

      await fetchInv_consumibles();
      setOpenCreate(false);
      alerts.success("Consumible creado con éxito");
    } catch (error) {
      if (error.status === 401) {
        alerts.error("Error al crear el Consumible");
      }
    }
  }

  //Función para actualizar usuario
  async function handleUpdateConsumible(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `inv_consumibles/by_id/${selectedInv_consumible.id_consumible}`,
        {
          method: "PUT",
          body: data,
        }
      );
      setInv_consumible(consumible =>
        consumible.map(c =>
          c.id_consumible === selectedInv_consumible.id_consumible
            ? { ...c, ...data }
            : c
        )
      );

      if (response) {
        alerts.success("Consumible actualizado con exito");
        fetchInv_consumibles();
        setSelectedInv_consumible(null);
      }

    } catch (error) {
      console.error(error);
      alerts.error("Error al actualizar el consumible");
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
    { header: "Sede", accessorKey: "nom_sede" },
    { header: "Ubicación", accessorKey: "lugar_consumible" },
    { header: "Tipo consumible", accessorKey: "c_consumible" },
    { header: "Placa", accessorKey: "placa_cons" },
    { header: "marca / modelo", accessorKey: "marca_modelo_con" },
    { header: "Cantidad", accessorKey: "cantidad_cons" },
    { header: "Porcentaje (%)", accessorKey: "porcentaje_toner" },
    { header: "Fecha registro", accessorKey: "fecha_registro" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const consumible = info.row.original.consumibles;

        if (!canChangeState) {
          return value ? "Activo" : "Inactivo";
        }

        return (
          <MDButton
            variant="text"
            size="small"
            onClick={() => handleToggleEstado(consumible, !value)}
            sx={getEditButtonStyle(Boolean(value))}
          >
            {value ? "Activo" : "Inactivo"}
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
              onClick={() => setSelectedInv_consumible(row.original.consumibles)}
            >
              Editar
            </MDButton>
          ),
        },
      ]
      : [])
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

  const rows = Inv_consumible.map((consumibles) => ({
    nom_sede: consumibles.nombre_sede,
    lugar_consumible: consumibles.ubicacion,
    c_consumible: consumibles.nombre_categoria,
    cantidad_cons: consumibles.cantidad,
    placa_cons: consumibles.placa,
    marca_modelo_con: `${consumibles.marca || ""} / ${consumibles.modelo || ""}`.trim(),
    porcentaje_toner: consumibles.porcentaje_toner,
    estado: consumibles.estado,
    fecha_registro: formatearFecha(consumibles.fecha_registro),
    consumibles
  }));

  const exportColumns = [
    { header: "Sede", key: "nombre_sede" },
    { header: "Ubicación", key: "ubicacion" },
    { header: "Tipo consumible", key: "nombre_categoria" },
    { header: "Placa", key: "placa" },
    {
      header: "Marca / Modelo",
      key: (row) => `${row.marca || ""} / ${row.modelo || ""}`.trim(),
    },
    { header: "Cantidad", key: "cantidad" },
    { header: "Porcentaje (%)", key: "porcentaje_toner" },
    { header: "Estado", key: "estado" },
    { header: "Fecha registro", key: "fecha_registro", format: formatDateTime },
  ];

  const handleExport = (format) => {
    const dateTag = new Date().toISOString().slice(0, 10);

    if (!Inv_consumible.length) {
      alerts.warning("No hay datos para exportar");
      return;
    }

    try {
      if (format === "csv") {
        exportToCSV(Inv_consumible, exportColumns, `consumibles_${dateTag}.csv`);
        return;
      }

      if (format === "excel") {
        exportToExcel(Inv_consumible, exportColumns, `consumibles_${dateTag}.xlsx`);
        return;
      }

      exportToPDF(Inv_consumible, exportColumns, `consumibles_${dateTag}.pdf`, "Reporte de Consumibles");
    } catch (error) {
      console.error("Error exportando consumibles:", error);
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
            <MDTypography variant="h3">Consumibles</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchConsumibles}
              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}>
                    Registrar consumible
                  </MDButton>
                ) : null
              }
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
                      color: "#ffffff"}
                      },
                    },
                    "& .MuiSelect-select": {
                      color: "#071d89",
                      pr: 4,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#ffffff",
                    }
                  }}
                >
                  <MenuItem  value="csv">CSV</MenuItem>
                  <MenuItem  value="excel">Excel</MenuItem>
                  <MenuItem  value="pdf">PDF</MenuItem>
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
        <Dialog open={openCreate && canInsert} onClose={() => setOpenCreate(false)}>
          <MDBox p={3}>
            <ConsumibleCreateModal
              onSave={(data) => {
                handleCreateConsumible(data);
              }}
              onCancel={() => setOpenCreate(false)}
            />
          </MDBox>
        </Dialog>
        <Dialog open={Boolean(selectedInv_consumible) && canUpdate} onClose={() => setSelectedInv_consumible(null)}>
          <MDBox p={3}>
            <ConsumibleEditModal
              onSave={handleUpdateConsumible}
              onCancel={() => { setSelectedInv_consumible(null) }}
              consumible={selectedInv_consumible}
            />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Inv_consumible;
