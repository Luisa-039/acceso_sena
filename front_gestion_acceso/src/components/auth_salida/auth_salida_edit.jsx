import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import MDInput from "@/components/MDInput";
import MDButton from "@/components/MDButton";
import { apiFetch } from "@/services/api";
import MDTypography from "@/components/MDTypography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

export default function Auth_salidaEditModal({ onCancel, auth_salida, onSave }) {

  const [nomb_user, setNomb_user] = useState([]);
  const [equipos_sede, setEquipos_sede] = useState([]);

  const [form, setForm] =
    useState({
      serial: "",
      categoria: "",
      nombre_usuario: "",
      equipo_id: 0,
      usuario_id_autoriza: 0,
      destino: "",
      motivo: "",
    });

    
    useState(()=> {
      if (auth_salida){
     setForm({
      serial: auth_salida.serial,
      categoria: auth_salida.categoria,
      nombre_usuario: auth_salida.nomb_user,
      equipo_id: auth_salida.equipo_id,
      usuario_id_autoriza: auth_salida.usuario_id_autoriza,
      destino: auth_salida.destino,
      motivo: auth_salida.motivo,
     }) 
    }});


  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

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
    apiFetch("users/all-except-admins")
      .then(data => {

        if (Array.isArray(data)) {
          setNomb_user(data);
        }
        else if (data.nomb_user) {
          setNomb_user(data.nomb_user);
        }
      })
      .catch(err => console.error(err));
  }, []);


  useEffect(() => {
    apiFetch("equipments_sede/all-equips_sede")
      .then(data => {

        if (Array.isArray(data)) {
          setEquipos_sede(data);
        }
        else if (data.equipos_sede) {
          setEquipos_sede(data.equipos_sede);
        }
      })
      .catch(err => console.error(err));
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar autorización</MDTypography>

      <MDBox mb={2}>
        <Autocomplete
          options={Array.isArray(nomb_user) ? nomb_user : []}
          getOptionLabel={(option) => option.nombre_usuario || ""}
          value={
            nomb_user.find((u) => u.id_usuario === form.usuario_id_autoriza) || null
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
        <MDInput
          label="Motivo"
          name="motivo"
          value={form.motivo || ""}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Destino"
          name="destino"
          value={form.destino || ""}
          onChange={handleChange}
        />
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