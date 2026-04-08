import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api"; // ajusta si la ruta cambia
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

function CityCreateModal({ onSave, oncancel }) {

  const [form, setForm] = useState({
    departamento_id: 0,
    nombre: "",
    codigo: "",
    estado: true,
  });

  const [departamentos, setDepartamentos] = useState([]);

  useEffect(() => {
    apiFetch("deparment/all-departments")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
          setDepartamentos(data);
        }
        // Si devuelve paginación:
        else if (data.departamentos) {
          setDepartamentos(data.departamentos);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>

      <MDTypography variant="h6" mb={3}>
        Registrar ciudad
      </MDTypography>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Nombre"
          name="nombre"
          value={form.nombre || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Codigo"
          name="codigo"
          value={form.codigo || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          select
          label="Departamento"
          name="departamento_id"
          value={form.departamento_id || ""}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="">Seleccione el departamento</option>

          {Array.isArray(departamentos) &&
            departamentos.map((departamento) => (
              <option key={departamento.id_departamento} value={departamento.id_departamento}>
                {departamento.nombre}
              </option>
            ))}
        </MDInput>
      </MDBox>

      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={oncancel} color="secondary" variant="text">
          Cancelar
        </MDButton>

        <MDButton color="success" variant="gradient" type="submit">
          Registrar
        </MDButton>
      </MDBox>

    </form>
  );
}

export default CityCreateModal;