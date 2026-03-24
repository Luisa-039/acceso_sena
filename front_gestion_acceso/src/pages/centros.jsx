import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import CentroEditModal from "@/components/centros/center_edit";
import CentroCreateModal from "@/components/centros/center_create";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";

function Centros() {
  const [centros, setCentros] = useState([]);
  const [selectedCentro, setSelectedCentro] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);
  const { permisos, isAdmin } = usePermissions(MODULOS.CENTROS);
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;


  const fetchCentros = async () => {
    const res = await apiFetch(`center/all/center`)
      setCentros(res);
    }

  useEffect(() => {
    fetchCentros();
  }, []);

  //fución para cambiar el estado
  async function handleToggleEstado(center) {
    if (!canChangeState) return;

    const nuevoEstado = !center.estado;
    try {
      await apiFetch(`center/cambiar-estado/${center.id_centro}?nuevo_estado=${nuevoEstado}`, {
        method: "PUT"
      });

      setCentros(centers =>
        centers.map(c =>
          c.id_centro === center.id_centro
            ? { ...c, estado: nuevoEstado }
            : c
        )
      );
    } catch (error) {
      alert("No se pudo actualizar el estado");
    }
  }

  async function handleCreateCentro(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`center/crear-centro`, {
        method: "POST",
        body: data,
      });

      fetchCentros();
      setOpenCreate(false);
      alert("Centro creado con éxito");
    } catch (error) {
      if (error.status === 401) {
        alert("Error al crear el centro");
      }
    }
  }

  // //Función para actualizar usuario
  async function handleUpdateCentro(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `center/by-id/${selectedCentro.id_centro}`,
        {
          method: "PUT",
          body: data,
        }
      );
      setCentros(centro =>
        centro.map(c =>
          c.id_centro === selectedCentro.id_centro
            ? { ...c, ...data }
            : c
        )
      );

      if (response) {
        fetchCentros();
        alert("Centro actualizado con exito")
        setSelectedCentro(null);
      }

    } catch (error) {
      console.error(error);
      alert("Error al actualizar el centro");
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
    { header: "Código", accessorKey: "codigoCentro" },
    { header: "Nombre", accessorKey: "nombre_centro" },
    { header: "Cuidad", accessorKey: "ciudad_centro" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const centro = info.row.original.centro;

        if (!canChangeState) {
          return value ? "Activo" : "Inactivo";
        }

        return (
          <MDButton
            variant="text"
            size="small"
            onClick={() => handleToggleEstado(centro)}
            sx={getEditButtonStyle(value)}
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
                onClick={() => setSelectedCentro(row.original.centro)}
              >
                Editar
              </MDButton>
            ),
          },
        ]
      : [])
  ];

  const rows = centros.map((centro) => ({
    codigoCentro: centro.codigo_centro,
    nombre_centro: centro.nombre,
    ciudad_centro: centro.nombre_ciudad,
    estado: centro.estado,
    centro
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Centros</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch

              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}>
                    Registrar Centro
                  </MDButton>
                ) : null
              }
            />
          </MDBox>
        </Card>
        <Dialog open={openCreate && canInsert} onClose={() => setOpenCreate(false)}>
            <MDBox p={3}>
              <CentroCreateModal
                onSave={(data) => {
                  handleCreateCentro(data);
                }}
                oncancel={() => setOpenCreate(false)}
              />
            </MDBox>
          </Dialog>
        <Dialog open={Boolean(selectedCentro) && canUpdate} onClose={() => setSelectedCentro(null)}>
          <MDBox p={3}>
            <CentroEditModal
              onSave={handleUpdateCentro}
              oncancel={() => { setSelectedCentro(null) }}
              centro={selectedCentro} />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Centros;