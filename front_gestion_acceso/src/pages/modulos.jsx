import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import Modulo_CreateModal from "@/components/modulos/modulos_create";
import ModuloEditModal from "@/components/modulos/modulos_edit";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";
import { alerts } from "@/hooks/alerts";


function modulo_mov() {
  const [modulos, setModulos] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedModulo, setSelectedModulo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.MODULOS);
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;

  const fetchModulo = async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      page_size: String(pageSize),
    });

    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    const res = await apiFetch(`modulo/all_modules-pag?${params.toString()}`);
      setModulos(res.modulos || []);
      setTotal(res.total_modulos || 0);
  };

  // 2. Usarla en el useEffect
  useEffect(() => {
    fetchModulo();
  }, [page, pageSize, searchTerm]);

  const handleSearchModulos = (value) => {
    setPage(0);
    setSearchTerm(value);
  };

  async function handleUpdateModulo(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `modulo/by_id/${selectedModulo.id_modulo}`,
        {
          method: "PUT",
          body: data,
        }
      );

      if (response) {
        alerts.success("Módulo actualizado con éxito");
        setOpenEdit(false);
        setSelectedModulo(null);
        await fetchModulo();
      }

    } catch (error) {
      console.error(error);
      alerts.error("Error al actualizar Módulo");
    }
  }

  async function handleCreatemodulo(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`modulo/crear`, {
        method: "POST",
        body: data,
      });

      setOpenCreate(false);
      fetchModulo();

      alerts.success("Módulo creado con éxito");

    } catch (error) {
      {
        alerts.error("Error al crear el Módulo");
      }
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
    { header: "Nombre del modulo", accessorKey: "nombre" },
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
                onClick={() => {
                  setSelectedModulo(row.original.modulo);
                  setOpenEdit(true);
                }}
              >
                Editar
              </MDButton>
            ),
          },
        ]
      : [])
  ];

  const rows = modulos.map((modulo) => ({
    nombre: modulo.nombre,
    modulo
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Modulos</MDTypography>

            <DataTable
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchModulos}
              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}
                  >
                    Registrar modulo
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
            <Modulo_CreateModal
              onSave={(data) => {
                handleCreatemodulo(data);
              }}
              onCancel={() => setOpenCreate(false)}
            />
          </MDBox>
        </Dialog>
        <Dialog open={openEdit && canUpdate} onClose={() => setOpenEdit(false)}>
          <MDBox p={3}>
            <ModuloEditModal
              onSave={handleUpdateModulo}
              onCancel={() => { setOpenEdit(false); setSelectedModulo(null); }}
              modulo={selectedModulo} />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default modulo_mov;
