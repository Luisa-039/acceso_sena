import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import EncuestaCreateModal from "@/components/encuestas/encuesta_create";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";

function Encuestas() {
  const [encuestas, setEncuestas] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const { permisos, isAdmin } = usePermissions(MODULOS.ENCUESTAS);
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;


  const fetchencuestas = async () => {
    const res = await apiFetch(`encuestas/all_encuestas-pag`);
    setEncuestas(Array.isArray(res) ? res : (res.encuestas || []));
  };

  useEffect(() => {
    fetchencuestas();
  }, []);

  //fución para cambiar el estado
  async function handleToggleEstado(encuesta) {
    if (!canChangeState) return;

    const nuevoEstado = !encuesta.estado_encuesta;
    try {
      await apiFetch(`encuestas/cambiar-estado/${encuesta.id_encuesta}?nuevo_estado=${nuevoEstado}`, {
        method: "PUT"
      });

      setEncuestas((prevEncuestas) =>
        prevEncuestas.map((e) =>
          e.id_encuesta === encuesta.id_encuesta
            ? { ...e, estado_encuesta: nuevoEstado }
            : e
        )
      );
    } catch (error) {
      alert("No se pudo actualizar el estado");
    }
  }

  async function handleCreateEncuesta(data) {
    if (!canInsert) return;

    try {
      await apiFetch(`encuestas/crear-encuesta`, {
        method: "POST",
        body: data,
      });

      fetchencuestas();
      setOpenCreate(false);
      alert("Encuesta creada con éxito");
    } catch (error) {
      if (error.status === 401) {
        alert("Error al crear la encuesta");
      }
    }
  }

  //Función para actualizar usuario
  // async function handleUpdateCentro(data) {
  //   if (!canUpdate) return;

  //   try {
  //     const response = await apiFetch(
  //       `center/by-id/${selectedCentro.id_centro}`,
  //       {
  //         method: "PUT",
  //         body: data,
  //       }
  //     );
  //     setencuestas(centro =>
  //       centro.map(c =>
  //         c.id_centro === selectedCentro.id_centro
  //           ? { ...c, ...data }
  //           : c
  //       )
  //     );

  //     if (response) {
  //       fetchencuestas();
  //       alert("Centro actualizado con exito")
  //       setSelectedCentro(null);
  //     }

  //   } catch (error) {
  //     console.error(error);
  //     alert("Error al actualizar el centro");
  //   }
  // }

  const getEditButtonStyle = (activo) => ({
    color: activo ? "success.main" : "error.main",
    minWidth: "80px",
    fontWeight: 400,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: activo ? "success.main" : "error.main",
      color: "#fff",
    }
  });

  const columns = [
    { header: "Registro N.", accessorKey: "acceso_id" },
    { header: "Nombre", accessorKey: "nombre_completo" },
    { header: "Nombre sede", accessorKey: "nombre_sede" },
    { header: "Lugar atendido", accessorKey: "nombre_area" },
    {
      header: "Calificación",
      accessorKey: "calificacion",
      cell: (info) => renderStars(info.getValue()),
    },
    { header: "Sugerencias", accessorKey: "Observacion" },
    {
      header: "Estado", accessorKey: "estado_encuesta",
      cell: (info) => {
        const value = info.getValue();
        return (
          <MDTypography
            variant="button"
            fontWeight="medium"
            color={value ? "success" : "error"}
              sx={{ fontSize: "12px" }}
          >
            {value ? "Finalizada" : "Pendiente"}
          </MDTypography>
        );
      }
    },
    // ...(canUpdate
    //   ? [
    //       {
    //         id: "acciones",
    //         header: "Acciones",
    //         cell: ({ row }) => (
    //           <MDButton
    //             variant="text"
    //             size="small"
    //             sx={getEditButtonStyle}
    //             onClick={() => setSelectedCentro(row.original.centro)}
    //           >
    //             Editar
    //           </MDButton>
    //         ),
    //       },
    //     ]
    //   : [])
  ];
  const stars = [1, 2, 3, 4, 5];
  const renderStars = (calificacion) => {
    const rating = Math.max(0, Math.min(5, Number(calificacion) || 0));

    return (
      <MDBox display="flex" alignItems="center">
        {stars.map((star) => (
          <MDTypography
            key={star}
            variant="h6"
            color={star <= rating ? "warning" : "secondary"}
          >
            ★
          </MDTypography>
        ))}
      </MDBox>
    );
  };
  const rows = encuestas.map((encuesta) => ({
    acceso_id: encuesta.acceso_id,
    nombre_completo: encuesta.nombre_completo,
    nombre_sede: encuesta.nombre_sede,
    nombre_area: encuesta.nombre_area,
    calificacion: encuesta.calificacion,
    Observacion: encuesta.observacion,
    estado_encuesta: encuesta.estado_encuesta,
    encuesta
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Encuestas</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch

              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}>
                    Realizar Encuesta
                  </MDButton>
                ) : null
              }
            />
          </MDBox>
        </Card>
        <Dialog open={openCreate && canInsert} onClose={() => setOpenCreate(false)}>
            <MDBox p={3}>
              <EncuestaCreateModal
                onSave={(data) => {
                  handleCreateEncuesta(data);
                }}
                onCancel={() => setOpenCreate(false)}
              />
            </MDBox>
          </Dialog>
        {/* <Dialog open={Boolean(selectedEncuesta) && canUpdate} onClose={() => setSelectedEncuesta(null)}>
          <MDBox p={3}>
            <EncuestaEditModal
              onSave={handleUpdateEncuesta}
              onCancel={() => { setSelectedEncuesta(null) }}
              encuesta={selectedEncuesta} />
          </MDBox>
        </Dialog> */}
      </MDBox>
    </MDBox>
  );
}

export default Encuestas;