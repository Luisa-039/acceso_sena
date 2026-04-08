import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";


function Equipo_sedeCreateModal({ onSave, onCancel }) {

  const [nom_sede, setNom_sede] = useState([]);

  const [form, setForm] = useState({
    sede_id: 0,
    categoria_id: "",
    ubicacion: "",
    marca: "",
    modelo: "",
    codigo_barras_equipo: "",
    serial: "",
    descripcion: "",
    estado: "",
    fecha_registro: "",
  });

  const [categoria, setCategoria] = useState([]);
  const [area, setArea] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  useEffect(() => {
    apiFetch("area/all/areas")
      .then(data => {
        if (Array.isArray(data)) {
          setArea(data);
        }
        else if (data.areas) {
          setArea(data.areas);
        }
      })
      .catch(err => console.error(err));
  }, []);

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
    apiFetch("sede/all/sedes")
      .then(data => {

        if (Array.isArray(data)) {
          setNom_sede(data);
        }
        else if (data.nom_sede) {
          setNom_sede(data.nom_sede);
        }
      })
      .catch(err => console.error(err));
  }, []);

 
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        const now = new Date();
        const fecha_actual =
          now.getFullYear() + "-" +
          String(now.getMonth() + 1).padStart(2, "0") + "-" +
          String(now.getDate()).padStart(2, "0") + " " +
          String(now.getHours()).padStart(2, "0") + ":" +
          String(now.getMinutes()).padStart(2, "0") + ":" +
          String(now.getSeconds()).padStart(2, "0");

        const data = {
          sede_id: Number(form.sede_id),
          categoria_id: form.categoria_id,
          area_id: form.area_id,
          serial: form.serial,
          marca: form.marca,
          modelo: form.modelo,
          descripcion: form.descripcion,
          codigo_barras_equipo: form.codigo_barras_equipo,
          fecha_registro: fecha_actual,
          estado: "Disponible"
        };
        onSave(data);
      }}
    >

    <MDBox>
      <MDTypography variant="h6" mb={3}>
        Registrar equipo
      </MDTypography>

        <MDBox>
          <MDBox mb={2}>
            <Autocomplete
              options={Array.isArray(nom_sede) ? nom_sede : []}
              getOptionLabel={(option) => option.nombre || ""}
              value={
                nom_sede.find((s) => s.id_sede === form.sede_id) || null
              }
              onChange={(event, newValue) => {
                setForm({
                  ...form,
                  sede_id: newValue ? newValue.id_sede : "",
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="nombre sede"
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </MDBox>

          <MDBox mb={2}>
            <Autocomplete
              options={Array.isArray(area) ? area : []}
              getOptionLabel={(option) => option.nombre_area || ""}
              value={
                area.find((a) => a.id_area === form.area_id) || null
              }
              onChange={(event, newValue) => {
                setForm({
                  ...form,
                  area_id: newValue ? newValue.id_area : "",
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="nombre area"
                  variant="outlined"
                  fullWidth
                />
              )}
            />
          </MDBox>

          

          <MDBox mb={2}>
            <FormControl size="md">
              <InputLabel id="categoria-label">Tipo equipo</InputLabel>
              <Select
                label="categoria-label"
                name="categoria_id"
                value={form.categoria_id}
                onChange={handleChange}
                sx={{ minWidth: 300, height: 40 }}
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
              label="marca"
              name="marca"
              value={form.marca}
              onChange={handleChange}
            />
          </MDBox>

          <MDBox mb={2}>
            <MDInput
              fullWidth
              label="modelo"
              name="modelo"
              value={form.modelo}
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

          <MDBox mb={2}>
            <MDInput
              fullWidth
              autoFocus
              label="Cod. barras"
              name="codigo_barras_equipo"
              value={form.codigo_barras_equipo}
              onChange={handleChange}
            />
          </MDBox>
        </MDBox>
      </MDBox>

      <MDBox
        display="flex"
        justifyContent="flex-end"
        gap={1}
        mt={3}
      >
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

export default Equipo_sedeCreateModal;