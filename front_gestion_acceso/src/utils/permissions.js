export function hasPermission(permisos, modulo, accion) {
  const permiso = permisos.find(p => p.modulo === modulo);
  return permiso ? permiso[accion] : false;
}