import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import EquipoEditModal from "@/components/equipments/equipment_edit";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import EquipoCreateModal from "@/components/equipments/equipments_create";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";
import { alerts } from "@/hooks/alerts";

function Equips_ext() {
  const [Equips_ext, setEquips_ext] = useState([]);
  const [selectedEquips_ext, setSelectedEquips_ext] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.EQUIPOS_EXTERNOS);
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;


  const fetchEquips_exts = async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      page_size: String(pageSize),
    });

    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    const res = await apiFetch(`equipments/all_equips-pag?${params.toString()}`)
      setEquips_ext(res.equipos || []);
      setTotal(res.total_equipements || 0);
    }

  useEffect(() => {
    fetchEquips_exts();
  }, [page, pageSize, searchTerm]);

  const handleSearchEquips = (value) => {
    setPage(0);
    setSearchTerm(value);
  };

  //fución para cambiar el estado
  async function handleToggleEstado(equipo) {
    if (!canChangeState) return;

    const nuevoEstado = !equipo.estado;
    try {
      await apiFetch(`equipments/estado/${equipo.id_equipo}?estado_equip=${nuevoEstado}`, {
        method: "PUT"
      });

      setEquips_ext(equipos =>
        equipos.map(e =>
          e.id_equipo === equipo.id_equipo
            ? { ...e, estado: nuevoEstado }
            : e
        )
      );
    } catch (error) {
      alerts.error("No se pudo actualizar el estado");
    }
  }

  async function handleCreateEquipo(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`equipments/crear`, {
        method: "POST",
        body: data,
      });
      fetchEquips_exts();
      setOpenCreate(false);
      alerts.success("Equipo creado con éxito");

    } catch (error) {
        alerts.error("Error al crear el equipo");
      }
  }

  //Función para actualizar usuario
  async function handleUpdateEquip(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `equipments/by_id/${selectedEquips_ext.id_equipo}`,
        {
          method: "PUT",
          body: data,
        }
      );
      setEquips_ext(equipo =>
        equipo.map(e =>
          e.id_equipo === selectedEquips_ext.id_equipo
            ? { ...e, ...data }
            : e
        )
      );

      if (response) {
        alerts.success("Equipo actualizado con exito");
        fetchEquips_exts();
        setSelectedEquips_ext(null);
      }

    } catch (error) {
      console.error(error);
      alerts.error("Error al actualizar el equipo");
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
    { header: "Proietario", accessorKey: "nom_persona" },
    { header: "Tipo equipo", accessorKey: "c_equipo" },
    { header: "N. serie", accessorKey: "serie_eq" },
    { header: "marca_modelo", accessorKey: "marca_modelo_eq" },
    { header: "descripcion", accessorKey: "descrip_eq",
      cell: (info) => (
        <div style={{ 
          whiteSpace: "normal",
          wordBreak: "break-word",
          maxWidth: "200px"
        }}>
          {info.getValue()}
        </div>
      )
     },
    { header: "Placa", accessorKey: "cod_eq" },
    {header: "Imagen", accessorKey: "foto_eq",
      cell: (info) => {
        const value = info.getValue();

        if (!value) return "Sin imagen";

        return (
          <img
            src={`http://localhost:8000/${value}`}
            alt="equipo"
            style={{
              width: "50px",
              borderRadius: "6px"
            }}
          />
        );
      }
    },
    { header: "Fecha registro", accessorKey: "fecha_registro" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const equipo = info.row.original.equipement;

        if (!canChangeState) {
          return value ? "Activo" : "Inactivo";
        }

        return (
          <MDButton
            variant="text"
            size="small"
            onClick={() => handleToggleEstado(equipo)}
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
                onClick={() => setSelectedEquips_ext(row.original.equipement)}
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

  const rows = Equips_ext.map((equipement) => ({
    nom_persona: equipement.nombre_completo,
    c_equipo: equipement.nombre_categoria,
    serie_eq: equipement.serial,
    marca_modelo_eq: equipement.marca_modelo,
    descrip_eq: equipement.descripcion,
    cod_eq: equipement.codigo_barras_inv,
    foto_eq: equipement.foto_path,
    estado: equipement.estado,
    fecha_registro: formatearFecha(equipement.fecha_registro),
    equipement
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Equipos externos</MDTypography>
            <DataTable 
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchEquips}
              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}>
                    Registrar equipo
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
              <EquipoCreateModal
                onSave={(data) => {
                  handleCreateEquipo(data);
                }}
                onCancel={() => setOpenCreate(false)}
              />
            </MDBox>
          </Dialog>
        <Dialog open={Boolean(selectedEquips_ext) && canUpdate} onClose={() => setSelectedEquips_ext(null)}>
          
          <MDBox p={3}>
            <EquipoEditModal
              onSave={handleUpdateEquip}
              onCancel={() => { setSelectedEquips_ext(null) }}
              equipement={selectedEquips_ext} />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Equips_ext;
