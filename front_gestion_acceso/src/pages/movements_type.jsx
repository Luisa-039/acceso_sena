import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import Type_movCreateModal from "@/components/type_mov/typeMov_create";
import Type_movEditModal from "@/components/type_mov/typeMov_edit";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";
import { alerts } from "@/hooks/alerts";


function type_mov() {
  const [type_mov, setType_mov] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedType_mov, setSelectedType_mov] = useState(null);
  const { permisos, isAdmin } = usePermissions(MODULOS.TIPO_MOVIMIENTOS);
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;

  const fetchType_mov = async () => {
    const res = await apiFetch(`type/all-movements-types`);
    setType_mov(Array.isArray(res) ? res : res.type_mov || []);
  };

  // 2. Usarla en el useEffect
  useEffect(() => {
    fetchType_mov();
  }, []);

  async function handleUpdateType_mov(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `type/by-id/${selectedType_mov.id_tipo}`,
        {
          method: "PUT",
          body: data,
        }
      );

      if (response) {
        alerts.success("Tipo de movimiento actualizado con éxito");
        setOpenEdit(false);
        setSelectedType_mov(null);
        await fetchType_mov();
      }

    } catch (error) {
      console.error(error);
      alerts.error("Error al actualizar tipo de movimiento");
    }
  }

  async function handleCreateType_mov(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`type/crear`, {
        method: "POST",
        body: data,
      });

      setOpenCreate(false);
      fetchType_mov();
      alerts.success("Tipo de movimiento creado con éxito");

    } catch (error) {
      {
        alerts.error("Error al crear el tipo de movimiento");
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
    { header: "Tipo movimiento", accessorKey: "nombre_tipo" },
    { header: "Descripción", accessorKey: "descripcion" },
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
                  setSelectedType_mov(row.original.type_mov);
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

  const rows = type_mov.map((type_mov) => ({
    nombre_tipo: type_mov.nombre_tipo,
    descripcion: type_mov.descripcion,
    type_mov
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Tipos de movimientos</MDTypography>

            <DataTable
              table={{ columns, rows }}
              canSearch
              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}
                  >
                    Registrar tipo de movimiento
                  </MDButton>
                ) : null
              }
            />

          </MDBox>
        </Card>
        <Dialog open={openCreate && canInsert} onClose={() => setOpenCreate(false)}>
          <MDBox p={3}>
            <Type_movCreateModal
              onSave={(data) => {
                handleCreateType_mov(data);
              }}
              onCancel={() => setOpenCreate(false)}
            />
          </MDBox>
        </Dialog>
        <Dialog open={openEdit && canUpdate} onClose={() => setOpenEdit(false)}>
          <MDBox p={3}>
            <Type_movEditModal
              onSave={handleUpdateType_mov}
              onCancel={() => { setOpenEdit(false); setSelectedType_mov(null); }}
              typeMov={selectedType_mov} />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default type_mov;
