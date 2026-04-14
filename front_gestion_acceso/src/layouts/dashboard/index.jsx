import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CircularProgress, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useReactToPrint } from "react-to-print";
import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { apiFetch } from "@/services/api";
import { useSede } from "@/context/sedeContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function getErrorMessage(err) {
  if (!err) return "No se pudieron cargar las metricas del dashboard";
  if (typeof err === "string") return err;
  if (err.detail) {
    if (typeof err.detail === "string") return err.detail;
    if (Array.isArray(err.detail)) return "Error de validacion en la solicitud";
  }
  if (err.message) return err.message;
  return "No se pudieron cargar las metricas del dashboard";
}

function DashboardPage() {
  const { effectiveSedeId, selectedSedeName } = useSede();
  const now = new Date();
  const consumiblesChartRef = useRef(null);
  const ingresosChartRef = useRef(null);
  const printContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [printPayload, setPrintPayload] = useState({ title: "", image: "", details: "" });
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [consumiblesSummary, setConsumiblesSummary] = useState({
    total: 0,
    activos: 0,
    inactivos: 0,
    por_categoria: [],
  });
  const [dailyEntries, setDailyEntries] = useState([]);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  }, [now]);

  const selectedAreaName = useMemo(() => {
    if (!selectedAreaId) return "Todas las areas";
    const found = areas.find((area) => Number(area.id_area) === Number(selectedAreaId));
    return found?.nombre_area || "Area seleccionada";
  }, [areas, selectedAreaId]);

  useEffect(() => {
    let isMounted = true;

    async function fetchAreas() {
      try {
        const result = await apiFetch("area/all/areas");
        if (!isMounted) return;
        const activeAreas = Array.isArray(result) ? result.filter((area) => area?.estado) : [];
        setAreas(activeAreas);
      } catch {
        if (!isMounted) return;
        setAreas([]);
      }
    }

    fetchAreas();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          month: String(selectedMonth),
          year: String(selectedYear),
        });

        if (effectiveSedeId) {
          params.append("sede_id", String(effectiveSedeId));
        }

        if (selectedAreaId) {
          params.append("area_id", String(selectedAreaId));
        }

        const [consumiblesResult, entriesResult] = await Promise.allSettled([
          apiFetch(`inv_consumibles/dashboard-summary${effectiveSedeId ? `?sede_id=${effectiveSedeId}` : ""}`),
          apiFetch(`access/dashboard-daily-entries?${params.toString()}`),
        ]);

        if (!isMounted) return;

        if (consumiblesResult.status === "fulfilled") {
          setConsumiblesSummary(consumiblesResult.value || {});
        }

        if (entriesResult.status === "fulfilled") {
          setDailyEntries(entriesResult.value?.entries || []);
        }

        if (consumiblesResult.status === "rejected" && entriesResult.status === "rejected") {
          const firstError = consumiblesResult.reason || entriesResult.reason;
          setError(getErrorMessage(firstError));
        } else if (consumiblesResult.status === "rejected") {
          setError(`Solo se cargaron ingresos diarios. ${getErrorMessage(consumiblesResult.reason)}`);
        } else if (entriesResult.status === "rejected") {
          setError(`Solo se cargo el inventario de consumibles. ${getErrorMessage(entriesResult.reason)}`);
        }
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [effectiveSedeId, selectedMonth, selectedYear, selectedAreaId]);

  const topDailyEntries = useMemo(
    () =>
      (dailyEntries || [])
        .slice()
        .sort((a, b) => (b?.total_ingresos || 0) - (a?.total_ingresos || 0))
        .slice(0, 10),
    [dailyEntries]
  );

  const consumiblesByTypeData = useMemo(
    () => ({
      labels: (consumiblesSummary?.por_categoria || []).map((item) => item?.categoria || "-"),
      datasets: [
        {
          label: "Cantidad en inventario",
          data: (consumiblesSummary?.por_categoria || []).map((item) => item?.cantidad || 0),
          backgroundColor: "rgba(0, 122, 6, 0.9)",
          borderColor: "#2e7d32",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 40,
        },
      ],
    }),
    [consumiblesSummary]
  );

  const barData = useMemo(
    () => ({
      labels: topDailyEntries.map((item) => {
        if (!item?.fecha) return "-";
        const date = new Date(`${item.fecha}T00:00:00`);
        const formatted = date
          .toLocaleDateString("es-CO", { weekday: "long", day: "2-digit" })
          .replace(",", "");
        return formatted.charAt(0).toUpperCase() + formatted.slice(1);
      }),
      datasets: [
        {
          label: `Dias con mayor ingreso en ${monthNames[selectedMonth - 1]} ${selectedYear}`,
          data: topDailyEntries.map((item) => item?.total_ingresos || 0),
          backgroundColor: "rgba(0, 62, 124, 0.9)",
          borderColor: "#1976d2",
          borderWidth: 1,
          borderRadius: 6,
          maxBarThickness: 36,
        },
      ],
    }),
    [topDailyEntries, selectedMonth, selectedYear]
  );

  const triggerPrint = useReactToPrint({
    contentRef: printContainerRef,
    documentTitle: "",
    onAfterPrint: () => setPrintPayload({ title: "", image: "", details: "" }),
    pageStyle: `
      @page { size: auto; margin: 0; }
      @media print {
        html, body {
          margin-top: 50px !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  const requestPrintChart = (chartRef, title, details = "") => {
    const chart = chartRef?.current;
    const image = chart?.toBase64Image?.();
    if (!image) return;

    setPrintPayload({ title, image, details });
  };

  useEffect(() => {
    if (!printPayload.image) return;

    const timer = window.setTimeout(() => {
      triggerPrint();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [printPayload, triggerPrint]);

  const categoriesText = useMemo(() => {
    const categories = consumiblesSummary?.por_categoria || [];
    if (!categories.length) return "Sin datos de categorias";
    return categories
      .map((item) => `${item.categoria}: ${item.cantidad}`)
      .join(" | ");
  }, [consumiblesSummary]);

  return (
    <MDBox sx={{ pb: 3, pt: 8 }}>
      <DashboardNavbar />

      <MDBox
        ref={printContainerRef}
        sx={{
          display: "none",
          "@media print": {
            display: "block",
          },
        }}
      >
        <MDTypography variant="h5" mb={2} textAlign="center">
          {printPayload.title}
        </MDTypography>
        {printPayload.image ? (
          <img
            src={printPayload.image}
            alt={printPayload.title}
            style={{ width: "100%", maxWidth: "700px", height: "420px", display: "block", margin: "0 auto" }}
          />
        ) : null}
        {printPayload.details ? (
          <MDTypography variant="button" display="block" mt={2} textAlign="center" fontWeight="medium">
            {printPayload.details}
          </MDTypography>
        ) : null}
      </MDBox>

      {loading && (
        <MDBox display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </MDBox>
      )}

      {!loading && error && (
        <Card>
          <MDBox p={3}>
            <MDTypography color="error" fontWeight="medium">
              {error}
            </MDTypography>
          </MDBox>
        </Card>
      )}



      {!loading && (
        <MDBox display="flex" flexDirection="column" gap={3}>
          <Card sx={{ height: 420 }}>
            <MDBox p={3}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="h6" mb={1}>
                  Inventario consumible sede {selectedSedeName}
                </MDTypography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ color: "#023987", borderColor: "info.main" }}
                  onClick={() =>
                    requestPrintChart(
                      consumiblesChartRef,
                      `Inventario consumible por tipo - ${monthNames[selectedMonth - 1]} ${selectedYear}`,
                      categoriesText
                    )}
                >
                  Imprimir grafica
                </Button>
              </MDBox>
              <MDBox sx={{ height: 310 }}>
                <Bar
                  ref={consumiblesChartRef}
                  data={consumiblesByTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: "top" },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                      },
                      x: {
                        ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 },
                      },
                    },
                  }}
                />
              </MDBox>
              <MDBox p={2} pt={0}>
                <MDTypography variant="button" color="text" fontWeight="medium">
                  {categoriesText}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Card>

          <Card sx={{ height: 450 }}>
            <MDBox p={3}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography variant="h6" mb={1}>
                  Personas ingresadas por dia en la sede {selectedSedeName} en {selectedAreaName} durante {monthNames[selectedMonth - 1]} {selectedYear}
                </MDTypography>
                
                <MDBox mb={2}>
                  <Button
                    variant="outlined"
                    sx={{ color: "#023987", borderColor: "info.main" }}
                    size="small"
                    onClick={() =>
                      requestPrintChart(
                        ingresosChartRef,
                        `Dias con mayor ingreso en ${monthNames[selectedMonth - 1]} ${selectedYear}`
                      )
                    }
                  >
                    Imprimir grafica
                  </Button>
                </MDBox>
              </MDBox>
              <MDBox mb={3} display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <MDTypography variant="button" color="text" fontWeight="medium">
                  Consultar por:
                </MDTypography>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel id="month-select-label">Mes</InputLabel>
                  <Select
                    labelId="month-select-label"
                    value={selectedMonth}
                    label="Mes"
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  >
                    {monthNames.map((monthName, index) => (
                      <MenuItem key={monthName} value={index + 1}>
                        {monthName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel id="year-select-label">Año</InputLabel>
                  <Select
                    labelId="year-select-label"
                    value={selectedYear}
                    label="Año"
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  >
                    {yearOptions.map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                  <InputLabel id="area-select-label" shrink>
                    Área
                  </InputLabel>
                  <Select
                    id="area-select"
                    labelId="area-select-label"
                    value={selectedAreaId}
                    label="Área"
                    displayEmpty
                    renderValue={(value) => {
                      if (!value) return "Selecciona un área";
                      const selected = areas.find((area) => Number(area.id_area) === Number(value));
                      return selected?.nombre_area || "Área";
                    }}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                  >
                    <MenuItem value="">Todas las áreas</MenuItem>
                    {areas.map((area) => (
                      <MenuItem key={area.id_area} value={area.id_area}>
                        {area.nombre_area}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </MDBox>
              <MDBox sx={{ height: 310 }}>
                <Bar
                  ref={ingresosChartRef}
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: "top" },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                      },
                    },
                  }}
                />
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>
      )}
    </MDBox>
  );
}

export default DashboardPage;