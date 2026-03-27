import { useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

function DepartmentCreateModal({ onSave, onCancel }) {

  const [form, setForm] = useState({
    nombre: "",
    codigo: ""
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
        Registrar departamento
      </MDTypography>

       <MDBox mb={2}>
        <MDInput
          label="Código"
          name="codigo"
          value={form.codigo}
          onChange={handleChange}
          required
          fullWidth
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          required
          fullWidth
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

export default DepartmentCreateModal;