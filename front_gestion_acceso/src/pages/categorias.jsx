import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import CategoriaCreateModal from "@/components/categorias/categoria_create";
import CategoriaEditModal from "@/components/categorias/categoria_edit";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";


function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedCategorias, setSelectedCategorias] = useState(null);

  const fetchCategorias = async () => {
    const res = await apiFetch(`categoria/all/categories`);
    setCategorias(res);
  };

  // 2. Usarla en el useEffect
  useEffect(() => {
    fetchCategorias();
  }, []);

  async function handleUpdateCategorias(data) {
    try {
      const response = await apiFetch(
        `categoria/by_id/${selectedCategorias.id_Categoria}`,
        {
          method: "PUT",
          body: data,
        }
      );

      if (response) {
        alert("Categoría actualizada con éxito");
        setOpenEdit(false);
        setSelectedCategorias(null);
        await fetchCategorias();
      }

    } catch (error) {
      console.error(error);
      alert("Error al actualizar Categoría");
    }
  }

  async function handleCreateCategorias(data) {
    try {
      await apiFetch(`categoria/crear`, {
        method: "POST",
        body: data,
      });

      setOpenCreate(false);
      fetchCategorias();

      alert("Categoría creada con éxito");

    } catch (error) {
      {
        alert("Error al crear la Categoría");
      }
    }
  }

  async function handleToggleEstado(categoria) {
    const nuevoEstado = !categoria.estado;
    try {
      await apiFetch(`categoria/estado/${categoria.id_categoria}?estado_categoria=${nuevoEstado}`, {
        method: "PUT"
      });

      setCategorias(categorias =>
        categorias.map(e =>
          e.id_categoria === categoria.id_categoria
            ? { ...e, estado: nuevoEstado }
            : e
        )
      );
    } catch (error) {
      alert("No se pudo actualizar el estado");
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
    { header: "Nombre categoria", accessorKey: "nombre_categoria" },
    { header: "Descripción", accessorKey: "descripcion" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const categoria = info.row.original.categorias;

        return (
          <MDButton
            variant="text"
            size="small"
            onClick={() => handleToggleEstado(categoria)}
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
            setSelectedCategorias(row.original.categorias);
            setOpenEdit(true);
          }}
        >
          Editar
        </MDButton>
      ),
    }
  ];

  const rows = categorias.map((categorias) => ({
    nombre_categoria: categorias.nombre_categoria,
    descripcion: categorias.descripcion,
    estado: categorias.estado,
    categorias
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">categorias</MDTypography>

            <DataTable
              table={{ columns, rows }}
              canSearch
              headerActions={
                <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}
                >
                  Registrar Categorias
                </MDButton>
              }
            />

          </MDBox>
        </Card>
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
          <MDBox p={3}>
            <CategoriaCreateModal
              onSave={(data) => {
                handleCreateCategorias(data);
              }}
              onCancel={() => setOpenCreate(false)}
            />
          </MDBox>
        </Dialog>
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
          <MDBox p={3}>
            {/* <CategoriasEditModal
              onSave={handleUpdateCategorias}
              onCancel={() => { setOpenEdit(false); setSelectedCategorias(null); }}
              Categorias={selectedCategorias} /> */}
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Categorias;