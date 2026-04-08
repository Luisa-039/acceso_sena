// Material Dashboard 2 React layouts layouts/dashboard
import Dashboard from "../src/layouts/dashboard";
import Users from "@/pages/users";
import Persons from "@/pages/person";
import Equipement from "@/pages/equip_externos";
import Equipement_sede from "@/pages/equip_sede";
import Sedes from "@/pages/sedes";
import Centros from "@/pages/centros";
import Auth_salida from "@/pages/auth_salida";
import Movements from "@/pages/movements";
import Roles from "@/pages/roles";
import Departamentos from "@/pages/departamentos";
import Permisos from "@/pages/permisos";
import Movements_type from "@/pages/movements_type";
import Modulos from "@/pages/modulos";
import Ciudades from "@/pages/ciudades";
import DashboardLayout from "./examples/LayoutContainers/DashboardLayout";
import { MODULOS } from "@/constants/modulos";
import Categorias from "@/pages/categorias";
import Areas from "@/pages/areas";
import Encuestas from "./pages/encuestas";
import Consumibles from "@/pages/inv_conumibles";
import Access_register from "@/pages/access";
import AccordionPage from "@/pages/accordionPage";


const routes = [
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { path: "Dashboard", element: <Dashboard /> },
      { path: "users", element: <Users /> },
      { path: "persons", element: <Persons /> },
      { path: "equipement", element: <Equipement /> },
      { path: "equipement_sede", element: <Equipement_sede /> },
      { path: "sedes", element: <Sedes /> },
      { path: "centros", element: <Centros /> },
      { path: "auth_salida", element: <Auth_salida /> },
      { path: "movements", element: <Movements /> },
      { path: "roles", element: <Roles /> },
      { path: "permisos", element: <Permisos /> },
      { path: "departamentos", element: <Departamentos /> },
      { path: "tipos-movimientos", element: <Movements_type /> },
      { path: "modulos", element: <Modulos /> },
      { path: "ciudades", element: <Ciudades /> },
      { path: "categorias", element: <Categorias /> },
      { path: "areas", element: <Areas /> },
      { path: "encuestas", element: <Encuestas /> },
      { path: "registro-access", element: <Access_register /> },
      { path: "accordion", element: <AccordionPage /> }
    ],
  },
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    route: "/dashboard",
    idModulo: MODULOS.VER_DASHBOARD,
    component: <Dashboard />,
  },
  {
    type: "accordion",
    name: "Gestión de accesos",
    key: "accesos-menu",
    icon: "group",
    collapse: [
      {
        type: "collapse",
        name: "Registro de accesos",
        key: "access_register_group",
        route: "registro-access",
        idModulo: MODULOS.REGISTROS_ACCESO,
        component: <Access_register />,
      },
      {
        type: "collapse",
        name: "Personas",
        key: "persons_group",
        route: "persons",
        idModulo: MODULOS.PERSONAS,
        component: <Persons />,
      },
      {
        type: "collapse",
        name: "Equipos",
        key: "equipement_group",
        route: "equipement",
        idModulo: MODULOS.EQUIPOS_EXTERNOS,
        component: <Equipement />,
      },
      {
        type: "collapse",
        name: "Encuestas",
        key: "encuestas_group",
        route: "encuestas",
        idModulo: MODULOS.ENCUESTAS,
        component: <Encuestas />,
      },
    ]
  },
  {
    type: "accordion",
    name: "Gestión de usuarios",
    key: "usuarios-menu",
    icon: "group",
    collapse: [
      {
        type: "collapse",
        name: "Usuarios",
        key: "users_group",
        route: "users",
        idModulo: MODULOS.USUARIOS,
        component: <Users />,
      },
      {
        type: "collapse",
        name: "Roles",
        key: "roles_group",
        route: "roles",
        idModulo: MODULOS.ROLES,
        component: <Roles />,
      },
      {
        type: "collapse",
        name: "Módulos",
        key: "modulos_group",
        route: "modulos",
        idModulo: MODULOS.MODULOS,
        component: <Modulos />,
      },
      {
        type: "collapse",
        name: "Permisos",
        key: "permisos_group",
        route: "permisos",
        idModulo: MODULOS.PERMISOS,
        component: <Permisos />,
      },
    ],
  },
  {
    type: "accordion",
    name: "Gestión de categorías",
    key: "categorias-menu",
    icon: "group",
    collapse: [
      {
        type: "collapse",
        name: "Categorías",
        key: "categorias_group",
        route: "categorias",
        idModulo: MODULOS.CATEGORIAS,
        component: <Categorias />,
      },
      {
        type: "collapse",
        name: "Tipos de movimientos",
        key: "tipos-movimientos_group",
        route: "tipos-movimientos",
        idModulo: MODULOS.TIPO_MOVIMIENTOS,
        component: <Movements_type />,
      },
    ]
  },
  {
    type: "accordion",
    name: "Gestión de sede",
    key: "accordion-menu",
    collapse: [
      {
        type: "collapse",
        name: "Autorizaciones salidas",
        key: "auth_salida_group",
        route: "auth_salida",
        idModulo: MODULOS.AUTORIZACION_SALIDA,
        component: <Auth_salida />,
      },
      {
        type: "collapse",
        name: "Equipos sede",
        key: "equipement_sede_group",
        route: "equipement_sede",
        idModulo: MODULOS.EQUIPOS_SEDE,
        component: <Equipement_sede />,
      },
      {
        type: "collapse",
        name: "Historial de equipos",
        key: "movements_group",
        route: "movements",
        idModulo: MODULOS.MOVIMIENTO_EQUIPOS,
        component: <Movements />,
      },
      {
        type: "collapse",
        name: "Inventario consumibles",
        key: "consumibles",
        route: "consumibles",
        idModulo: MODULOS.INVENTARIO_CONSUMIBLES,
        component: <Consumibles />,
      },
    ],
  },
  {
    type: "accordion",
    name: "Gestión operativa",
    key: "centros-menu",
    icon: "group",
    collapse: [
      {
        type: "collapse",
        name: "Áreas",
        key: "areas_group",
        route: "areas",
        idModulo: MODULOS.AREAS,
        component: <Areas />,
      },
      {
        type: "collapse",
        name: "Centros",
        key: "centros",
        route: "centros",
        idModulo: MODULOS.CENTROS,
        component: <Centros />,
      },
      {
        type: "collapse",
        name: "Ciudades",
        key: "ciudades_group",
        route: "ciudades",
        idModulo: MODULOS.CIUDADES,
        component: <Ciudades />,
      },
      {
        type: "collapse",
        name: "Departamentos",
        key: "departamentos_group",
        route: "departamentos",
        idModulo: MODULOS.DEPARTAMENTOS,
        component: <Departamentos />,
      },
      {
        type: "collapse",
        name: "Sedes",
        key: "sedes",
        route: "sedes",
        idModulo: MODULOS.SEDES,
        component: <Sedes />,
      },      
    ]
  },

];

export default routes;