import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

function Footer({ company = {} }) {
  const { href } = company;
  const currentYear = new Date().getFullYear();

  return (
    <Box component="footer" sx={{ px: 2, py: 3 }}>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        El SENA impulsa la formacion integral para el trabajo, la innovacion y el desarrollo
        social del pais.
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
        © {currentYear} SENA. Todos los derechos reservados.
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
        Linea de atencion de soporte: 01 8000 910 270
        {href ? ` | ${href}` : ""}
      </Typography>
    </Box>
  );
}


// Typechecking props for the Footer
Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
