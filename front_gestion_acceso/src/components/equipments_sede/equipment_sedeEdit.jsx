import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import { apiFetch } from "@/services/api";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import MDTypography from "@/components/MDTypography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export default function EquipoEdit_sedeModal({ onCancel, equipement_sede, onSave }) {
  const [form, setForm] = useState({
    sede_id: 0,
    categoria_id: "",
    ubicacion: "",
    area_id: "",
    marca: "",
    modelo: "",
    codigo_barras_equipo: "",
    serial: "",
    descripcion: ""
  });

  const [nomb_sede, setNomb_sede] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [area, setArea] = useState([]);

  useEffect(() => {
    if (equipement_sede) {
      setForm({
        sede_id: equipement_sede.sede_id,
        categoria_id: equipement_sede.categoria_id,
        marca: equipement_sede.marca || "",
        modelo: equipement_sede.modelo || "",
        codigo_barras_equipo: equipement_sede.codigo_barras_equipo,
        serial: equipement_sede.serial,
        descripcion: equipement_sede.descripcion,
        area_id: equipement_sede.area_id || ""
      });
    }
  }, [equipement_sede]);

  useEffect(() => {
    apiFetch("sede/all/sedes")
      .then(data => {

        if (Array.isArray(data)) {
          setNomb_sede(data);
        }
        else if (data.nomb_sede) {
          setNomb_sede(data.nomb_sede);
        }
      })
      .catch(err => console.error(err));
  }, []);

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
          setCategorias(data);
        }
        else if (data.categorias) {
          setCategorias(data.categorias);
        }
      })
      .catch(err => console.error(err));
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
      <MDTypography variant="h6" mb={3}>Editar equipo</MDTypography>

      {/* actualizar nombre  */}

      <MDBox mb={2}>
        <Autocomplete
          options={Array.isArray(nomb_sede) ? nomb_sede : []}
          getOptionLabel={(option) => option.nombre || ""}
          value={
            nomb_sede.find((s) => s.id_sede === form.sede_id) || null
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
        <FormControl fullWidth size="medium">
          <InputLabel id="tipo-equipo-label">Tipo equipo</InputLabel>
          <Select
            labelId="tipo-equipo-label"
            label="Tipo equipo"
            name="categoria_id"
            value={form.categoria_id || ""}
            onChange={handleChange}
            sx={{
              minHeight: 44,
              "& .MuiSelect-select": {
                fontSize: "1rem",
              },
            }}
          >
            <MenuItem value="">Seleccione tipo equipo</MenuItem>
            {categorias.map((cat) => (
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
          value={form.serial || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Marca"
          name="marca"
          value={form.marca || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Modelo"
          name="modelo"
          value={form.modelo || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          fullWidth
          label="Descripción"
          name="descripcion"
          value={form.descripcion || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={onCancel} color="secondary" variant="text">
          Cancelar
        </MDButton>
        <MDButton color="info" type="submit" variant="gradient">
          Actualizar
        </MDButton>
      </MDBox>
    </form>
  );
}