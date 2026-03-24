import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { MODULOS_POR_RUTA } from "@/constants/modulosPorRuta";
import { usePermissions } from "@/hooks/usePermissions";

const FULL_ACCESS = {
  insertar: true,
  actualizar: true,
  seleccionar: true,
  borrar: true,
};

export function useRoutePermissions() {
  const { pathname } = useLocation();
  const routeKey = useMemo(() => pathname.split("/").filter(Boolean).pop() || "", [pathname]);
  const idModulo = MODULOS_POR_RUTA[routeKey];
  const { permisos, isAdmin } = usePermissions(idModulo);

  const effectivePermissions = idModulo ? (isAdmin ? FULL_ACCESS : permisos) : FULL_ACCESS;

  return {
    permisos: effectivePermissions,
    canInsert: Boolean(effectivePermissions.insertar),
    canUpdate: Boolean(effectivePermissions.actualizar),
    canSelect: Boolean(effectivePermissions.seleccionar),
    canDelete: Boolean(effectivePermissions.borrar),
  };
}