import { useState, useEffect } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDTypography from "@/components/MDTypography";
import MDInput from "../MDInput";

export default function ModuloEditModal({ onCancel, modulo, onSave }) {
  const [form, setForm] = useState({
    nombre: ""
  });

  useEffect(() => {
    if (modulo) {
      setForm({
        nombre: modulo.nombre || ""
      });
    }
  }, [modulo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar módulo</MDTypography>

      <MDBox mb={2}>
        <MDInput
          label="Nombre del módulo"
          name="nombre"
          value={form.nombre || ""}
          onChange={handleChange}
        />
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