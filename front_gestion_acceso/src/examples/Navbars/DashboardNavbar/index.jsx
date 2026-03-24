import { useState, useEffect } from "react";


// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

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

const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};


function DashboardNavbar({ absolute = "false", light = "false" }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { transparentNavbar, fixedNavbar, darkMode } = controller;


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
          flexWrap: "nowrap",
          alignItems: "center",
        })}
      >

        {/* RIGHT */}
        <MDBox display="flex" alignItems="center" ml="auto">
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
};

export default DashboardNavbar;