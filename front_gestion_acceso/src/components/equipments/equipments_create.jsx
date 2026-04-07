import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";

function EquipoCreateModal({ onSave, onCancel, includePersona = true }) {

  const [propietario, setPropietario] = useState([]);
  const [categoria, setCategoria] = useState([]);

  const [form, setForm] = useState({
    persona_id: 0,
    categoria_id: "",
    marca_modelo: "",
    foto_path: null,
    codigo_barras_inv: "",
    serial: "",
    descripcion: "",
    estado: true,
    fecha_registro: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };


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
    if (!includePersona) return;

    apiFetch("person/all/person")
      .then(data => {

        if (Array.isArray(data)) {
          setPropietario(data);
        }
        else if (data.propietario) {
          setPropietario(data.propietario);
        }
      })
      .catch(err => console.error(err));
  }, [includePersona]);

  const [preview, setPreview] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // funciones cámara
  const startCamera = async () => {
    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      videoRef.current.srcObject = stream;

    } catch (error) {
      console.error("No se pudo acceder a la cámara", error);
    }
  };

  const takePhoto = () => {

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {

      const file = new File([blob], "equipo.jpg", {
        type: "image/jpeg"
      });

      setForm(prev => ({
        ...prev,
        foto_path: file
      }));

      setPreview(URL.createObjectURL(blob));

    }, "image/jpeg");
  };

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

        const data = new FormData();

        if (includePersona) {
          data.append("persona_id", Number(form.persona_id));
        }
        data.append("categoria_id", form.categoria_id);
        data.append("serial", form.serial);
        data.append("marca_modelo", form.marca_modelo);
        if (form.descripcion?.trim()) {
          data.append("descripcion", form.descripcion.trim());
        }
        data.append("codigo_barras_inv", form.codigo_barras_inv);
        data.append("fecha_registro", fecha_actual);
        data.append("estado", true);

        if (form.foto_path) {
          data.append("foto_path", form.foto_path);
        }

        onSave(data);
      }}
    >

      <MDTypography variant="h6" mb={3}>
        Registrar equipo
      </MDTypography>

      <MDBox container spacing={3}>

        {/* FORMULARIO */}
        <MDBox item xs={12} md={6}>
          {includePersona && (
            <MDBox mb={2}>
              <Autocomplete
                options={Array.isArray(propietario) ? propietario : []}
                getOptionLabel={(option) => option.nombre_completo || ""}
                value={
                  propietario.find((p) => p.id_persona === form.persona_id) || null
                }
                onChange={(event, newValue) => {
                  setForm({
                    ...form,
                    persona_id: newValue ? newValue.id_persona : "",
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Propietario"
                    variant="outlined"
                    fullWidth
                  />
                )}
              />
            </MDBox>
          )}

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

          <MDBox mb={2}>
            <MDInput
              fullWidth
              autoFocus
              label="Cod. barras"
              name="codigo_barras_inv"
              value={form.codigo_barras_inv}
              onChange={handleChange}
            />
          </MDBox>

        </MDBox>

        {/* CÁMARA */}
        <MDBox item xs={12} md={6}>

          <MDBox display="flex" flexDirection="column" alignItems="flex-start" sx={{ minHeight: "320px" }}
          >

            <MDButton onClick={startCamera}>
              Abrir cámara
            </MDButton>

            <video
              ref={videoRef}
              autoPlay
              style={{
                width: "100%",
                maxWidth: "320px",
                marginTop: "10px",
                borderRadius: "10px",
                height: "240px",
                backgroundColor: "#000000"
              }}
            />

            <MDButton
              onClick={takePhoto}
              sx={{ mt: 2 }}
            >
              Tomar foto
            </MDButton>

            <canvas
              ref={canvasRef}
              style={{ display: "none" }} />

            {preview && (
              <MDBox mt={2}>
                <img
                  src={preview}
                  alt="Foto equipo"
                  style={{
                    width: "300px",
                    borderRadius: "10px"
                  }}
                />
              </MDBox>
            )}

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

export default EquipoCreateModal;