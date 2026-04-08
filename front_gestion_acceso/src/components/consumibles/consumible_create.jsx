import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

function SedeCreateModal({ onSave, onCancel }) {

  const [form, setForm] = useState({
    sede_id: 0,
    categoria_id: 0,
    placa: "",
    marca: "",
    modelo: "",
    ubicacion: "",
    cantidad: 0,
    porcentaje_toner: 0,
    estado: true,
    fecha_registro: ""
  });

  const [sedes, setSedes] = useState([]);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    apiFetch("sede/all/sedes")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
          setSedes(data);
        }
        // Si devuelve paginación:
        else if (data.sedes) {
          setSedes(data.sedes);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    apiFetch("categoria/all/categories")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
          setCategorias(data);
        }
        // Si devuelve paginación:
        else if (data.categorias) {
          setCategorias(data.categorias);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const now = new Date();

  const fecha_actual =
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0") + " " +
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0") + ":" +
    String(now.getSeconds()).padStart(2, "0");


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value, fecha_registro: fecha_actual });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>

      <MDTypography variant="h6" mb={3}>
        Registrar consumible
      </MDTypography>

      <MDBox mb={2}>
        <MDInput
          select
          label="Sede"
          name="sede_id"
          value={form.sede_id || ""}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
        >
          <option value="">Seleccione la sede</option>

          {Array.isArray(sedes) &&
            sedes.map((sede) => (
              <option key={sede.id_sede} value={sede.id_sede}>
                {sede.nombre}
              </option>
            ))}
        </MDInput>
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          select
          label="Categoría"
          name="categoria_id"
          value={form.categoria_id || ""}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
        >
          <option value="">Seleccione la categoría</option>

          {Array.isArray(categorias) &&
            categorias.map((categoria) => (
              <option key={categoria.id_categoria} value={categoria.id_categoria}>
                {categoria.nombre_categoria}
              </option>
            ))}
        </MDInput>
      </MDBox>
      
      <MDBox mb={2}>
        <MDInput
          label="Ubicación"
          name="ubicacion"
          value={form.ubicacion || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Placa"
          name="placa"
          value={form.placa || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Marca"
          name="marca"
          value={form.marca || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
         <MDInput
          label="Modelo"
          name="modelo"
          value={form.modelo || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Cantidad"
          name="cantidad"
          value={form.cantidad || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Porcentaje toner (%)"
          name="porcentaje_toner"
          value={form.porcentaje_toner || ""}
          onChange={handleChange}
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

export default SedeCreateModal;