import MDBox from "@/components/MDBox";
import DashboardNavbar from "@/examples/Navbars/DashboardNavbar";
import { Outlet } from "react-router-dom";

function DashboardLayout() {
  return (
    <>
      <MDBox>
          <DashboardNavbar />
          <Outlet />
      </MDBox>
    </>
  );
}

export default DashboardLayout;