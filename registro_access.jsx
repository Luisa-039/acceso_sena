import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDButton from "@/components/MDButton";

import DataTable from "@/examples/Tables/DataTable";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
// import SalidaAcceso from "@/components/equipments/equipment_edit";
// import IngresoCreateModal from "@/components/equipments/equipments_create";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";
import { alerts } from "@/hooks/alerts";
import { useAuth } from "@/context/authContext";

function RegistroAccess() {
  const [RegistroAccess, setRegistroAccess] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [openSalida, setOpenSalida] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [areas, setAreas] = useState([]);
  const [ingresoForm, setIngresoForm] = useState({ cod_barras_p: "", area_id: "" });
  const [salidaMethod, setSalidaMethod] = useState("persona");
  const [salidaValue, setSalidaValue] = useState("");
  const [previewTuple, setPreviewTuple] = useState(null);
  const [isSubmittingIngreso, setIsSubmittingIngreso] = useState(false);
  const [isSubmittingSalida, setIsSubmittingSalida] = useState(false);
  const { permisos, isAdmin } = usePermissions(MODULOS.REGISTROS_ACCESO);
  const { user } = useAuth();
  const canInsert = isAdmin || permisos.insertar;
  const canUpdate = isAdmin || permisos.actualizar;


  const Fecth_RegistroAccess = async () => {
    const params = new URLSearchParams({
      page: String(page + 1),
      page_size: String(pageSize),
    });

    if (searchTerm.trim()) {
      params.append("search", searchTerm.trim());
    }

    const res = await apiFetch(`access/paginated?${params.toString()}`);
    setRegistroAccess(res.access || []);
    setTotal(res.total_access || 0);
  };

  const fetchAreas = async () => {
    try {
      const data = await apiFetch("area/all/areas");
      if (Array.isArray(data)) {
        setAreas(data);
      } else {
        setAreas(data?.areas || []);
      }
    } catch {
      setAreas([]);
      alerts.error("No se pudieron cargar las áreas");
    }
  };

  const extractDocumentNumber = (scannedValue) => {
    if (!scannedValue) return "";
    const cleanValue = String(scannedValue).trim();
    if (/^\d+$/.test(cleanValue)) return cleanValue;

    const labelMatch = cleanValue.match(/(?:CC|CEDULA|C[EÉ]DULA|DOCUMENTO|NUMERO|N[UÚ]MERO|NRO|NO)\D{0,12}(\d{5,12})/i);
    if (labelMatch?.[1]) return labelMatch[1];

    const candidates = cleanValue.match(/\d{5,12}/g);
    if (!candidates?.length) return cleanValue;
    return candidates.sort((a, b) => b.length - a.length)[0];
  };

  useEffect(() => {
    Fecth_RegistroAccess();
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    if (openCreate) {
      fetchAreas();
    }
  }, [openCreate]);

  const handleSearchRegistroAccess = (value) => {
    setPage(0);
    setSearchTerm(value);
  };


  const handleOpenCreate = () => {
    setOpenSalida(false);
    setIngresoForm({ cod_barras_p: "", area_id: "" });
    setPreviewTuple(null);
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setPreviewTuple(null);
  };

  const handleOpenSalida = () => {
    setOpenCreate(false);
    setSalidaMethod("persona");
    setSalidaValue("");
    setPreviewTuple(null);
    setOpenSalida(true);
  };

  const handleCloseSalida = () => {
    setOpenSalida(false);
    setSalidaValue("");
  };


  async function handleCreateIngreso() {
    if (!canInsert) return;

    const areaId = Number(ingresoForm.area_id);
    const scannedValue = ingresoForm.cod_barras_p?.trim();
    const documentNumber = extractDocumentNumber(scannedValue);

    if (!documentNumber) {
      alerts.warning("Debe escanear o ingresar el documento");
      return;
    }

    if (!areaId) {
      alerts.warning("Debe seleccionar el área destino");
      return;
    }

    setIsSubmittingIngreso(true);

    try {
      const person = await apiFetch(`person/person-by-document?document=${encodeURIComponent(documentNumber)}`);

      const areaSelected = (areas || []).find((area) => Number(area.id_area) === areaId);
      const tupleData = {
        documento_scaneado: documentNumber,
        area_id: areaId,
        area_nombre: areaSelected?.nombre_area || "N/A",
        persona_id: person?.id_persona,
        tipo_persona: person?.tipo_persona,
        tipo_documento: person?.tipo_documento,
        documento: person?.documento,
        nombre_completo: person?.nombre_completo,
        fecha_registro: person?.fecha_registro,
      };
      setPreviewTuple(tupleData);

      await apiFetch(
        `access/crear-by_document-scan?cod_barras_p=${encodeURIComponent(scannedValue)}&area_id=${areaId}`,
        {
          method: "POST",
          body: {
            sede_id: Number(user?.sede_id || 0),
            persona_id: Number(person?.id_persona || 0),
            equipo_id: null,
            usuario_registro_id: Number(user?.id_usuario || 0),
            area_id: areaId,
            tipo_movimiento: true,
            fecha_entrada: new Date().toISOString(),
          },
        }
      );

      Fecth_RegistroAccess();
      setOpenCreate(false);
      alerts.success("Ingreso creado con éxito");

    } catch (error) {
      const detail = String(error?.detail || "").toLowerCase();
      if (detail.includes("persona no encontrada")) {
        alerts.warning("La persona no está registrada en el sistema");
      } else if (detail.includes("ingreso activo")) {
        alerts.warning("La persona ya tiene un ingreso activo");
      } else if (detail.includes("area")) {
        alerts.warning("Debe seleccionar un área válida");
      } else {
        alerts.error("Error al crear el ingreso");
      }
    } finally {
      setIsSubmittingIngreso(false);
    }
  }

  async function handleRegistrarSalida() {
    if (!canUpdate) return;

    const rawValue = salidaValue.trim();
    if (!rawValue) {
      alerts.warning("Debe escanear o ingresar un valor para registrar la salida");
      return;
    }

    setIsSubmittingSalida(true);
    try {
      if (salidaMethod === "persona") {
        const documentNumber = extractDocumentNumber(rawValue);
        if (!documentNumber) {
          alerts.warning("Documento inválido");
          return;
        }

        await apiFetch(`access/salida_person_scan?cod_barras_person=${encodeURIComponent(documentNumber)}`, {
          method: "PUT",
        });
      } else if (salidaMethod === "equipo_scan") {
        await apiFetch(`access/salida_equip_scan?cod_barras_equipo=${encodeURIComponent(rawValue)}`, {
          method: "PUT",
        });
      } else {
        await apiFetch(`access/salida_equip_serial?serial_equipo=${encodeURIComponent(rawValue)}`, {
          method: "PUT",
        });
      }

      await Fecth_RegistroAccess();
      alerts.success("Salida registrada con éxito");
      handleCloseSalida();
    } catch (error) {
      const detail = String(error?.detail || "").toLowerCase();
      if (detail.includes("no encontrado") || detail.includes("no existe")) {
        alerts.warning("No se encontró un ingreso activo para la salida indicada");
      } else {
        alerts.error("Error al registrar la salida");
      }
    } finally {
      setIsSubmittingSalida(false);
    }
  }

  const columns = [
    { header: "Sede", accessorKey: "nombre_sede" },
    { header: "Área", accessorKey: "nombre_area" },
    { header: "Nombre completo", accessorKey: "nombre_completo" },
    { header: "N. serie ", accessorKey: "serial" },
    { header: "Marca / modelo ", accessorKey: "marca_modelo" },
    { header: "Fecha de ingreso", accessorKey: "fecha_entrada" },
    { header: "Fecha de salida", accessorKey: "fecha_salida" },
    // {
    //   id: "acciones",
    //   header: "Acciones",
    //   cell: ({ row }) => (
    //     <MDButton
    //       variant="text"
    //       size="small"
    //       sx={{ color: "error.main", minWidth: "80px", fontWeight: 600, transition: "all 0.2s ease-in-out", "&:hover": { backgroundColor: "error.main", color: "#fff" } }}
    //       onClick={() => setRegistroAccess(row.original.access_p)}
    //     >
    //       Salida
    //     </MDButton>
    //   ),
    // },
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

  const rows = RegistroAccess.map((access_p) => ({
    nombre_sede: access_p.nombre_sede,
    nombre_area: access_p.nombre_area,
    nombre_completo: access_p.nombre_completo,
    serial: access_p.serial || "-",
    marca_modelo: access_p.marca_modelo || "-",
    fecha_entrada: formatearFecha(access_p.fecha_entrada),
    fecha_salida: access_p.fecha_salida ? formatearFecha(access_p.fecha_salida) : "Sin salida",
    access_p
  }));

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3">Registro acceso</MDTypography>

            {openCreate && canInsert ? (
              <MDBox mt={2} mb={3} p={2} borderRadius="lg" border="1px solid" borderColor="grey.300">
                <MDTypography variant="h5" mb={2}>
                  Registro ingreso de persona
                </MDTypography>

                <MDBox display="grid" gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr auto" }} gap={2} alignItems="end">
                  <TextField
                    label="Escanear o ingresar documento"
                    value={ingresoForm.cod_barras_p}
                    onChange={(e) => setIngresoForm((prev) => ({ ...prev, cod_barras_p: e.target.value }))}
                    fullWidth
                  />

                  <TextField
                    select
                    label="Ingrese el lugar destino"
                    value={ingresoForm.area_id}
                    onChange={(e) => setIngresoForm((prev) => ({ ...prev, area_id: e.target.value }))}
                    fullWidth
                  >
                    {(areas || []).map((area) => (
                      <MenuItem key={area.id_area} value={area.id_area}>
                        {area.nombre_area}
                      </MenuItem>
                    ))}
                  </TextField>

                  <MDButton
                    variant="gradient"
                    color="success"
                    disabled={isSubmittingIngreso}
                    onClick={handleCreateIngreso}
                  >
                    Registrar ingreso
                  </MDButton>
                </MDBox>
              </MDBox>
            ) : null}

            {openSalida && canUpdate ? (
              <MDBox mt={2} mb={3} p={2} borderRadius="lg" border="1px solid" borderColor="grey.300">
                <MDTypography variant="h5" mb={2}>
                  Registro salida de persona
                </MDTypography>

                <MDBox display="grid" gridTemplateColumns={{ xs: "1fr", sm: "220px 1fr auto" }} gap={2} alignItems="end">
                  <TextField
                    select
                    label="Tipo de salida"
                    value={salidaMethod}
                    onChange={(e) => setSalidaMethod(e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="persona">Persona por documento</MenuItem>
                    <MenuItem value="equipo_scan">Equipo por código de barras</MenuItem>
                    <MenuItem value="equipo_serial">Equipo por serial</MenuItem>
                  </TextField>

                  <TextField
                    label={
                      salidaMethod === "persona"
                        ? "Escanear documento persona"
                        : salidaMethod === "equipo_scan"
                        ? "Escanear código de barras del equipo"
                        : "Ingresar serial del equipo"
                    }
                    value={salidaValue}
                    onChange={(e) => setSalidaValue(e.target.value)}
                    fullWidth
                  />

                  <MDButton
                    variant="gradient"
                    color="error"
                    disabled={isSubmittingSalida}
                    onClick={handleRegistrarSalida}
                  >
                    Registrar salida
                  </MDButton>
                </MDBox>
              </MDBox>
            ) : null}

            <DataTable
              table={{ columns, rows }}
              canSearch
              onSearchChange={handleSearchRegistroAccess}
              headerActions={
                <MDBox display="flex" gap={1} flexWrap="wrap">
                  {canInsert ? (
                    <MDButton variant="gradient" color="success" onClick={openCreate ? handleCloseCreate : handleOpenCreate}>
                      {openCreate ? "Ocultar ingreso" : "Registrar ingreso"}
                    </MDButton>
                  ) : null}
                  {canUpdate ? (
                    <MDButton variant="gradient" color="error" onClick={openSalida ? handleCloseSalida : handleOpenSalida}>
                      {openSalida ? "Ocultar salida" : "Registrar salida"}
                    </MDButton>
                  ) : null}
                </MDBox>
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
        {/* <Dialog open={Boolean(selectedRegistroAccess) && canUpdate} onClose={() => setSelectedRegistroAccess(null)}>
          
          <MDBox p={3}>
            <SalidaAcceso
              onSave={handleUpdateSalida}
              onCancel={() => { setSelectedRegistroAccess(null) }}
              access_p={selectedRegistroAccess} />
          </MDBox>
        </Dialog> */}
      </MDBox>
    </MDBox>
  );
}

export default RegistroAccess;
