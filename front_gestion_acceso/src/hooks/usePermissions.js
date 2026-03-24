// src/hooks/usePermissions.js
import { useAuth } from "../context/authContext";
import { PERMISOS_POR_ROL } from "../constants/permisos";

export function usePermissions(idModulo) {
  const { idRol } = useAuth();
  const isAdmin = Number(idRol) === 1;

  // Busca en tu archivo permisos.js el objeto correspondiente
  const permisos = PERMISOS_POR_ROL[idRol]?.[idModulo] || {
    insertar: false,
    actualizar: false,
    seleccionar: false,
    borrar: false,
  };

  return { permisos, loading: false, isAdmin };
}
