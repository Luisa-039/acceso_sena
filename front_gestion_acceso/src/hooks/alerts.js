import Swal from "sweetalert2";

const swalTheme = Swal.mixin({
  allowOutsideClick: false,
  allowEscapeKey: true,
  buttonsStyling: false,
  customClass: {
    popup: "swal-popup",
    title: "swal-title",
    htmlContainer: "swal-text",
    confirmButton: "swal-btn swal-btn-confirm",
    cancelButton: "swal-btn swal-btn-cancel",
  },
});

export const alerts = {
  success(title = "Operacion exitosa", text = "", timer = 1800) {
    return swalTheme.fire({
      icon: "success",
      iconColor: "success",
      title,
      text,
      showConfirmButton: false,
      timer,
    });
  },

  error(title = "Ha ocurrido un error", text = "") {
    return swalTheme.fire({
      icon: "error",
      iconColor: "#FDC300",
      title,
      text,
      confirmButtonText: "Aceptar",
    });
  },

  warning(title = "Atencion", text = "") {
    return swalTheme.fire({
      icon: "warning",
      iconColor: "#ebdd1a",
      title,
      text,
      confirmButtonText: "Entendido",
    });
  },

  info(title = "Informacion", text = "") {
    return swalTheme.fire({
      icon: "info",
      iconColor: "#1d4ed8",
      title,
      text,
      confirmButtonText: "Aceptar",
    });
  },

  confirm({
    title = "Confirmar accion",
    text = "",
    confirmButtonText = "Continuar",
    cancelButtonText = "Cancelar",
  } = {}) {
    return swalTheme.fire({
      icon: "question",
      iconColor: "#03a109",
      title,
      text,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
    });
  },
};
