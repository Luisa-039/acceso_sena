import { useEffect, useState } from "react";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import { apiFetch } from "@/services/api";
import MDTypography from "@/components/MDTypography";

export default function UserEditModal({ onCancel, user, onSave }) {
  const [form, setForm] = useState({ nombre_usuario: "", email: "", documento: "", telefono: "", sede_id: 0 });


  const [sedes, setSedes] = useState([]);

  useEffect(() => {
    apiFetch("sede/all/sedes")
      .then(data => {

        // Si tu backend devuelve lista directa:
        if (Array.isArray(data)) {
          const lista = Array.isArray(data) ? data : data.sedes || [];
          setSedes(lista);

          // Si ya hay usuario, aseguramos que el form tenga la sede correcta
          if (user) {
            setForm(prev => ({ ...prev, sede_id: user.sede_id }));
          }
        }
        // Si devuelve paginación:
        else if (data.sedes) {
          setSedes(data.sedes);
        }
      })
      .catch(err => console.error(err));
  }, []);


  useEffect(() => {
    if (user) {
      setForm({
        nombre_usuario: user.nombre_usuario,
        documento: user.documento,
        email: user.email,
        telefono: user.telefono,
        sede_id: user.sede_id
      });
    }
  }, [user]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <MDTypography variant="h6" mb={3}>Editar usuario</MDTypography>
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
          select
          label="Sede"
          name="sede_id"
          value={form.sede_id || ""}
          onChange={handleChange}
          SelectProps={{ native: true }}
          InputLabelProps={{ shrink: true }}
        >
          <option value="">Seleccione la sede</option>
          {sedes.map((sedes) => (
            <option key={sedes.id_sede} value={sedes.id_sede}>
              {sedes.nombre}
            </option>
          ))}
        </MDInput>
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
          label="Email"
          name="email"
          value={form.email}
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