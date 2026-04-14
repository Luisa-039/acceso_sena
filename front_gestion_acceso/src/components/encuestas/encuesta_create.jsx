import { useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";
import Rating from "@mui/material/Rating";

function EncuestaCreateModal({ onSave, onCancel }) {

  const [form, setForm] = useState({
    calificacion: 0,
    observacion: "",
    estado_encuesta: true,
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>

      <MDBox
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >

      <MDTypography variant="h6" mb={3} align="center">
        Encuesta de satisfacción
      </MDTypography>

      <MDBox
        mb={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 420,
        }}
      >
        <MDTypography variant="button" fontWeight="regular" mb={1}>
          ¿Como calificaría su experiencia?
        </MDTypography>
        <Rating
          name="calificacion"
          value={Number(form.calificacion) || 0}
          onChange={(_, newValue) => {
            setForm((prev) => ({ ...prev, calificacion: newValue || 0 }));
          }}
          max={5}
        />
      </MDBox>

      <MDBox mb={2} sx={{ width: "100%", maxWidth: 420 }}>
        <MDInput
          label="Sugerencias u observaciones"
          name="observacion"
          value={form.observacion}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={onCancel} color="secondary" variant="text">
          Cancelar
        </MDButton>

        <MDButton color="success" variant="gradient" type="submit">
          Enviar
        </MDButton>
      </MDBox>

      </MDBox>

    </form>
  );
}

export default EncuestaCreateModal;