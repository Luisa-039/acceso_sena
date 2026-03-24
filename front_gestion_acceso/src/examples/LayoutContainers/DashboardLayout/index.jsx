import { useEffect } from "react";

// react-router-dom components
import { useLocation, Outlet } from "react-router-dom";

// Material Dashboard 2 React components
import MDBox from "@/components/MDBox";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "@/context";

function DashboardLayout() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav } = controller;
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname]);

  return (
    <MDBox
      sx={({ breakpoints, transitions, functions: { pxToRem } }) => ({
        p: 3,
        position: "relative",

        [breakpoints.up("xl")]: {
          marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
          transition: transitions.create(["margin-left", "margin-right"], {
            easing: transitions.easing.easeInOut,
            duration: transitions.duration.standard,
          }),
        },
      })}
    >
      <Outlet />
    </MDBox>
  );
}

// Typechecking props for the DashboardLayout
//DashboardLayout.propTypes = {};

export default DashboardLayout;
