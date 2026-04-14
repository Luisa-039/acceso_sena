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
import Consumibles from "@/pages/inv_consumibles";
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
    tooltipDescription: "Visualiza indicadores, reportes y resumen general del sistema.",
    key: "dashboard",
    route: "/dashboard",
    idModulo: MODULOS.VER_DASHBOARD,
    component: <Dashboard />,
  },
  {
    type: "accordion",
    name: "Gestión de accesos",
    tooltipDescription: "Administra ingresos de personas, equipos y encuestas de atención.",
    key: "accesos-menu",
    icon: "group",
    collapse: [
      {
        type: "collapse",
        name: "Registro de accesos",
        tooltipDescription: "Consulta y registra entradas y salidas de personas en sede.",
        key: "access_register_group",
        route: "registro-access",
        idModulo: MODULOS.REGISTROS_ACCESO,
        component: <Access_register />,
      },
      {
        type: "collapse",
        name: "Personas",
        tooltipDescription: "Gestiona datos de las personas que ingresan al centro.",
        key: "persons_group",
        route: "persons",
        idModulo: MODULOS.PERSONAS,
        component: <Persons />,
      },
      {
        type: "collapse",
        name: "Equipos",
        tooltipDescription: "Registra y consulta equipos externos asociados a visitantes.",
        key: "equipement_group",
        route: "equipement",
        idModulo: MODULOS.EQUIPOS_EXTERNOS,
        component: <Equipement />,
      },
      {
        type: "collapse",
        name: "Encuestas",
        tooltipDescription: "Revisa calificaciones y observaciones del servicio prestado.",
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
    tooltipDescription: "Configura usuarios, roles, permisos y estructura de módulos.",
    key: "usuarios-menu",
    icon: "group",
    collapse: [
      {
        type: "collapse",
        name: "Usuarios",
        tooltipDescription: "Crea, edita y administra cuentas de acceso al sistema.",
        key: "users_group",
        route: "users",
        idModulo: MODULOS.USUARIOS,
        component: <Users />,
      },
      {
        type: "collapse",
        name: "Roles",
        tooltipDescription: "Define perfiles de rol para controlar la visibilidad y acciones.",
        key: "roles_group",
        route: "roles",
        idModulo: MODULOS.ROLES,
        component: <Roles />,
      },
      {
        type: "collapse",
        name: "Módulos",
        tooltipDescription: "Administra el catálogo de módulos habilitados en la plataforma.",
        key: "modulos_group",
        route: "modulos",
        idModulo: MODULOS.MODULOS,
        component: <Modulos />,
      },
      {
        type: "collapse",
        name: "Permisos",
        tooltipDescription: "Asigna permisos por rol para crear, ver, editar o eliminar.",
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
    tooltipDescription: "Organiza categorías y tipos usados en registros y movimientos.",
    key: "categorias-menu",
    icon: "group",
    collapse: [
      {
        type: "collapse",
        name: "Categorías",
        tooltipDescription: "Mantiene categorías de equipos y consumibles del sistema.",
        key: "categorias_group",
        route: "categorias",
        idModulo: MODULOS.CATEGORIAS,
        component: <Categorias />,
      },
      {
        type: "collapse",
        name: "Tipos de movimientos",
        tooltipDescription: "Define tipos de movimiento para trazabilidad de equipos.",
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
    tooltipDescription: "Administra procesos operativos y control de inventario por sede.",
    key: "accordion-menu",
    collapse: [
      {
        type: "collapse",
        name: "Autorizaciones salidas",
        tooltipDescription: "Gestiona autorizaciones para salida de equipos de la sede.",
        key: "auth_salida_group",
        route: "auth_salida",
        idModulo: MODULOS.AUTORIZACION_SALIDA,
        component: <Auth_salida />,
      },
      {
        type: "collapse",
        name: "Equipos sede",
        tooltipDescription: "Consulta equipos asignados y ubicados dentro de la sede.",
        key: "equipement_sede_group",
        route: "equipement_sede",
        idModulo: MODULOS.EQUIPOS_SEDE,
        component: <Equipement_sede />,
      },
      {
        type: "collapse",
        name: "Historial de equipos",
        tooltipDescription: "Visualiza el historial completo de movimientos de equipos.",
        key: "movements_group",
        route: "movements",
        idModulo: MODULOS.MOVIMIENTO_EQUIPOS,
        component: <Movements />,
      },
      {
        type: "collapse",
        name: "Inventario consumibles",
        tooltipDescription: "Controla stock, estado y trazabilidad de consumibles.",
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
    tooltipDescription: "Administra estructura territorial y organizacional del sistema.",
    key: "centros-menu",
    icon: "group",
    collapse: [
      {
        type: "collapse",
        name: "Áreas",
        tooltipDescription: "Crea y organiza las áreas donde se atiende a usuarios.",
        key: "areas_group",
        route: "areas",
        idModulo: MODULOS.AREAS,
        component: <Areas />,
      },
      {
        type: "collapse",
        name: "Centros",
        tooltipDescription: "Gestiona centros de formación disponibles en la plataforma.",
        key: "centros",
        route: "centros",
        idModulo: MODULOS.CENTROS,
        component: <Centros />,
      },
      {
        type: "collapse",
        name: "Ciudades",
        tooltipDescription: "Administra ciudades relacionadas con centros y sedes.",
        key: "ciudades_group",
        route: "ciudades",
        idModulo: MODULOS.CIUDADES,
        component: <Ciudades />,
      },
      {
        type: "collapse",
        name: "Departamentos",
        tooltipDescription: "Configura departamentos para la ubicación geográfica.",
        key: "departamentos_group",
        route: "departamentos",
        idModulo: MODULOS.DEPARTAMENTOS,
        component: <Departamentos />,
      },
      {
        type: "collapse",
        name: "Sedes",
        tooltipDescription: "Gestiona sedes disponibles y su información operativa.",
        key: "sedes",
        route: "sedes",
        idModulo: MODULOS.SEDES,
        component: <Sedes />,
      },      
    ]
  },

];

export default routes;