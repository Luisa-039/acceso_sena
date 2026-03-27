import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import MDInput from "@/components/MDInput";
import MDButton from "@/components/MDButton";
import { apiFetch } from "@/services/api";
import MDTypography from "@/components/MDTypography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";

export default function MovementsEditModal({ onCancel, movements, onSave }) {

  //validar si los datos los trae automáticamente

  const [nomb_user, setNomb_user] = useState([]);
  const [equipos_sede, setEquipos_sede] = useState([]);

  const [form, setForm] =
    useState({
      serial: "",
      categoria: "",
      nombre_usuario: "",
      equipo_id: 0,
      usuario_registra: 0,
      autorizacion_id: 0,
      tipo_movimiento: "",
      fecha_movimiento: "",
    });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({...prev, [name]: value }));

    if (name === "serial") {
      const equipoSede = equipos_sede.find(
        eq => eq.serial === value
      );

      if (equipoSede) {
        setForm(prev => ({
          ...prev,
          serial: value,
          categoria: equipoSede.categoria,
          equipo_id: equipoSede.id_equipo_sede
        }));
      }
    }
  };

 

  useEffect(() => {
    console.log("MOVEMENT EDIT:", movements);
    if (movements) {
      setForm({
        tipo_movimiento: movements.tipo_movimiento,
      });
    }
  }, [movements]);

  function handleSubmit(e) {
    e.preventDefault();

    const data = {
      tipo_movimiento: form.tipo_movimiento,
    };

    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar movimiento</MDTypography>

      <MDBox mb={2}>
        <MDInput
          label="Autorización N."
          name="autorizacion_id"
          value={form.autorizacion_id || ""}
          onChange={handleChange}
          fullWidth
        />
      </MDBox>

      <MDBox mb={2}>
        <Autocomplete
          options={Array.isArray(nomb_user) ? nomb_user : []}
          getOptionLabel={(option) => option.nombre_usuario || ""}
          value={
            nomb_user.find((u) => u.id_usuario === form.usuario_registra) || null
          }
          onChange={(event, newValue) => {
            setForm(prev => ({
              ...prev,
              usuario_id_autoriza: newValue ? newValue.id_usuario : null,
              nombre_usuario: newValue ? newValue.nombre_usuario : ""
            }));
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Nombre usuario"
              variant="outlined"
              fullWidth
            />
          )}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="serial equipo"
          name="serial"
          value={form.serial || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Tipo equipo"
          name="categoria"
          value={form.categoria || ""}
          InputProps={{ readOnly: true }}
        />
      </MDBox>

      <MDBox mb={2}>
        <FormControl size="md">
          <InputLabel id="tipo-equipo-label">Tipo Movimiento</InputLabel>
          <Select
            labelId="tipo_movimiento-label"
            name="tipo_movimiento"
            value={form.tipo_movimiento || ""}
            label="Tipo equipo"
            onChange={handleChange}
            sx={{ height: 40, width: 255 }}
          >
            <MenuItem value="Entrada">Entrada </MenuItem>
            <MenuItem value="Salida">Salida</MenuItem>
            <MenuItem value="Traslado">Traslado</MenuItem>
          </Select>
        </FormControl>
      </MDBox>
      <MDBox display="flex" justifyContent="flex-end" gap={1}>
        <MDButton onClick={onCancel} color="secondary" variant="text">
          Cancelar
        </MDButton>
        <MDButton sx={{background: "green"}} type="submit" variant="gradient">
          Actualizar
        </MDButton>
      </MDBox>

    </form>
  );
}