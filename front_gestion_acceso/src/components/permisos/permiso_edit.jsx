import { useState, useEffect } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";
import TextField from "@mui/material/TextField";

export default function PermisoEditModal({ onCancel, permiso, onSave }) {
  const [form, setForm] = useState({
    insertar: 0,
    actualizar: 0,
    seleccionar: 0,
    borrar: 0,
  });

  useEffect(() => {
    if (permiso) {
      setForm({
        insertar: permiso.insertar || 0,
        actualizar: permiso.actualizar || 0,
        seleccionar: permiso.seleccionar || 0,
        borrar: permiso.borrar || 0,
      });
    }
  }, [permiso]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const numericFields = ["insertar", "actualizar", "seleccionar", "borrar"];
    setForm((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar permiso</MDTypography>

      <MDBox mb={2}>
        <TextField
          label="Módulo"
          value={permiso?.nombre_modulo || ""}
          disabled
          fullWidth
          variant="outlined"
        />
      </MDBox>

      <MDBox mb={2}>
        <TextField
          label="Rol"
          value={permiso?.nombre_rol || ""}
          disabled
          fullWidth
          variant="outlined"
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

        <MDButton color="info" variant="gradient" type="submit">
          Actualizar
        </MDButton>
      </MDBox>

    </form>
  );
}