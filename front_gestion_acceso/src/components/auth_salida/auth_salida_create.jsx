import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { alerts } from "@/hooks/alerts";

function Auth_salidaCreateModal({ onSave, onCancel }) {

  const [nomb_user, setNomb_user] = useState([]);
  const [equipos_sede, setEquipos_sede] = useState([]);
  const [tiposMovimiento, setTiposMovimiento] = useState([]);

  const [form, setForm] = useState({
    serial: "",
    categoria: "",
    nombre_usuario: "",
    equipo_id: 0,
    usuario_id_autoriza: 0,
    tipo_id: null,
    destino: "",
    motivo: "",
    estado: false,
    fecha_autorizacion: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "serial") {
      const equipoEncontrado = equipos_sede.find(
        eq => eq.serial === value
      );

      if (equipoEncontrado) {
        setForm(prev => ({
          ...prev,
          serial: value,
          categoria: equipoEncontrado.nombre_categoria,
          equipo_id: equipoEncontrado.id_equipo_sede
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

  useEffect(() => {
    apiFetch("type/all-movements-types")
      .then((data) => {
        const tipos = Array.isArray(data) ? data : [];
        setTiposMovimiento(tipos);

        const tipoSalida = tipos.find((tipo) =>
          String(tipo.nombre_tipo || "").toLowerCase().includes("salida")
        );

        if (tipoSalida) {
          setForm((prev) => ({ ...prev, tipo_id: tipoSalida.id_tipo }));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();

      if (!form.usuario_id_autoriza) {
        alerts.warning("Debes seleccionar el usuario que autoriza.");
        return;
      }

      if (!form.equipo_id) {
        alerts.warning("Debes seleccionar un serial de equipo valido.");
        return;
      }

      if (!form.tipo_id) {
        const tipoSalida = tiposMovimiento.find((tipo) =>
          String(tipo.nombre_tipo || "").toLowerCase().includes("salida")
        );

        if (!tipoSalida?.id_tipo) {
          alerts.warning("No hay un tipo de movimiento configurado para salida.");
          return;
        }
      }

      if (!form.destino || form.destino.trim().length < 3) {
        alerts.warning("El destino debe tener minimo 3 caracteres.");
        return;
      }

      if (!form.motivo || form.motivo.trim().length < 3) {
        alerts.warning("El motivo debe tener minimo 3 caracteres.");
        return;
      }

      const now = new Date();

      const fecha_actual =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");

      const data = {
        equipo_id: form.equipo_id,
        usuario_id_autoriza: form.usuario_id_autoriza,
        tipo_id: form.tipo_id || tiposMovimiento.find((tipo) =>
          String(tipo.nombre_tipo || "").toLowerCase().includes("salida")
        )?.id_tipo,
        destino: form.destino,
        motivo: form.motivo,
        estado: form.estado,
        fecha_autorizacion: fecha_actual
      };
      onSave(data);
    }}>

      <MDTypography variant="h6" mb={3}>
        Registro autorización
      </MDTypography>

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

        <MDButton sx={{background: "green"}} variant="gradient" type="submit">
          Registrar
        </MDButton>
      </MDBox>

    </form>
  );
}

export default Auth_salidaCreateModal;
