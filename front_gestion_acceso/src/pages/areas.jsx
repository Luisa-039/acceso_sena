import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import AreaCreateModal from "@/components/areas/area_create";
import AreaEditModal from "@/components/areas/area_edit";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { alerts } from "@/hooks/alerts";


function Areas() {
  const [areas, setAreas] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  //const [searchTerm, setSearchTerm] = useState("");

  const fetchAreas = async () => {
    const res = await apiFetch(`area/all_areas-pag`);
    setAreas(res.areas || []);
    setTotal(res.total_areas || 0);
  };

  // 2. Usarla en el useEffect
  useEffect(() => {
    fetchAreas();
  }, [page, pageSize]);

  async function handleUpdateAreas(data) {
    try {
      const response = await apiFetch(
        `area/by-id/${selectedAreas.id_area}`,
        {
          method: "PUT",
          body: data,
        }
      );

      if (response) {
        alerts.success("Área actualizada con éxito");
        setOpenEdit(false);
        setSelectedAreas(null);
        await fetchAreas();
      }

    } catch (error) {
      console.error(error);
      alerts.error("Error al actualizar el área");
    }
  }

  async function handleCreateAreas(data) {
    try {
      await apiFetch(`area/crear-area`, {
        method: "POST",
        body: data,
      });

      setOpenCreate(false);
      fetchAreas();
      alerts.success("Área creada con éxito");
    } catch (error) {
      {
        alerts.error("Error al crear el área");
      }
    }
  }

  async function handleToggleEstado(area) {
    const nuevoEstado = !area.estado;
    try {
      await apiFetch(`area/cambiar-estado/${area.id_area}?nuevo_estado=${nuevoEstado}`, {
        method: "PUT"
      });

      setAreas((areas) =>
        areas.map((a) =>
          a.id_area === area.id_area
            ? { ...a, estado: nuevoEstado }
            : a
        )
      );
    } catch (error) {
      alerts.error("No se pudo actualizar el estado");
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
    { header: "Nombre área", accessorKey: "nombre_area" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const area = info.row.original.areas;

        return (
          <MDButton
            variant="text"
            size="small"
            onClick={() => handleToggleEstado(area)}
            sx={getEditButtonStyle(value)}
          >
            {value ? "Activo" : "Inactivo"}
          </MDButton>
        );
      }
    },
    {
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <MDButton
          variant="text"
          size="small"
          sx={getEditButtonStyle}
          onClick={() => {
            setSelectedAreas(row.original.areas);
            setOpenEdit(true);
          }}
        >
          Editar
        </MDButton>
      ),
    }
  ];

  const rows = areas.map((areas) => ({
    nombre_area: areas.nombre_area,
    estado: areas.estado,
    areas
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Áreas</MDTypography>

            <DataTable
              table={{ columns, rows }}
              canSearch
              headerActions={
                <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}
                >
                  Registrar Área
                </MDButton>
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
          <MDBox p={3}>
            <AreaCreateModal
              onSave={(data) => {
                handleCreateAreas(data);
              }}
              onCancel={() => setOpenCreate(false)}
            />
          </MDBox>
        </Dialog>
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <MDBox p={3}>
            <AreaEditModal
              onSave={handleUpdateAreas}
              onCancel={() => { setOpenEdit(false); setSelectedAreas(null); }}
              area={selectedAreas} />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Areas;
