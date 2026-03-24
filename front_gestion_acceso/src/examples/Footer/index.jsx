import PropTypes from "prop-types";

function Footer({ company = {} }) {
  const { href, name } = company;

  if (!href || !name) return null;

  return (
    <footer>
      <a href={href}>{name}</a>
    </footer>
  );
}


// Typechecking props for the Footer
Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
