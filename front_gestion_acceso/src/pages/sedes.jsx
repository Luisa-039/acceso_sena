import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import SedeEditModal from "@/components/sedes/sede_edit";
import SedeCreateModal from "@/components/sedes/sede_create";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";

function Sedes() {
  const [sedes, setSedes] = useState([]);
  const [selectedSede, setSelectedSede] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.SEDES);
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;


  const fetchSedes = async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      page_size: String(pageSize),
    });

    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    const res = await apiFetch(`sede/all_sedes-pag?${params.toString()}`)
      setSedes(res.sedes || []);
      setTotal(res.total_sedes || 0);
    }

  useEffect(() => {
    fetchSedes();
  }, [page, pageSize, searchTerm]);

  const handleSearchSedes = (value) => {
    setPage(0);
    setSearchTerm(value);
  };

  //fución para cambiar el estado
  async function handleToggleEstado(sede) {
    if (!canChangeState) return;

    const nuevoEstado = !sede.estado;
    try {
      await apiFetch(`sede/cambiar-estado/${sede.id_sede}?nuevo_estado=${nuevoEstado}`, {
        method: "PUT"
      });

      setSedes(sedes =>
        sedes.map(s =>
          s.id_sede === sede.id_sede
            ? { ...s, estado: nuevoEstado }
            : s
        )
      );
    } catch (error) {
      alert("No se pudo actualizar el estado");
    }
  }

  async function handleCreateSede(data) {
    if (!canInsert) return;

    try {
      apiFetch(`sede/crear-sede`, {
        method: "POST",
        body: data,
      });

      fetchSedes();
      setOpenCreate(false);
      alert("Sede creada con éxito");
    } catch (error) {
      if (error.status === 401) {
        alert("Error al crear el Sede");
      }
    }
  }

  //Función para actualizar usuario
  async function handleUpdateSede(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `sede/by-code/${selectedSede.codigo_sede}`,
        {
          method: "PUT",
          body: data,
        }
      );
      setSedes(sede =>
        sede.map(s =>
          s.codigo_sede === selectedSede.codigo_sede
            ? { ...s, ...data }
            : s
        )
      );

      if (response) {
        alert("Sede actualizada con exito")
        setSelectedSede(null);
      }

    } catch (error) {
      console.error(error);
      alert("Error al actualizar la sede");
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
    { header: "Código", accessorKey: "codigoSede" },
    { header: "Nombre", accessorKey: "nombre_sede" },
    { header: "Dirección", accessorKey: "direccion" },
    { header: "Centro", accessorKey: "nombreCentro" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const sede = info.row.original.sede;

        if (!canChangeState) {
          return value ? "Activo" : "Inactivo";
        }

        return (
          <MDButton
            variant="text"
            size="small"
            onClick={() => handleToggleEstado(sede)}
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
                onClick={() => setSelectedSede(row.original.sede)}
              >
                Editar
              </MDButton>
            ),
          },
        ]
      : [])
  ];

  const rows = sedes.map((sede) => ({
    codigoSede: sede.codigo_sede,
    nombre_sede: sede.nombre,
    direccion: sede.direccion,
    nombreCentro: sede.nombre_centro,
    estado: sede.estado,
    sede
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Sedes</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchSedes}

              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}>
                    Registrar Sede
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
              <SedeCreateModal
                onSave={(data) => {
                  handleCreateSede(data);
                }}
                oncancel={() => setOpenCreate(false)}
              />
            </MDBox>
          </Dialog>
        <Dialog open={Boolean(selectedSede) && canUpdate} onClose={() => setSelectedSede(null)}>
          <MDBox p={3}>
            <SedeEditModal
              onSave={handleUpdateSede}
              oncancel={() => { setSelectedSede(null) }}
              sede={selectedSede} />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Sedes;