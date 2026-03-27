import { useState, useEffect } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import { apiFetch } from "@/services/api";
import MDTypography from "@/components/MDTypography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

function PermisoCreateModal({ onSave, onCancel }) {

  const [modulos, setModulos] = useState([]);
  const [roles, setRoles] = useState([]);

  const [form, setForm] = useState({
    id_rol: "",
    id_modulo: "",
    insertar: 0,
    actualizar: 0,
    seleccionar: 0,
    borrar: 0,
  });

  useEffect(() => {
    apiFetch("rol/all/roles")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
          setRoles(data);
        }
        // Si devuelve paginación:
        else if (data.roles) {
          setRoles(data.roles);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    apiFetch("modulo/all/modulos")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
          setModulos(data);
        }
        // Si devuelve paginación:
        else if (data.modulos) {
          setModulos(data.modulos);
        }
      })
      .catch(err => console.error(err));
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["insertar", "actualizar", "seleccionar", "borrar"];
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };


  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>

      <MDTypography variant="h6" mb={3}>
        Registrar permiso
      </MDTypography>

      <MDBox mb={2}>
        <Autocomplete
          options={Array.isArray(modulos) ? modulos : []}
          getOptionLabel={(option) => option.nombre || ""}
          isOptionEqualToValue={(option, value) => option.id_modulo === value.id_modulo}
          value={
            (Array.isArray(modulos)
              ? modulos.find((m) => m.id_modulo === Number(form.id_modulo))
              : null) || null
          }
          onChange={(event, newValue) => {
            setForm((prev) => ({
              ...prev,
              id_modulo: newValue ? newValue.id_modulo : "",
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Módulo"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </MDBox>

      <MDBox mb={2}>
        <Autocomplete
          options={Array.isArray(roles) ? roles : []}
          getOptionLabel={(option) => option.nombre || ""}
          isOptionEqualToValue={(option, value) => option.id_rol === value.id_rol}
          value={
            (Array.isArray(roles)
              ? roles.find((m) => m.id_rol === Number(form.id_rol))
              : null) || null
          }
          onChange={(event, newValue) => {
            setForm((prev) => ({
              ...prev,
              id_rol: newValue ? newValue.id_rol : "",
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Nombre del rol"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          select
          label="Registrar"
          name="insertar"
          value={form.insertar}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          <option value={1}>Si</option>
          <option value={0}>No</option>
        </MDInput>
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          select
          label="Actualizar"
          name="actualizar"
          value={form.actualizar}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          <option value={1}>Si</option>
          <option value={0}>No</option>
        </MDInput>
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          select
          label="Seleccionar"
          name="seleccionar"
          value={form.seleccionar}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          <option value={1}>Si</option>
          <option value={0}>No</option>
        </MDInput>
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          select
          label="Borrar"
          name="borrar"
          value={form.borrar}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          <option value={1}>Si</option>
          <option value={0}>No</option>
        </MDInput>
      </MDBox>

      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={onCancel} color="secondary" variant="text">
          Cancelar
        </MDButton>

        <MDButton sx={{background: "green"}} variant="gradient" type="submit">
          Registrar
        </MDButton>
      </MDBox>

    </form>
  );
}

export default PermisoCreateModal;