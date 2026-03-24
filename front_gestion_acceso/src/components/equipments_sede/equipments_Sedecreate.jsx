import { useState, useEffect } from "react";
import { apiFetch } from "@/services/api";
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";
import MDInput from "@/components/MDInput";
import MDTypography from "@/components/MDTypography";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";


function Equipo_sedeCreateModal({ onSave, oncancel }) {

  const [nom_sede, setNom_sede] = useState([]);

  const [form, setForm] = useState({
    sede_id: 0,
    categoria: "",
    marca_modelo: "",
    // foto_path: null,
    codigo_barras_equipo: "",
    serial: "",
    descripcion: "",
    estado: "",
    fecha_registro: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

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

  // para abrir cámara y tomar foto

  // const [preview, setPreview] = useState(null);

  // const videoRef = useRef(null);
  // const canvasRef = useRef(null);

  // // funciones cámara
  // const startCamera = async () => {
  //   try {

  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: true
  //     });

  //     videoRef.current.srcObject = stream;

  //   } catch (error) {
  //     console.error("No se pudo acceder a la cámara", error);
  //   }
  // };

  // const takePhoto = () => {

  //   const video = videoRef.current;
  //   const canvas = canvasRef.current;

  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;

  //   const ctx = canvas.getContext("2d");

  //   ctx.drawImage(video, 0, 0);

  //   canvas.toBlob((blob) => {

  //     const file = new File([blob], "equipo.jpg", {
  //       type: "image/jpeg"
  //     });

  //     setForm(prev => ({
  //       ...prev,
  //       foto_path: file
  //     }));

  //     setPreview(URL.createObjectURL(blob));

  //   }, "image/jpeg");
  // };

  const tiposEquipo = [
    { value: "Portátil", label: "Portátil" },
    { value: "PC Mesa", label: "Pc mesa" },
    { value: "Herramienta", label: "Herramienta" },
    { value: "Otro", label: "Otro" }
  ];

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
          categoria: form.categoria,
          serial: form.serial,
          marca_modelo: form.marca_modelo,
          descripcion: form.descripcion,
          codigo_barras_equipo: form.codigo_barras_equipo,
          fecha_registro: fecha_actual,
          estado: "Disponible"
        };
        onSave(data);
      }}
    >

      <MDTypography variant="h6" mb={3}>
        Registrar equipo
      </MDTypography>

      <MDBox>

        {/* FORMULARIO */}
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
            <FormControl fullWidth>
              <InputLabel>Tipo equipo</InputLabel>
              <Select
                label="Tipo equipo"
                name="categoria"
                value={form.categoria || ""}
                onChange={handleChange}
                sx={{ height: 45 }}
              >
                {tiposEquipo.map((tipo) => (
                  <MenuItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
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
              name="codigo_barras_equipo"
              value={form.codigo_barras_equipo}
              onChange={handleChange}
            />
          </MDBox>

        </MDBox>

        {/* CÁMARA */}
        {/* <MDBox item xs={12} md={6}>

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
        </MDBox> */}
      </MDBox>

      <MDBox
        display="flex"
        justifyContent="flex-end"
        gap={1}
        mt={3}
      >
        <MDButton onClick={oncancel} color="secondary" variant="text">
          Cancelar
        </MDButton>

        <MDButton color="info" variant="gradient" type="submit">
          Registrar
        </MDButton>
      </MDBox>

    </form>
  );
}

export default Equipo_sedeCreateModal;