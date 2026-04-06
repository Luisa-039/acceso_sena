import { Routes, Route, Navigate } from "react-router-dom";

import MaterialLayout from "./layouts/MaterialLayout";
import AuthLayout from "@/layouts/authLayout";

// import Login from "@/layouts/authentication/sign-in";
import Users from "@/pages/users";
import Login from "@/pages/login";
import Dashboard from "@/layouts/dashboard";
import Persons from "@/pages/person";
import Equipements from "@/pages/equip_externos";
import Equipements_sede from "@/pages/equip_sede";
import Sedes from "@/pages/sedes";
import Centros from "@/pages/centros";
import Auth_salida from "@/pages/auth_salida";
import Movements from "@/pages/movements";
import Roles from "@/pages/roles";
import Permisos from "@/pages/permisos";
import Departamentos from "@/pages/departamentos";
import Movements_type from "@/pages/movements_type";
import Ciudades from "@/pages/ciudades";
import Modulos from "@/pages/modulos";
import Categorias from "@/pages/categorias";
import Areas from "@/pages/areas";
import Encuestas from "@/pages/encuestas";
import Consumibles from "@/pages/inv_conumibles";
import Access_register from "@/pages/access";
import AccordionPage from "@/pages/accordionPage";

function App() {
  return (
   <Routes>

      {/* Redirección inicial */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* AUTH (sin sidebar) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* DASHBOARD (con plantilla) */}
      <Route path="/dashboard" element={<MaterialLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="persons" element={<Persons />} />
        <Route path="equipement" element={<Equipements />} />
        <Route path="equipement_sede" element={<Equipements_sede />} />
        <Route path="sedes" element={<Sedes />} />
        <Route path="centros" element={<Centros />} />
        <Route path="auth_salida" element={<Auth_salida />} />
        <Route path="movements" element={<Movements />} />
        <Route path="roles" element={<Roles />} />
        <Route path="permisos" element={<Permisos />} />
        <Route path="departamentos" element={<Departamentos />} />
        <Route path="tipos-movimientos" element={<Movements_type />} />
        <Route path="modulos" element={<Modulos />} />
        <Route path="ciudades" element={<Ciudades />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="areas" element={<Areas />} />
        <Route path="encuestas" element={<Encuestas />} />
        <Route path="consumibles" element={<Consumibles />} />
        <Route path="registro-access" element={<Access_register />} />
        <Route path="accordion" element={<AccordionPage />} />
      </Route>
    </Routes>
  );
}

export default App;