import { useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

function Type_movCreateModal({ onSave, onCancel }) {

  const [form, setForm] = useState({
    nombre_tipo: "",
    descripcion: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };


  return (
    <form onSubmit={handleSubmit}>

      <MDTypography variant="h6" mb={3}>
        Registrar tipo movimiento
      </MDTypography>

      <MDBox mb={2}>
        <MDInput
          label="Tipo de movimiento"
          name="nombre_tipo"
          value={form.nombre_tipo}
          onChange={handleChange}
          required
          fullWidth
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Descripción"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          required
          fullWidth
        />
      </MDBox>


      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={onCancel} color="secondary" variant="text">
          Cancelar
        </MDButton>

        <MDButton color="success" variant="gradient" type="submit">
          Registrar
        </MDButton>
      </MDBox>

    </form>
  );
}

export default Type_movCreateModal;