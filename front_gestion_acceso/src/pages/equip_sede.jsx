import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import EquipoEdit_sedeModal from "@/components/equipments_sede/equipment_sedeEdit";
import Equipo_sedeCreateModal from "@/components/equipments_sede/equipments_Sedecreate";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import MDInput from "@/components/MDInput";
import MenuItem from "@mui/material/MenuItem";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";

function Equips_sede() {
  const [Equips_sede, setEquips_sede] = useState([]);
  const [selectedEquips_sede, setSelectedEquips_sede] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.EQUIPOS_SEDE);
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;

  const fetchEquips_sedes = async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      page_size: String(pageSize),
    });

    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    const res = await apiFetch(`equipments_sede/all_equips-pag?${params.toString()}`)
      setEquips_sede(res.equipos || []);
      setTotal(res.total_equipements || 0);
    }

  const estadosEquipo = [
    { value: "Disponible", label: "DISPONIBLE" },
    { value: "Mantenimiento", label: "MANTENIMIENTO" },
    { value: "Fuera_de_sede", label: "FUERA DE SEDE" },
    { value: "Inactivo", label: "INACTIVO" }
  ];

  useEffect(() => {
    fetchEquips_sedes();
  }, [page, pageSize, searchTerm]);

  const handleSearchEquipsSede = (value) => {
    setPage(0);
    setSearchTerm(value);
  };

  //fución para cambiar el estado
  async function handleToggleEstado(equipo, nuevoEstado) {
    if (!canChangeState) return;

    try {
      await apiFetch(`equipments_sede/estado/${equipo.id_equipo_sede}?estado_equip=${nuevoEstado}`, {
        method: "PUT"
      });

      setEquips_sede(equipos =>
        equipos.map(e =>
          e.id_equipo_sede === equipo.id_equipo_sede
            ? { ...e, estado: nuevoEstado }
            : e
        )
      );
      fetchEquips_sedes();
    } catch (error) {
      alert("No se pudo actualizar el estado");
    }
  }

const estadoStyles = {
  Disponible: "success.main",
  Mantenimiento: "warning.main",
  Fuera_de_sede: "info.main",
  Inactivo: "error.main"
};

const getEstadoStyle = (estado) => ({
  minWidth: "120px",
  
  "& .MuiInputBase-root": {
    borderRadius: "18px",
    color: estadoStyles[estado],
    fontWeight: 600,
  },

  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },

  "& .MuiSelect-select": {
    color: estadoStyles[estado],
  },

  "&:hover .MuiSelect-select": {
    backgroundColor: estadoStyles[estado],
    color: "#fff",
  }
});

  async function handleCreateEquipo(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`equipments_sede/crear`, {
        method: "POST",
        body: data,
      });
      fetchEquips_sedes();
      setOpenCreate(false);
      alert("Equipo creado con éxito");

    } catch (error) {
        alert("Error al crear el equipo");
      }
  }

  //Función para actualizar equipo
  async function handleUpdateEquip_sede(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `equipments_sede/by_id/${selectedEquips_sede.id_equipo_sede}`,
        {
          method: "PUT",
          body: data,
        }
      );
      setEquips_sede(equipo =>
        equipo.map(e =>
          e.id_equipo_sede === selectedEquips_sede.id_equipo_sede
            ? { ...e, ...data }
            : e
        )
      );

      if (response) {
        fetchEquips_sedes();
        alert("Equipo actualizado con exito")
        setSelectedEquips_sede(null);
      }

    } catch (error) {
      console.error(error);
      alert("Error al actualizar el equipo");
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
    { header: "Ubicación", accessorKey: "lugar_eq" },
    { header: "Tipo equipo", accessorKey: "c_equipo" },
    { header: "N. serial", accessorKey: "serie_eq" },
    { header: "marca / modelo", accessorKey: "marca_modelo_eq" },
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
    { header: "Código barras", accessorKey: "cod_eq" },
    { header: "Fecha registro", accessorKey: "fecha_registro" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const equipo = info.row.original.equipement_sede;

        if (!canChangeState) {
          return value;
        }

        return (
          <MDInput
            select
            value={value || ""}
            size="small"
            onChange={(e) => handleToggleEstado(equipo, e.target.value)}
            sx={ getEstadoStyle(equipo.estado)}
          >
            {estadosEquipo.map((estado)=>(
              <MenuItem key={estado.value} value={estado.value}>
                {estado.label}
              </MenuItem>
            ))}
          </MDInput>
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
                onClick={() => setSelectedEquips_sede(row.original.equipement_sede)}
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

  const rows = Equips_sede.map((equipement_sede) => ({
    nom_sede: equipement_sede.nombre_sede,
    lugar_eq: equipement_sede.nombre_area,
    c_equipo: equipement_sede.nombre_categoria,
    descrip_eq: equipement_sede.descripcion,
    serie_eq: equipement_sede.serial,
    marca_modelo_eq: `${equipement_sede.marca || ""} / ${equipement_sede.modelo || ""}`.trim(),
    cod_eq: equipement_sede.codigo_barras_equipo,
    // foto_eq: equipement_sede.foto_path,
    estado: equipement_sede.estado,
    fecha_registro: formatearFecha(equipement_sede.fecha_registro),
    equipement_sede
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Equipos sede</MDTypography>
            <DataTable 
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchEquipsSede}
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
              <Equipo_sedeCreateModal
                onSave={(data) => {
                  handleCreateEquipo(data);
                }}
                onCancel={() => setOpenCreate(false)}
              />
            </MDBox>
          </Dialog>
        <Dialog open={Boolean(selectedEquips_sede) && canUpdate} onClose={() => setSelectedEquips_sede(null)}>
          <MDBox p={3}>
            <EquipoEdit_sedeModal
              onSave={handleUpdateEquip_sede}
              onCancel={() => { setSelectedEquips_sede(null) }}
              equipement_sede={selectedEquips_sede}
              />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Equips_sede;