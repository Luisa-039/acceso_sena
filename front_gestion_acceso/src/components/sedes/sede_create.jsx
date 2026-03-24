import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

function SedeCreateModal({ onSave, oncancel }) {

  const [form, setForm] = useState({
    codigo_sede: "",
    nombre: "",
    direccion: "",
    centro_id: 0,
    estado: true
  });

  const [centros, setCentros] = useState([]);

  useEffect(() => {
    apiFetch("center/all/center")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
          setCentros(data);
        }
        // Si devuelve paginación:
        else if (data.centros) {
          setCentros(data.centros);
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
        Registrar sede
      </MDTypography>

      <MDBox mb={2}>
        <MDInput
          label="Código sede"
          name="codigo_sede"
          value={form.codigo_sede || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Nombre sede"
          name="nombre"
          value={form.nombre || ""}
          onChange={handleChange}
        />
      </MDBox>

       <MDBox mb={2}>
        <MDInput
          label="Dirección"
          name="direccion"
          value={form.direccion || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          select
          label="Centro"
          name="centro_id"
          value={form.centro_id || ""}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
           sx={{ width: 200 }}
        >
          <option value="">Seleccione el centro</option>

          {Array.isArray(centros) &&
            centros.map((centro) => (
              <option key={centro.id_centro} value={centro.id_centro}>
                {centro.nombre}
              </option>
            ))}
        </MDInput>
      </MDBox>

      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={oncancel} color="secondary" variant="text">
          Cancelar
        </MDButton>

        <MDButton color="info" variant="gradient" type="submit">
          Registrar
        </MDButton>
      </MDBox>

    </form>
  );
}

export default SedeCreateModal;