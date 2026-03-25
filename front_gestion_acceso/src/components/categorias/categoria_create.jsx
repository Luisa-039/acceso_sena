import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

function CategoriaCreateModal({ onSave, onCancel }) {

  const [form, setForm] = useState({
    nombre_categoria: "",
    descripcion: "",
    estado: true
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>

      <MDTypography variant="h6" mb={3}>
        Registrar categoría
      </MDTypography>

      <MDBox mb={2}>
        <MDInput
          label="Nombre categoría"
          name="nombre_categoria"
          value={form.nombre_categoria}
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

        <MDButton color="info" variant="gradient" type="submit">
          Registrar
        </MDButton>
      </MDBox>

    </form>
  );
}

export default CategoriaCreateModal;