import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import MDTypography from "@/components/MDTypography";

export default function PersonEditModal({ onCancel, person, onSave }) {
  const [form, setForm] = useState({ nombre_completo: "", tipo_persona:"", tipo_documento:"",
                                     documento: "" });

  useEffect(() => {
    if (person) {
      setForm({
        tipo_persona: person.tipo_persona,
        nombre_completo: person.nombre_completo,
        tipo_documento: person.tipo_documento,
        documento: person.documento,
      });
    }
  }, [person]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar persona</MDTypography>
      
      <MDBox mb={2}>
        <FormControl size="md">
          <InputLabel id="tipo-persona-label">Tipo persona</InputLabel>
          <Select
            labelId="tipo_persona-label"
            name="tipo_persona"
            value={form.tipo_persona || ""}
            label="Tipo persona"
            onChange={handleChange}
            sx={{ height: 40,
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
        label="Nombre completo"
        name="nombre_completo"
        value={form.nombre_completo}
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
            label="Tipo documento"
            onChange={handleChange}
            sx={{ height: 40,
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
          value={form.documento}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={onCancel} color="secondary" variant="text">
          Cancelar
        </MDButton>
        <MDButton color="success" type="submit" variant="gradient">
          Actualizar
        </MDButton>
      </MDBox>
    </form>
  );
}