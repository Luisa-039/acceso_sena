import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";
import { apiFetch } from "@/services/api";

export default function CentroEditModal({ onCancel, centro, onSave }) {
  const [form, setForm] = useState({
    codigo_centro: "",
    nombre: "", estado: true
  });

  useEffect(() => {
    if (centro) {
      setForm({
        codigo_centro: centro.codigo_centro,
        ciudad_id: centro.ciudad_id,
        nombre: centro.nombre,
        estado: centro.estado
      });
    }
  }, [centro]);

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



  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar Centro</MDTypography>

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
          <option value="">Seleccione el centro</option>
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
        <MDButton color="success" type="submit" variant="gradient">
          Actualizar
        </MDButton>
      </MDBox>
    </form>
  );
}