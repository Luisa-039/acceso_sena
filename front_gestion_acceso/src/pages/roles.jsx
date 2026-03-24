import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import RolEditModal from "@/components/roles/rol_edit";
import RolCreateModal from "@/components/roles/rol_create";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";


function Roles() {
  const [roles, setRoles] = useState([]);
  const [selectedRol, setSelectedRol] = useState(null);
  const [openCreate, setOpenCreate] = useState(false);

  const fetchRoles = async () => {
    const res = await apiFetch(`rol/all/roles`);
    setRoles(Array.isArray(res) ? res : res.roles || []);
  };

  // 2. Usarla en el useEffect
  useEffect(() => {
    fetchRoles();
  }, []);

  async function handleToggleEstado(rol) {
    const nuevoEstado = !rol.estado;
    try {
      await apiFetch(`rol/estado/${rol.id_rol}?estado_rol=${nuevoEstado}`, {
        method: "PUT"
      });

      setRoles(roles =>
        roles.map(r =>
          r.id_rol === rol.id_rol
            ? { ...r, estado: nuevoEstado }
            : r
        )
      );
    } catch (error) {
      alert("No se pudo actualizar el estado");
    }
  }

  //Función para actualizar usuario
  async function handleUpdateRol(data) {
    try {
      const response = await apiFetch(
        `rol/by_id/${selectedRol.id_rol}`,
        {
          method: "PUT",
          body: data,
        }
      );
      setRoles(roles =>
        roles.map(r =>
          r.id_rol === selectedRol.id_rol
            ? { ...r, ...data }
            : r
        )
      );

      if (response) {
        alert("Rol actualizado con exito")
        setSelectedRol(null);
        await fetchRoles();
      }

    } catch (error) {
      console.error(error)
      alert("Error al actualizar rol");
    }
  }

  async function handleCreateRol(data) {
    try {
      await apiFetch(`rol/crear`, {
        method: "POST",
        body: data,
      });

      setOpenCreate(false);
      fetchRoles();

      alert("Rol creado con éxito");

      setOpenCreate(false);

    } catch (error) {
        alert("Error al crear el rol");
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
    { header: "Nombre", accessorKey: "nombre" },
    { header: "Descripción", accessorKey: "descripcion" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const rol = info.row.original.rol;

        return (
          <MDButton
            variant="text"
            size="small"
            onClick={() => handleToggleEstado(rol)}
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
          onClick={() => setSelectedRol(row.original.rol)}
        >
          Editar
        </MDButton>
      ),
    }
  ];

  const rows = roles.map((rol) => ({
    nombre: rol.nombre,
    descripcion: rol.descripcion,
    estado: rol.estado,
    id_rol: rol.id_rol,
    rol
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Roles</MDTypography>

            <DataTable
              table={{ columns, rows }}
              canSearch
              headerActions={
                <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}
                >
                  Registrar rol
                </MDButton>
              }
            />

          </MDBox>
        </Card>
         <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
          <MDBox p={3}>
            <RolCreateModal
              onSave={(data) => {
                handleCreateRol(data);
              }}
              onCancel={() => setOpenCreate(false)}
            />
          </MDBox>
        </Dialog>
  
        <Dialog open={Boolean(selectedRol)} onClose={() => setSelectedRol(null)}>

          <MDBox p={3}>
            <RolEditModal
              onSave={handleUpdateRol}
              onCancel={() => { setSelectedRol(null) }}
              rol={selectedRol} />
          </MDBox>
        </Dialog> 
      </MDBox>
    </MDBox>
  );
}

export default Roles;