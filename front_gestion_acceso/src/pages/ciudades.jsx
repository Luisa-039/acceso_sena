import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import CityEditModal from "@/components/ciudades/cities_edit";
import CityCreateModal from "@/components/ciudades/cities_create";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";

function Ciudades() {
  const [ciudades, setCiudades] = useState([]);
  const [selectedCiudad, setSelectedCiudad] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.CIUDADES);
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;


  const fetchCiudades = async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      page_size: String(pageSize),
    });

    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    const res = await apiFetch(`cities/all_cities-pag?${params.toString()}`)
      setCiudades(res.ciudades || []);
      setTotal(res.total_cities || 0);
    }

  useEffect(() => {
    fetchCiudades();
  }, [page, pageSize, searchTerm]);

  const handleSearchCiudad = (value) => {
    setPage(0);
    setSearchTerm(value);
  };

  //fución para cambiar el estado
  async function handleToggleEstado(ciudad) {
    if (!canChangeState) return;

    const nuevoEstado = !ciudad.estado;
    try {
      await apiFetch(`cities/cambiar-estado/${ciudad.id_ciudad}?nuevo_estado=${nuevoEstado}`, {
        method: "PUT"
      });

      setCiudades(ciudades =>
        ciudades.map(c =>
          c.id_ciudad === ciudad.id_ciudad
            ? { ...c, estado: nuevoEstado }
            : c
        )
      );
    } catch (error) {
      alert("No se pudo actualizar el estado");
    }
  }

  async function handleCreateCiudad(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`cities/crear-ciudad`, {
        method: "POST",
        body: data,
      });

      fetchCiudades();
      setOpenCreate(false);
      alert("Ciudad creada con éxito");
    } catch (error) {
      if (error.status === 401) {
        alert("Error al crear la ciudad");
      }
    }
  }

  //Función para actualizar usuario
  async function handleUpdateCiudad(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `cities/ciudad-by-code/${selectedCiudad.codigo}`,
        {
          method: "PUT",
          body: data,
        }
      );
      setCiudades(ciudad =>
        ciudad.map(s =>
          c.codigo === selectedCiudad.codigo
            ? { ...c, ...data }
            : c
        )
      );

      if (response) {
        alert("Ciudad actualizada con éxito")
        setSelectedCiudad(null);
      }

    } catch (error) {
      console.error(error);
      alert("Error al actualizar la ciudad");
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
    { header: "Código", accessorKey: "codigo" },
    { header: "Departamento", accessorKey: "nombreDepartamento" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const ciudad = info.row.original.ciudad;

        if (!canChangeState) {
          return value ? "Activo" : "Inactivo";
        }

        return (
          <MDButton
            variant="text"
            size="small"
            onClick={() => handleToggleEstado(ciudad)}
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
                onClick={() => setSelectedCiudad(row.original.ciudad)}
              >
                Editar
              </MDButton>
            ),
          },
        ]
      : [])
  ];

  const rows = ciudades.map((ciudad) => ({
    nombre: ciudad.nombre,
    codigo: ciudad.codigo,
    nombreDepartamento: ciudad.nombre_departamento,
    estado: ciudad.estado,
    ciudad
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Ciudades</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchCiudad}

              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}>
                    Registrar Ciudad
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
              <CityCreateModal
                onSave={(data) => {
                  handleCreateCiudad(data);
                }}
                oncancel={() => setOpenCreate(false)}
              />
            </MDBox>
          </Dialog>
        <Dialog open={Boolean(selectedCiudad) && canUpdate} onClose={() => setSelectedCiudad(null)}>
          <MDBox p={3}>
            <CityEditModal
              onSave={handleUpdateCiudad}
              oncancel={() => { setSelectedCiudad(null) }}
              cities={selectedCiudad} />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Ciudades;