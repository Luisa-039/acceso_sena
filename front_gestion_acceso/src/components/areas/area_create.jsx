import { useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

function AreaCreateModal({ onSave, onCancel }) {

  const [form, setForm] = useState({
    nombre_area: "",
    estado: true
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>

      <MDTypography variant="h6" mb={3}>
        Registrar área
      </MDTypography>

      <MDBox mb={2}>
        <MDInput
          label="Nombre área"
          name="nombre_area"
          value={form.nombre_area}
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

export default AreaCreateModal;