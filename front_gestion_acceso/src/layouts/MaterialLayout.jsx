import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

// MUI
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
// import Icon from "@mui/material/Icon";

// // Material components
import MDBox from "@/components/MDBox";
import Sidenav from "@/examples/Sidenav";
import Configurator from "@/examples/Configurator";
import Footer from "@/examples/Footer";

// Themes
import theme from "@/assets/theme";
import themeDark from "@/assets/theme-dark";

import routes from "@/routes"

// Context
import {
  useMaterialUIController,
  setMiniSidenav,
  setOpenConfigurator,
  setLayout
} from "@/context";

export default function MaterialLayout() {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    layout,
    openConfigurator,
    sidenavColor,
    darkMode,
  } = controller;

  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  
  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, [pathname]);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  const handleConfiguratorOpen = () =>
    setOpenConfigurator(dispatch, !openConfigurator);
  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />

      {layout === "dashboard" && (
        <>
          <Sidenav
            color={sidenavColor}
            brand={null}
            brandName="Módulos"
            routes={routes}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
          />
          <Configurator />
        </>
      )}

      <MDBox
        sx={({ breakpoints, transitions }) => ({
          p: 3,
          position: "relative",
          minHeight: "100vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",

          [breakpoints.up("xl")]: {
            marginLeft: miniSidenav ? "120px" : "274px",
            transition: transitions.create(["margin-left"], {
              easing: transitions.easing.easeInOut,
              duration: transitions.duration.standard,
            }),
          },
        })}
      >
        <MDBox sx={{ flex: 1 }}>
          <Outlet />
        </MDBox>
        <Footer company={{ href: "" }} />
      </MDBox>
    </ThemeProvider>
  );
}