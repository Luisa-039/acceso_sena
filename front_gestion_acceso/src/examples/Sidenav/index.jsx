import { useEffect, useState } from "react";
import { usePermissions } from "@/hooks/usePermissions"; // Importamos tu hook
import { useAuth } from "@/context/authContext";
import { PERMISOS_POR_ROL } from "@/constants/permisos";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Material Dashboard 2 React components
import MDBox from "@/components/MDBox";
import MDTypography from "@/components/MDTypography";

// Material Dashboard 2 React example components
import SidenavCollapse from "@/examples/Sidenav/SidenavCollapse";

// Custom styles for the Sidenav
import SidenavRoot from "@/examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "@/examples/Sidenav/styles/sidenav";

// Material Dashboard 2 React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "@/context";

// Componente auxiliar para validar permisos de cada ruta de forma individual
function SidenavItem({ route, textColor }) {
  // Usamos el idModulo definido en routes.jsx (antes lo llamabas 'modulo', cámbialo a idModulo para consistencia)
  const { permisos, isAdmin } = usePermissions(route.idModulo);
  const [openAccordion, setOpenAccordion] = useState(false);

  // Si la ruta es de tipo "collapse" y tiene un idModulo, validamos el permiso 'seleccionar'
  if (route.type === "collapse" && route.idModulo && !isAdmin && !permisos.seleccionar) {
    return null;
  }

  // Renderizado según el tipo de ruta
  if (route.type === "collapse") {
    return route.href ? (
      <Link
        href={route.href}
        key={route.key}
        target="_blank"
        rel="noreferrer"
        sx={{ textDecoration: "none" }}
      >
        <SidenavCollapse
          name={route.name}
          icon={route.icon}
          active={false}
          activeColor={route.activeColor}
          activeBackground={route.activeBackground}
          noCollapse={route.noCollapse}
        />
      </Link>
    ) : (
      <NavLink key={route.key} to={route.route} end style={{ textDecoration: "none" }}>
        {({ isActive }) => (
          <SidenavCollapse
            name={route.name}
            icon={route.icon}
            active={isActive}
            activeColor={route.activeColor}
            activeBackground={route.activeBackground}
          />
        )}
      </NavLink>
    );
  }

  if (route.type === "title") {
    return (
      <MDTypography
        key={route.key}
        color={textColor}
        display="block"
        variant="caption"
        fontWeight="bold"
        textTransform="uppercase"
        pl={3}
        mt={2}
        mb={1}
        ml={1}
      >
        {route.title}
      </MDTypography>
    );
  }

  if (route.type === "accordion") {
    const children = Array.isArray(route.collapse) ? route.collapse : [];

    return (
      <Accordion
        key={route.key}
        disableGutters
        elevation={0}
        square
        expanded={openAccordion}
        onChange={(_event, expanded) => setOpenAccordion(expanded)}
        sx={{
          backgroundColor: "transparent",
          color: "inherit",
          "&:before": { display: "none" },
          boxShadow: "none",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: "#ffffff" }} />}
          sx={{
            minHeight: 44,
            "& .MuiAccordionSummary-content": { my: 0.5 },
            bgcolor: "#00304D",
            color: "#ffffff", fontSize: "12px",
            "&:hover": { bgcolor: "#124a7b" },
          }}
        >
          {/* Cambia el color del texto, tamaño del título
           para que sea visible sobre el fondo oscuro del AccordionSummary */}
          <MDTypography
            variant="button"
            fontWeight="medium"
            color="inherit"
            sx={{ fontSize: "12px", lineHeight: 1.2 }}
          >
            {route.name}
          </MDTypography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 0, pl: 2, bgcolor: "#074c78", fontSize: "10px" }}>
          <List sx={{ py: 0 }}>
            {children.map((child) => (
              <SidenavItem key={child.key} route={child} textColor={textColor} />
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  }

  return null;
}

function canRenderRoute(route, idRol) {
  if (!route) return false;

  if (route.type === "title") return true;

  if (route.type === "accordion") {
    const children = Array.isArray(route.collapse) ? route.collapse : [];
    return children.some((child) => canRenderRoute(child, idRol));
  }

  if (route.type === "collapse") {
    if (!route.idModulo) return true;

    const permisos = PERMISOS_POR_ROL?.[idRol]?.[route.idModulo];
    return Boolean(permisos?.seleccionar);
  }

  return false;
}

function Sidenav({ color = "info", brand = null, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();
  const { idRol } = useAuth();

  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  // Renderizado de rutas
  const renderRoutes = routes
    .filter((route) => canRenderRoute(route, idRol))
    .map((route) => (
      <SidenavItem
        key={route.key}
        route={route}
        textColor={textColor}
      />
    ));

  // Manejo de responsive
  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }
    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor}>
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider light={(!darkMode && !whiteSidenav && !transparentSidenav) || (darkMode && !transparentSidenav && whiteSidenav)} />
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;