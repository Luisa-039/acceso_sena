// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

// Material Dashboard 2 React components
import MDBox from "@/components/MDBox";
import Tooltip from "@/components/tooltips";

// Custom styles for the SidenavCollapse
import {
  collapseItem,
  collapseText,
} from "@/examples/Sidenav/styles/sidenavCollapse";

// Material Dashboard 2 React context
import { useMaterialUIController } from "@/context";

function SidenavCollapse({
  name,
  tooltipText,
  active = false,
  activeColor = "success",
  activeBackground,
  ...rest
}) {
  const [controller] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;

  return (
    <ListItem component="li">
      <MDBox
        {...rest}
        sx={(theme) =>
          collapseItem(theme, {
            active,
            activeColor,
            activeBackground,
            transparentSidenav,
            whiteSidenav,
            darkMode,
            sidenavColor,
          })
        }
      >
        <ListItemText
          primary={
            <Tooltip text={tooltipText || (typeof name === "string" ? name : "Módulo")}>
              <span>{name}</span>
            </Tooltip>
          }
          sx={(theme) =>
            collapseText(theme, {
              miniSidenav,
              transparentSidenav,
              whiteSidenav,
              active,
            })
          }
        />
      </MDBox>
    </ListItem>
  );
}

// Typechecking props for the SidenavCollapse
SidenavCollapse.propTypes = {
  name: PropTypes.node,
  tooltipText: PropTypes.string,
  active: PropTypes.bool,
  activeColor: PropTypes.string,
  activeBackground: PropTypes.string,
};

export default SidenavCollapse;
