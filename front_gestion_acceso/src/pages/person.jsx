import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import PersonEditModal from "@/components/persons/person_edit";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import PersonCreateModal from "@/components/persons/person_create";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";

function Persons() {
  const [Persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { permisos, isAdmin } = usePermissions(MODULOS.PERSONAS);
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;
  const canDelete = isAdmin || permisos.borrar;
  const canChangeState = canUpdate || canDelete;


  const fetchPersons = async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      page_size: String(pageSize),
    });

    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    const res = await apiFetch(`person/all_persons-pag?${params.toString()}`)
      setPersons(res.persons || []);
      setTotal(res.total_persons || 0);
    }

  useEffect(() => {
    fetchPersons();
  }, [page, pageSize, searchTerm]);

  const handleSearchPersons = (value) => {
    setPage(0);
    setSearchTerm(value);
  };

  //fución para cambiar el estado
  async function handleToggleEstado(person) {
    if (!canChangeState) return;

    const nuevoEstado = !person.estado;
    try {
      await apiFetch(`person/cambiar-estado/${person.id_persona}?nuevo_estado=${nuevoEstado}`, {
        method: "PUT"
      });

      setPersons(persons =>
        persons.map(p =>
          p.id_persona === person.id_persona
            ? { ...p, estado: nuevoEstado }
            : p
        )
      );
    } catch (error) {
      alert("No se pudo actualizar el estado");
    }
  }

  async function handleCreatePerson(data) {
    if (!canInsert) return;

    try {
      apiFetch(`person/crear-persona`, {
        method: "POST",
        body: data,
      });

      fetchPersons();
      setOpenCreate(false);
      alert("Persona creado con éxito");
    } catch (error) {
      if (error.status === 400) {
        alert("Este correo ya está registrado con otra persona");
      } else {
        alert("Error al crear el persona");
      }
    }
  }

  //Función para actualizar usuario
  async function handleUpdatePerson(data) {
    if (!canUpdate) return;

    try {
      const response = await apiFetch(
        `person/by-document/${selectedPerson.documento}`,
        {
          method: "PUT",
          body: data,
        }
      );
      setPersons(person =>
        person.map(p =>
          p.documento === selectedPerson.documento
            ? { ...p, ...data }
            : p
        )
      );

      if (response) {
        alert("Persona actualizada con exito")
        setSelectedPerson(null);
      }

    } catch (error) {
      console.error(error);
      alert("Error al actualizar la persona");
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
    { header: "Tipo persona", accessorKey: "t_persona" },
    { header: "Nombre", accessorKey: "nombre" },
    { header: "Tipo documento", accessorKey: "t_documento" },
    { header: "Documento", accessorKey: "documento" },
    { header: "Fecha registro", accessorKey: "fecha_registro" },
    {
      header: "Estado", accessorKey: "estado",
      cell: (info) => {
        const value = info.getValue();
        const person = info.row.original.person;

        if (!canChangeState) {
          return value ? "Activo" : "Inactivo";
        }

        return (
          <MDButton
            variant="text"
            size="small"
            onClick={() => handleToggleEstado(person)}
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
                onClick={() => setSelectedPerson(row.original.person)}
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

  const rows = Persons.map((person) => ({
    t_persona: person.tipo_persona,
    nombre: person.nombre_completo,
    t_documento: person.tipo_documento,
    documento: person.documento,
    fecha_registro: formatearFecha(person.fecha_registro),
    estado: person.estado,
    person
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Personas</MDTypography>
            <DataTable
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchPersons}

              headerActions={
                canInsert ? (
                  <MDButton variant="gradient" color="success" onClick={() => setOpenCreate(true)}>
                    Registrar persona
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
              <PersonCreateModal
                onSave={(data) => {
                  handleCreatePerson(data);
                }}
                onCancel={() => setOpenCreate(false)}
              />
            </MDBox>
          </Dialog>
        <Dialog open={Boolean(selectedPerson) && canUpdate} onClose={() => setSelectedPerson(null)}>
          <MDBox p={3}>
            <PersonEditModal
              onSave={handleUpdatePerson}
              onCancel={() => { setSelectedPerson(null) }}
              person={selectedPerson} />
          </MDBox>
        </Dialog>
      </MDBox>
    </MDBox>
  );
}

export default Persons;