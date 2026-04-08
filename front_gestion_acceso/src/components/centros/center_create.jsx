import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

function CentroCreateModal({ onSave, onCancel }) {

  const [form, setForm] = useState({
    codigo_centro: "",
    nombre: "",
    ciudad_id: "",
    estado: true
  });

  const [ciudades, setCiudades] = useState([]);

  useEffect(() => {
    apiFetch("cities/all/cities")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
          setCiudades(data);
        }
        else if (data.ciudades) {
          setCiudades(data.ciudades);
        } 
      })
      .catch(err => console.error("Error al traer ciudades:", err));
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "ciudad_id" ? Number(value) : value,
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>

      <MDTypography variant="h6" mb={3}>
        Registrar centro
      </MDTypography>

      <MDBox mb={2}>
        <MDInput
          label="Código centro"
          name="codigo_centro"
          value={form.codigo_centro || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Nombre centro"
          name="nombre"
          value={form.nombre || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          select
          label="Ciudad"
          name="ciudad_id"
          value={form.ciudad_id || ""}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
           sx={{ width: 200 }}
        >
          <option value="">Seleccione la ciudad</option>
          {Array.isArray(ciudades) &&
          ciudades.map((ciudad) => (
            <option key={ciudad.id_ciudad} value={ciudad.id_ciudad}>
              {ciudad.nombre}
            </option>
          ))}
        </MDInput>
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

export default CentroCreateModal;