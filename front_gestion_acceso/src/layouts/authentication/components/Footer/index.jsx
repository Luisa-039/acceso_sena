import PropTypes from "prop-types";

// @mui material components
import Container from "@mui/material/Container";

// Material Dashboard 2 React components
import MDBox from "@/components/MDBox";


// Material Dashboard 2 React base styles
import typography from "@/assets/theme/base/typography";

function Footer({ light = false }) {
  const { size } = typography;
  const currentYear = new Date().getFullYear();

  return (
    <MDBox position="absolute" width="100%" bottom={0} py={4}>
      <Container>
        <MDBox
          width="100%"
          display="flex"
          flexDirection="column"
          alignItems={{ xs: "flex-start", md: "center" }}
          gap={0.75}
          px={1.5}
        >
          <MDBox
            color={light ? "white" : "text"}
            fontSize={size.sm}
            textAlign={{ xs: "left", md: "center" }}
          >
            El SENA impulsa la formacion integral para el trabajo, la innovacion y el desarrollo
            social del pais.
          </MDBox>
          <MDBox
            color={light ? "white" : "text"}
            fontSize={size.sm}
            textAlign={{ xs: "left", md: "center" }}
          >
            © {currentYear} SENA. Todos los derechos reservados.
          </MDBox>
          <MDBox
            color={light ? "white" : "text"}
            fontSize={size.sm}
            textAlign={{ xs: "left", md: "center" }}
          >
            Linea de atencion de soporte: 01 8000 910 270
          </MDBox>
        </MDBox>
      </Container>
    </MDBox>
  );
}
// Typechecking props for the Footer
Footer.propTypes = {
  light: PropTypes.bool,
};

export default Footer;
