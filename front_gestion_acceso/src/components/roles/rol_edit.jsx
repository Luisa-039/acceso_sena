import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

export default function RolEditModal({ onCancel, rol, onSave }) {
  const [form, setForm] = useState({ nombre: "", descripcion: "", estado: true });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  };


  useEffect(() => {
    if (rol) {
      setForm({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
      });
    }
  }, [rol]);
  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar rol</MDTypography>
      <MDBox mb={2}>
        <MDInput
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Descripción"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={onCancel} color="secondary" variant="text">
          Cancelar
        </MDButton>
        <MDButton sx={{background: "green"}} type="submit" variant="gradient">
          Actualizar
        </MDButton>
      </MDBox>
    </form>
  );
}