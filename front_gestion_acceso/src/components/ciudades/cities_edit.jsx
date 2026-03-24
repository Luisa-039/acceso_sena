import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import { apiFetch } from "@/services/api";
import MDTypography from "@/components/MDTypography";

export default function CityEditModal({ oncancel, cities, onSave }) {
  const [form, setForm] = useState({ nombre: "", codigo: "", departamento_id: 0 });


  const [departamentos, setDepartamentos] = useState([]);

  useEffect(() => {
    apiFetch("deparment/all-departments")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
          const lista = Array.isArray(data) ? data : data.departamentos || [];
          setDepartamentos(lista);

          // Si ya está la ciudad, aseguramos que el form tenga la sede correcta
          if (cities) {
            setForm(prev => ({ ...prev, departamento_id: cities.departamento_id }));
          }
        }
        // Si devuelve paginación:
        else if (data.departamentos) {
          setDepartamentos(data.departamentos);
        }
      })
      .catch(err => console.error(err));
  }, []);


  useEffect(() => {
    if (cities) {
      setForm({
        nombre: cities.nombre,
        codigo: cities.codigo,
        departamento_id: cities.departamento_id
      });
    }
  }, [cities]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar ciudad</MDTypography>
      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Código"
          name="codigo"
          value={form.codigo}
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
          {departamentos.map((departamentos) => (
            <option key={departamentos.id_departamento} value={departamentos.id_departamento}>
              {departamentos.nombre}
            </option>
          ))}
        </MDInput>
      </MDBox>

      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={oncancel} color="secondary" variant="text">
          Cancelar
        </MDButton>
        <MDButton color="info" type="submit" variant="gradient">
          Actualizar
        </MDButton>
      </MDBox>
    </form>
  );
}