import { useState, useEffect } from "react";


// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Select from "@mui/material/Select";

// Material Dashboard 2 React components
import MDBox from "@/components/MDBox";
import MDButton from "@/components/MDButton";


// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
} from "@/examples/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setTransparentNavbar,
} from "@/context";
import { useAuth } from "@/context/authContext";
import { useSede } from "@/context/sedeContext";


function DashboardNavbar({ absolute = "false", light = "false", title = "", middleContent = null }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { transparentNavbar, fixedNavbar, darkMode } = controller;
  const { user, logoutUser } = useAuth();
  const { selectedSedeName, canSelectSede, sedes, selectedSedeId, setSelectedSedeId } = useSede();

  const currentUser = user;
  const userName = currentUser?.nombre_usuario || "Usuario";

  const formatSessionDate = (isoDate) => {
    if (!isoDate) return "Sin registros";

    const parsedDate = new Date(isoDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return "Sin registros";
    }

    return parsedDate.toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const lastSession = (() => {
    if (!currentUser?.id_usuario) return "Sin registros";

    const lastSessionByUser = localStorage.getItem(`lastSessionAt_${currentUser.id_usuario}`);
    const currentSessionByUser = localStorage.getItem(`currentSessionAt_${currentUser.id_usuario}`);

    return formatSessionDate(lastSessionByUser || currentSessionByUser);
  })();

  const handleLogout = () => {
    logoutUser();
    window.location.href = "/login";
  };

  const navbarTitle = title || `Sede ${selectedSedeName}`;

  const defaultMiddleContent = canSelectSede ? (
    <FormControl size="small" sx={{ minWidth: 260 }}>
      <InputLabel id="navbar-sede-select-label">Cambiar sede</InputLabel>
      <Select
        labelId="navbar-sede-select-label"
        value={selectedSedeId || ""}
        label="Cambiar sede"
        onChange={(e) => setSelectedSedeId(Number(e.target.value))}
      >
        {(sedes || []).map((sede) => (
          <MenuItem key={sede.id_sede} value={sede.id_sede}>
            {sede.nombre}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : null;


  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /** 
     The event listener that's calling the handleTransparentNavbar function when 
     scrolling the window.
    */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);


  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar
        sx={(theme) => ({
          ...navbarContainer(theme),
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          rowGap: 1
        })}
      >

        {/* LEFT */}
        <MDBox minWidth={0}>
          {navbarTitle ? (
            <MDBox component="span" sx={{ fontSize: "2rem", fontWeight: 700, color: "#244673" }}>
              {navbarTitle}
            </MDBox>
          ) : null}
        </MDBox>

        {/* CENTER */}
        <MDBox
          flex={1}
          display="flex"
          justifyContent="center"
          minWidth={{ xs: "100%", md: "auto" }}
          order={{ xs: 3, md: 2 }}
        >
          {middleContent ?? defaultMiddleContent}
        </MDBox>

        {/* RIGHT */}
        <MDBox display="flex" alignItems="center" ml="auto" order={{ xs: 2, md: 3 }}>
          <MDBox
            display="flex"
            alignItems="center"
            mr={2}
            px={1.5}
            py={0.75}
            borderRadius="lg"
            sx={{
              backgroundColor: "rgba(10, 133, 61, 0.08)",
              border: "1px solid rgba(10, 133, 61, 0.25)",
            }}
          >
            <PersonOutlineIcon sx={{ color: "#0a853d", mr: 1 }} />
            <MDBox lineHeight={1.2}>
              <MDBox component="span" sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#0a853d" }}>
                {userName}
              </MDBox>
              <MDBox component="span" display="block" sx={{ fontSize: "0.72rem", color: "#5f5f5f" }}>
                Ultima sesion: {lastSession}
              </MDBox>
            </MDBox>
          </MDBox>

          <MDButton
            variant="gradient"
            size="small"
            onClick={handleLogout}
            sx={{
              backgroundColor: "#0a853d",

              color: "light.main",
              fontWeight: 500,
              whiteSpace: "nowrap",
              "&:hover": {
                backgroundColor: "dark.main",
                color: "#ffffff",
              },
            }}
          >
            Salir
          </MDButton>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
  title: PropTypes.string,
  middleContent: PropTypes.node,
};

export default DashboardNavbar;