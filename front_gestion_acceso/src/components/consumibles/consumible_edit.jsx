import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import { apiFetch } from "@/services/api";
import MDTypography from "@/components/MDTypography";

export default function SedeEditModal({ onCancel, consumible, onSave }) {
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


  useEffect(() => {
    if (consumible) {
      setForm({
        sede_id: consumible.sede_id,
        categoria_id: consumible.categoria_id,
        placa: consumible.placa,
        marca: consumible.marca,
        modelo: consumible.modelo,
        ubicacion: consumible.ubicacion,
        cantidad: consumible.cantidad,
        porcentaje_toner: consumible.porcentaje_toner
      });
    }
  }, [consumible]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar consumible</MDTypography>
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
        <MDButton color="success" type="submit" variant="gradient">
          Actualizar
        </MDButton>
      </MDBox>
    </form>
  );
}