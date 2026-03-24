export const PERMISOS_POR_ROL = {
  1: { // Admin
    1: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // modulos
    2: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // permisos
    3: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // roles
    4: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // usuarios
    5: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // registros acceso
    6: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // personas
    7: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // equipos externos
    8: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // sedes
    9: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // centros
    10: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // equipos sede
    11: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // movimiento equipos
    12: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // autorizacion salida
    13: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // ciudades
    14: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // departamentos
    15: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // inventario consumibles
    16: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // categorias
    17: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // areas
    18: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // encuestas
    19: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // tipos movimientos
  },
  2: { // Subdirector
    1: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // modulos
    2: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // permisos
    3: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // roles
    4: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // usuarios
    5: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // registros acceso
    6: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // personas
    7: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // equipos externos
    8: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // sedes
    9: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // centros
    10: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // equipos sede
    11: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // movimiento equipos
    12: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: true  }, // autorizacion salida
    13: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // ciudades
    14: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // departamentos
    15: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // inventario consumibles
    16: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // categorias
    17: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // areas
    18: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // encuestas
    19: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // tipos movimientos
  },
  3: { // Dinamizador
    1: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // modulos
    2: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // permisos
    3: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // roles
    4: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // usuarios
    5: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // registros acceso
    6: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // personas
    7: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // equipos externos
    8: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // sedes
    9: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // centros
    10: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: true  }, // equipos sede
    11: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // movimiento equipos
    12: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // autorizacion salida
    13: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // ciudades
    14: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // departamentos
    15: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // inventario consumibles
    16: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // categorias
    17: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // areas
    18: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // encuestas
    19: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // tipos movimientos
  },
  4: { // Guarda
    1: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // modulos
    2: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // permisos
    3: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // roles
    4: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // usuarios
    5: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // registros acceso
    6: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // personas
    7: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // equipos externos
    8: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // sedes
    9: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // centros
    10: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // equipos sede
    11: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // movimiento equipos
    12: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // autorizacion salida
     13: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // ciudades
     14: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // departamentos
     15: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // inventario consumibles
     16: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // categorias
     17: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // areas
     18: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // encuestas
     19: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // tipos movimientos
 },
 5: { // Técnico
    1: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // modulos
    2: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // permisos
    3: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // roles
    4: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // usuarios
    5: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // registros acceso
    6: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // personas
    7: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // equipos externos
    8: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // sedes
    9: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // centros
    10: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // equipos sede
    11: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // movimiento equipos
    12: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // autorizacion salida
    13: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // ciudades
    14: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // departamentos
    15: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // inventario consumibles
    16: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // categorias
    17: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // areas
    18: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // encuestas
    19: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // tipos movimientos
 },
 6: { // Líder TIC
   1: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // modulos
   2: { insertar: false,  actualizar: false,  seleccionar: false,  borrar: false  }, // permisos
   3: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // roles
   4: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // usuarios
   5: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // registros acceso
   6: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // personas
   7: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // equipos externos
   8: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // sedes
   9: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // centros
   10: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // equipos sede
   11: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // movimiento equipos
   12: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // autorizacion salida
   13: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // ciudades
   14: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // departamentos
   15: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // inventario consumibles
   16: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // categorias
   17: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // areas
   18: { insertar: false,  actualizar: false,  seleccionar: true,  borrar: false  }, // encuestas
   19: { insertar: true,  actualizar: true,  seleccionar: true,  borrar: false  }, // tipos movimientos
 },
};