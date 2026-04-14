import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import { apiFetch } from "@/services/api";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import MDTypography from "@/components/MDTypography";


export default function PersonEditModal({ onCancel, equipement, onSave }) {
  const [form, setForm] = useState({
    persona_id: 0, categoria_id: "",
    marca_modelo: "", codigo_barras_inv: "", serial: "", descripcion: ""
  });

  //const [propietario, setPropietario] = useState([]);
  const [categoria, setCategoria] = useState([]);

  useEffect(() => {
    apiFetch("categoria/all/categories")
      .then(data => {
        if (Array.isArray(data)) {
          setCategoria(data);
        }
        else if (data.categoria) {
          setCategoria(data.categoria);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (equipement) {
      setForm({
        persona_id: equipement.persona_id,
        categoria_id: equipement.categoria_id,
        marca_modelo: equipement.marca_modelo,
        codigo_barras_inv: equipement.codigo_barras_inv,
        serial: equipement.serial,
        descripcion: equipement.descripcion
      });
    }
  }, [equipement]);

  // useEffect(() => {
  //   apiFetch("person/all/person")
  //     .then(data => {

  //       if (Array.isArray(data)) {
  //         setPropietario(data);
  //       }
  //       else if (data.propietario) {
  //         setPropietario(data.propietario);
  //       }
  //     })
  //     .catch(err => console.error(err));
  // }, []);


  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar equipo</MDTypography>

      {/* actualizar nombre  */}
      {/*
       <MDBox mb={2}>
        <MDInput
          select
          label="Propietario"
          name="persona_id"
          value={form.persona_id}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          <option value="">Seleccione nombre</option>

          {Array.isArray(propietario) &&
            propietario.map((prop) => (
              <option key={prop.id_persona} value={prop.id_persona}>
                {prop.nombre_completo}
              </option>
            ))}
        </MDInput>
      </MDBox> */}

      <MDBox mb={2}>
        <FormControl size="md">
          <InputLabel id="categoria-label">Tipo equipo</InputLabel>
          <Select
            label="categoria-label"
            name="categoria_id"
            value={form.categoria_id}
            onChange={handleChange}
            sx={{ minWidth: 255, height: 40 }}
            SelectProps={{ native: true }}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="">Seleccione tipo equipo</MenuItem>
            {Array.isArray(categoria) &&
              categoria.map((cat) => (
                <MenuItem key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.nombre_categoria}
                </MenuItem>
              ))}
          </Select>

        </FormControl>
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="N. serie"
          name="serial"
          value={form.serial}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="marca_modelo"
          name="marca_modelo"
          value={form.marca_modelo}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Descripción"
          name="descripcion"
          value={form.descripcion}
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