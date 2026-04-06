import { useEffect, useMemo, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";

import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import MDInput from "@/components/MDInput";
import MDButton from "@/components/MDButton";
import DataTable from "@/examples/Tables/DataTable";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import EquipoCreateModal from "@/components/equipments/equipments_create";
import { usePermissions } from "@/hooks/usePermissions";
import { MODULOS } from "@/constants/modulos";

function Access() {
  const [identifier, setIdentifier] = useState("");
  const [areaId, setAreaId] = useState("");
  const [areas, setAreas] = useState([]);
  const [accessRows, setAccessRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateSubmitting, setIsCreateSubmitting] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEquipmentModal, setOpenEquipmentModal] = useState(false);
  const [equipmentDraft, setEquipmentDraft] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [createForm, setCreateForm] = useState({
    tipo_persona: "",
    nombre_completo: "",
    tipo_documento: "",
    documento: "",
    hasEquipment: false,
  });

  const { permisos, isAdmin } = usePermissions(MODULOS.REGISTROS_ACCESO);
  const canInsert = isAdmin || permisos.insertar;
  const canSelect = isAdmin || permisos.seleccionar;

  const getCurrentTimestamp = () => {
    const now = new Date();
    return (
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0")
    );
  };

  const getLocalISODateTime = () => {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 19);
  };

  const resetCreateForm = (prefillDocument = "") => {
    setCreateForm({
      tipo_persona: "",
      nombre_completo: "",
      tipo_documento: "",
      documento: prefillDocument,
      hasEquipment: false,
    });
    setEquipmentDraft(null);
    setOpenEquipmentModal(false);
  };

  const formatearFecha = (fechaString) => {
    if (!fechaString) return "-";
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

  const fetchAreas = async () => {
    try {
      const res = await apiFetch("area/all/areas");
      setAreas(Array.isArray(res) ? res.filter((a) => a.estado) : []);
    } catch (error) {
      setAreas([]);
    }
  };

  const fetchAccess = async () => {
    if (!canSelect) return;

    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        page_size: String(pageSize),
      });

      const res = await apiFetch(`access/paginated?${params.toString()}`);
      setAccessRows(res.access || []);
      setTotal(res.total_access || 0);
    } catch (error) {
      setAccessRows([]);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    fetchAccess();
  }, [page, pageSize, canSelect]);

  const createAccessByDocument = async (documento) => {
    const payload = {
      sede_id: 0,
      persona_id: 0,
      equipo_id: 0,
      usuario_registro_id: 0,
      area_id: Number(areaId),
      tipo_movimiento: true,
      fecha_entrada: getLocalISODateTime(),
    };

    await apiFetch(
      `access/crear-by_document-scan?cod_barras_p=${encodeURIComponent(documento)}&area_id=${Number(areaId)}`,
      {
        method: "POST",
        body: payload,
      }
    );
  };

  const openCreatePersonModal = (documentValue) => {
    resetCreateForm(documentValue);
    setOpenCreateModal(true);
  };

  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleHasEquipment = (event) => {
    const checked = event.target.checked;
    if (checked) {
      setCreateForm((prev) => ({ ...prev, hasEquipment: true }));
      setOpenEquipmentModal(true);
      return;
    }

    setCreateForm((prev) => ({ ...prev, hasEquipment: false }));
    setEquipmentDraft(null);
    setOpenEquipmentModal(false);
  };

  const handleSaveEquipmentDraft = (data) => {
    setEquipmentDraft(data);
    setOpenEquipmentModal(false);
    setCreateForm((prev) => ({ ...prev, hasEquipment: true }));
  };

  const handleCancelEquipmentModal = () => {
    setOpenEquipmentModal(false);
    setCreateForm((prev) => ({ ...prev, hasEquipment: Boolean(equipmentDraft) }));
  };

  const handleCancelCreateModal = () => {
    setOpenCreateModal(false);
    resetCreateForm("");
  };

  const handleCreatePersonAndAccess = async () => {
    if (!areaId) {
      setMessage({ type: "error", text: "Selecciona un area de visita antes de registrar." });
      return;
    }

    const requiredPersonFields = [
      createForm.tipo_persona,
      createForm.nombre_completo,
      createForm.tipo_documento,
      createForm.documento,
    ];

    if (requiredPersonFields.some((field) => !String(field || "").trim())) {
      setMessage({ type: "error", text: "Completa todos los datos de la persona." });
      return;
    }

    if (createForm.hasEquipment && !equipmentDraft) {
      setMessage({ type: "error", text: "Si la persona trae equipo, completa sus datos en el modal de equipo." });
      return;
    }

    setIsCreateSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      await apiFetch("person/crear-persona", {
        method: "POST",
        body: {
          tipo_persona: createForm.tipo_persona,
          nombre_completo: createForm.nombre_completo,
          tipo_documento: createForm.tipo_documento,
          documento: createForm.documento,
          estado: true,
          fecha_registro: getCurrentTimestamp(),
        },
      });

      const personaCreada = await apiFetch(
        `person/person-by-document?document=${encodeURIComponent(createForm.documento.trim())}`
      );

      let codBarrasCreado = "";

      if (createForm.hasEquipment) {
        const equipoData = new FormData();
        for (const [key, value] of equipmentDraft.entries()) {
          equipoData.append(key, value);
        }
        equipoData.append("persona_id", String(personaCreada.id_persona));

        await apiFetch("equipments/crear", {
          method: "POST",
          body: equipoData,
        });

        codBarrasCreado = String(equipoData.get("codigo_barras_inv") || "").trim();
      }

      await createAccessByDocument(createForm.documento.trim());

      if (codBarrasCreado) {
        await apiFetch(`access/asociar_equipo_scan?cod_barras_eq=${encodeURIComponent(codBarrasCreado)}`, {
          method: "POST",
        });
      }

      setIdentifier("");
      setOpenCreateModal(false);
      resetCreateForm("");
      setMessage({
        type: "success",
        text: codBarrasCreado
          ? "Persona, equipo y acceso registrados correctamente."
          : "Persona y acceso registrados correctamente.",
      });
      fetchAccess();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          typeof error?.detail === "string"
            ? error.detail
            : error?.detail?.[0]?.msg || "No se pudo registrar el acceso.",
      });
    } finally {
      setIsCreateSubmitting(false);
    }
  };

  const handleRegisterAccess = async () => {
    if (!canInsert) return;

    const value = identifier.trim();
    if (!value) {
      setMessage({ type: "error", text: "Ingresa un documento o serial." });
      return;
    }

    if (!areaId) {
      setMessage({ type: "error", text: "Selecciona un area de visita." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      try {
        // 1) Intentar como documento de persona.
        await apiFetch(`person/person-by-document?document=${encodeURIComponent(value)}`);
        await createAccessByDocument(value);

        fetchAccess();
        setIdentifier("");
        setMessage({ type: "success", text: "Acceso registrado correctamente por documento." });
        return;
      } catch (personError) {
        if (personError?.detail !== "Persona no encontrada") {
          setMessage({
            type: "error",
            text:
              typeof personError?.detail === "string"
                ? personError.detail
                : personError?.detail?.[0]?.msg || "No se pudo registrar el acceso.",
          });
          return;
        }
      }

      // 2) Intentar como codigo de barras de equipo.
      const equipo = await apiFetch(`equipments/by-cod_barras?cod_barras=${encodeURIComponent(value)}`);
      const personas = await apiFetch("person/all/person");
      const personaAsociada = (personas || []).find((p) => p.id_persona === equipo.persona_id);

      if (!personaAsociada?.documento) {
        setMessage({ type: "warning", text: "Equipo encontrado, pero la persona no existe. Completa su registro en el modal." });
        openCreatePersonModal("");
        return;
      }

      await createAccessByDocument(personaAsociada.documento);
      await apiFetch(`access/asociar_equipo_scan?cod_barras_eq=${encodeURIComponent(value)}`, {
        method: "POST",
      });

      setIdentifier("");
      setMessage({ type: "success", text: "Acceso registrado correctamente por codigo de barras de equipo." });
      fetchAccess();
    } catch (equipError) {
      if (equipError?.detail === "Equipo no encontrado") {
        if (/^\d+$/.test(value)) {
          setMessage({ type: "warning", text: "La persona no existe. Completa el registro en el modal." });
          openCreatePersonModal(value);
        } else {
          setMessage({ type: "warning", text: "No existe un equipo con ese codigo de barras." });
        }
      } else {
        setMessage({
          type: "error",
          text:
            typeof equipError?.detail === "string"
              ? equipError.detail
              : equipError?.detail?.[0]?.msg || "No se pudo registrar el acceso.",
        });
      }
      } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterOut = async () => {
    if (!canInsert) return;

    const value = identifier.trim();
    if (!value) {
      setMessage({ type: "error", text: "Ingresa un documento o serial." });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    const fechaSalida = getLocalISODateTime();

    try {
      try {
        // 1) Intentar como documento de persona.
        await apiFetch(`access/salida_person_scan?cod_barras_person=${encodeURIComponent(value)}&fecha_salida=${encodeURIComponent(fechaSalida)}`, {
          method: "PUT",
        });

        fetchAccess();
        setIdentifier("");
        setMessage({ type: "success", text: "Salida registrada correctamente por documento." });
        return;
      } catch (personError) {
        const personDetail = personError?.detail;
        const shouldTryEquipment =
          personDetail === "Persona no encontrada" ||
          personDetail === "Error al registrar la salida" ||
          personDetail === "No existe un ingreso activo para esa persona.";

        if (!shouldTryEquipment) {
          setMessage({
            type: "error",
            text:
              typeof personError?.detail === "string"
                ? personError.detail
                : personError?.detail?.[0]?.msg || "No se pudo registrar la salida.",
          });
          return;
        }
      }

      // 2) Intentar como codigo de barras de equipo.
      await apiFetch(`access/salida_equip_scan?cod_barras_equipo=${encodeURIComponent(value)}&fecha_salida=${encodeURIComponent(fechaSalida)}`, {
        method: "PUT",
      });

      setIdentifier("");
      setMessage({ type: "success", text: "Salida registrada correctamente por codigo de barras de equipo." });
      fetchAccess();
    } catch (equipError) {
      if (equipError?.detail === "No existe un ingreso activo para ese equipo.") {
        setMessage({ type: "warning", text: "Ese equipo no tiene un ingreso activo para registrar la salida." });
      } else
      if (equipError?.detail === "Equipo no encontrado") {
        if (/^\d+$/.test(value)) {
          setMessage({ type: "warning", text: "La persona no existe. Completa el registro en el modal." });
          openCreatePersonModal(value);
        } else {
          setMessage({ type: "warning", text: "No existe un equipo con ese codigo de barras." });
        }
      } else {
        setMessage({
          type: "error",
          text:
            typeof equipError?.detail === "string"
              ? equipError.detail
              : equipError?.detail?.[0]?.msg || "No se pudo registrar la salida.",
        });
      }
      } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      { header: "Persona", accessorKey: "persona" },
      { header: "Serial", accessorKey: "serial" },
      { header: "Area", accessorKey: "area" },
      { header: "Sede", accessorKey: "sede" },
      { header: "Entrada", accessorKey: "entrada" },
      { header: "Salida", accessorKey: "salida" },
    ],
    []
  );

  const rows = accessRows.map((registro) => ({
    id: registro.id_acceso,
    persona: registro.nombre_completo,
    serial: registro.serial || "Sin equipo",
    area: registro.nombre_area || "No definida",
    sede: registro.nombre_sede || "-",
    entrada: formatearFecha(registro.fecha_entrada),
    salida: formatearFecha(registro.fecha_salida),
  }));

  const messageColor = message.type === "success" ? "success" : message.type === "warning" ? "warning" : "error";

  return (
    <MDBox>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h3" mb={2}>
              Accesos
            </MDTypography>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={5}>
                <MDInput
                  fullWidth
                  label="Documento o codigo de barras"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <MDInput
                  fullWidth
                  select
                  value={areaId || ""}
                  onChange={(e) => setAreaId(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    displayEmpty: true,
                    sx: {
                      height: "45px",
                      display: "flex",
                      alignItems: "center",
                    },
                    renderValue: (selected) => {
                      if (!selected) {
                        return (
                          <span style={{ color: "#aaa" }}>
                            Área de visita
                          </span>
                        );
                      }

                      const area = areas.find(
                        (a) => a.id_area === selected
                      );

                      return area ? area.nombre_area : "";
                    },
                  }}
                >
                  {areas.map((area) => (
                    <MenuItem key={area.id_area} value={area.id_area}>
                      {area.nombre_area}
                    </MenuItem>
                  ))}
                </MDInput>
              </Grid>

              <Grid item xs={12} md={3}>
                <MDBox display="flex" gap={1}>
                  <MDButton
                    variant="gradient"
                    color="success"
                    onClick={handleRegisterAccess}
                    disabled={isSubmitting || !canInsert}
                  >
                    {isSubmitting ? "Procesando..." : "Registrar acceso"}
                  </MDButton>

                  <MDButton
                    variant="gradient"
                    sx={{
                      background: "linear-gradient(45deg, #043473 30%, #1e5aa8 90%)",
                    }}
                    onClick={handleRegisterOut}
                    disabled={isSubmitting || !canInsert}
                  >
                    {isSubmitting ? "Procesando..." : "Salida"}
                  </MDButton>
                </MDBox>
              </Grid>
            </Grid>

            {message.text && (
              <MDTypography variant="button" color={messageColor} mt={2} display="block">
                {message.text}
              </MDTypography>
            )}
          </MDBox>
        </Card>

        <MDBox mt={3}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h5" mb={2}>
                Registros recientes
              </MDTypography>

              {canSelect ? (
                <DataTable
                  table={{ columns, rows }}
                  pagination={{
                    manual: true,
                    page,
                    pageSize,
                    total,
                    onPageChange: setPage,
                  }}
                  showTotalEntries
                />
              ) : (
                <MDTypography variant="button" color="text">
                  No tienes permisos para consultar los registros de acceso.
                </MDTypography>
              )}
            </MDBox>
          </Card>
        </MDBox>
      </MDBox>

      <Dialog open={openCreateModal} onClose={handleCancelCreateModal} fullWidth maxWidth="md">
        <MDBox p={3}>
          <MDTypography variant="h5" mb={1}>
            Registrar persona para acceso
          </MDTypography>
          <MDTypography variant="button" color="text" display="block" mb={3}>
            Si la persona trae equipo, activalo y completa los datos del equipo antes de registrar.
          </MDTypography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MDInput
                fullWidth
                select
                name="tipo_persona"
                value={createForm.tipo_persona || ""}
                onChange={handleCreateFormChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  displayEmpty: true,
                  sx: {
                    height: "45px",
                    display: "flex",
                    alignItems: "center",
                  },
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <span style={{ color: "#aaa" }}>
                          Tipo de persona
                        </span>
                      );
                    }
                    return selected;
                  },
                }}
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="Sena">Sena</MenuItem>
                <MenuItem value="Visitante">Visitante</MenuItem>
              </MDInput>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                fullWidth
                select
                name="tipo_documento"
                value={createForm.tipo_documento || ""}
                onChange={handleCreateFormChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  displayEmpty: true,
                  sx: {
                    height: "45px",
                    display: "flex",
                    alignItems: "center",
                  },
                  renderValue: (selected) => {
                    if (!selected) {
                      return (
                        <span style={{ color: "#aaa" }}>
                          Tipo de documento
                        </span>
                      );
                    }
                    return selected;
                  },
                }}
              >
                <MenuItem value="">Seleccione</MenuItem>
                <MenuItem value="CC">Cedula ciudadania</MenuItem>
                <MenuItem value="TI">Tarjeta identidad</MenuItem>
                <MenuItem value="CE">Cedula extranjeria</MenuItem>
                <MenuItem value="Pasaporte">Pasaporte</MenuItem>
              </MDInput>
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                fullWidth
                name="nombre_completo"
                label="Nombre completo"
                value={createForm.nombre_completo}
                onChange={handleCreateFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                fullWidth
                name="documento"
                label="Documento"
                value={createForm.documento}
                onChange={handleCreateFormChange}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={<Switch checked={createForm.hasEquipment} onChange={handleToggleHasEquipment} />}
                label="Esta persona trae equipo"
              />
            </Grid>

            {createForm.hasEquipment && (
              <>
                <Grid item xs={12} md={6}>
                  <MDTypography variant="button" color="text">
                    {equipmentDraft ? "Equipo listo para registrar." : "Completa los datos del equipo en el modal."}
                  </MDTypography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <MDButton
                    variant="outlined"
                    color="info"
                    onClick={() => setOpenEquipmentModal(true)}
                  >
                    {equipmentDraft ? "Editar equipo" : "Registrar equipo"}
                  </MDButton>
                </Grid>
              </>
            )}
          </Grid>

          <MDBox mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <MDButton variant="text" color="secondary" onClick={handleCancelCreateModal}>
              Cancelar
            </MDButton>
            <MDButton
              variant="gradient"
              color="success"
              onClick={handleCreatePersonAndAccess}
              disabled={isCreateSubmitting}
            >
              {isCreateSubmitting ? "Registrando..." : "Registrar"}
            </MDButton>
          </MDBox>
        </MDBox>
      </Dialog>

      <Dialog open={openEquipmentModal} onClose={handleCancelEquipmentModal} fullWidth maxWidth="md">
        <MDBox p={3}>
          <EquipoCreateModal
            includePersona={false}
            onSave={handleSaveEquipmentDraft}
            onCancel={handleCancelEquipmentModal}
          />
        </MDBox>
      </Dialog>
    </MDBox>
  );
}

export default Access;