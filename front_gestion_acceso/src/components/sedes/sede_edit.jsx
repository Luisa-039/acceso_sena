import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import { apiFetch } from "@/services/api";
import MDTypography from "@/components/MDTypography";

export default function SedeEditModal({ onCancel, sede, onSave }) {
  const [form, setForm] = useState({
    codigo_sede: "", nombre: "", direccion: "",
    centro_id: 0
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

  useEffect(() => {
    if (sede) {
      setForm({
        //codigo_sede: sede.codigo_sede,
        nombre: sede.nombre,
        direccion: sede.direccion,
        centro_id: sede.centro_id,
      });
    }
  }, [sede]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar sede</MDTypography>

      {/* <MDBox mb={2}>
        <MDInput
          label="Código sede"
          name="codigo_sede"
          value={form.codigo_sede || ""}
          onChange={handleChange}
        />
      </MDBox> */}
      
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