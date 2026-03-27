import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api"; // ajusta si la ruta cambia
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";

function UserCreateModal({ onSave, onCancel }) {

  const [form, setForm] = useState({
    nombre_usuario: "",
    rol_id: 0,
    email: "",
    documento: "",
    estado: true,
    telefono: "",
    pass_hash: "",
    sede_id: 0
  });

  const [sedes, setSedes] = useState([]);
  const [roles, setRoles] = useState([]);
  const isPasswordValid = form.pass_hash.length >= 9;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convertir a número si es rol o sede
    if (name === "rol_id" || name === "sede_id") {
      setForm({ ...form, [name]: Number(value) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

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
    apiFetch("rol/all/roles")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
            setRoles(data);
        }
        // Si devuelve paginación:
        else if (data.roles) {
          setRoles(data.roles);
        }
      })
      .catch(err => console.error(err));
  }, []);


  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>

      <MDTypography variant="h6" mb={3}>
        Registrar usuario
      </MDTypography>

      <MDBox mb={2}>
        <MDInput
          label="Nombre"
          name="nombre_usuario"
          value={form.nombre_usuario}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Documento"
          name="documento"
          value={form.documento}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          label="Teléfono"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
        type="email"
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          select
          label="Rol"
          name="rol_id"
          value={form.rol_id}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="">Seleccione el rol</option>

          {Array.isArray(roles) &&
            roles.map((roles) => (
              <option key={roles.id_rol} value={roles.id_rol}>
                {roles.nombre}
              </option>
            ))}
        </MDInput>
      </MDBox>

      <MDBox mb={2}>
        <MDInput
          type="password"
          label="Contraseña"
          name="pass_hash"
          value={form.pass_hash}
          onChange={handleChange}
          error={form.pass_hash.length > 0 && !isPasswordValid}
        />
      </MDBox>

      {/*  SELECT DE SEDES */}
      <MDBox mb={2}>
        <MDInput
          select
          label="Sede"
          name="sede_id"
          value={form.sede_id}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="">Seleccione una sede</option>

          {Array.isArray(sedes) &&
            sedes.map((sede) => (
              <option key={sede.id_sede} value={sede.id_sede}>
                {sede.nombre}
              </option>
            ))}
        </MDInput>
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

export default UserCreateModal;