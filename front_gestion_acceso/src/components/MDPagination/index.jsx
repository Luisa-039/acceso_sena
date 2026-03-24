import { forwardRef, createContext, useContext, useMemo } from "react";
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "@/components/MDBox";

// Custom styles
import MDPaginationItemRoot from "@/components/MDPagination/MDPaginationItemRoot";

// Context
const PaginationContext = createContext(null);

const MDPagination = forwardRef(
  ({ item, variant, color, size, active, children, ...rest }, ref) => {
    const context = useContext(PaginationContext);

    // 🔹 ITEM (consume context)
    if (item) {
      return (
        <MDPaginationItemRoot
          {...rest}
          ref={ref}
          variant={active ? context.variant : "outlined"}
          color={active ? context.color : "success"}
          iconOnly
          ownerState={{
            variant: context.variant,
            active,
            paginationSize: context.size,
          }}
        >
          {children}
        </MDPaginationItemRoot>
      );
    }

    // 🔹 CONTAINER (provide context)
    const value = useMemo(
      () => ({ variant, color, size }),
      [variant, color, size]
    );

    return (
      <PaginationContext.Provider value={value}>
        <MDBox
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          sx={{ listStyle: "none" }}
        >
          {children}
        </MDBox>
      </PaginationContext.Provider>
    );
  }
);

// Defaults
// MDPagination.defaultProps = {
//   item: false,
//   variant: "gradient",
//   color: "info",
//   size: "medium",
//   active: false,
// };

// PropTypes
MDPagination.propTypes = {
  item: PropTypes.bool,
  variant: PropTypes.oneOf(["gradient", "contained"]),
  color: PropTypes.oneOf([
    "white",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  active: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

export default MDPagination;