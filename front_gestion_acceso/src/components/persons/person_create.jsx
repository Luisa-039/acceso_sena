import { useState } from "react";
//import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";

function PersonCreateModal({ onSave, onCancel }) {

  const [form, setForm] = useState({
    tipo_persona: "",
    nombre_completo: "",
    tipo_documento: "",
    documento: "",
    estado: true,
    fecha_registro: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const now = new Date();

      const fecha_actual =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");

      const data = { ...form, fecha_registro: fecha_actual };
      onSave(data);
    }}>

      <MDTypography variant="h6" mb={3}>
        Registrar persona
      </MDTypography>

      <MDBox mb={2}>
        <FormControl size="md">
          <InputLabel id="tipo-persona-label">Tipo persona</InputLabel>
          <Select
            labelId="tipo_persona-label"
            name="tipo_persona"
            value={form.tipo_persona || ""}
            label="Tipo persona"
            onChange={handleChange}
            sx={{
              height: 40,
              width: 200
            }}
          >
            <MenuItem value="Sena">Sena</MenuItem>
            <MenuItem value="Visitante">Visitante</MenuItem>
          </Select>
        </FormControl>
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Nombre"
          name="nombre_completo"
          value={form.nombre_completo || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <FormControl size="md">
          <InputLabel id="tipo-documento-label">Tipo documento</InputLabel>
          <Select
            labelId="tipo_documento-label"
            name="tipo_documento"
            value={form.tipo_documento || ""}
            label="Tipo persona"
            onChange={handleChange}
            sx={{
              height: 40,
              width: 200
            }}
          >
            <MenuItem value="CC">Cédula cuidadanía</MenuItem>
            <MenuItem value="TI">Tarjeta identidad</MenuItem>
            <MenuItem value="CE">Cédula extranjería</MenuItem>
            <MenuItem value="Pasaporte">Pasaporte</MenuItem>
          </Select>
        </FormControl>
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Documento"
          name="documento"
          value={form.documento || ""}
          onChange={handleChange}
        />
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

export default PersonCreateModal;