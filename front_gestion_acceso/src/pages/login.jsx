import { useState } from "react";
//librerías de react para rutas y navegaciones 
import { useNavigate } from "react-router-dom";
//se importa la función login para recibir datos
import { login } from "../services/auth";
import SignIn from "@/layouts/authentication/sign-in";
import { useAuth } from "@/context/authContext";
import { alerts } from "@/hooks/alerts";

//función para la vista de inicio de sesión
function Login() {

  //almacena la variable email para aceptar cambios 
  //y la function setEmail para ejecutar los cambios
  //el useState se utiliza para indicar que el estado de la constante es vacío
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  

  // función para permitir acceso a la aplicación
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      //constante donde await espera la respuesta de la función mientras tanto lo demás se ejecuta
      const data = await login(email, password);

      //almacena los datos de las credenciales del local cuando es correcto 
      loginUser(data.access_token, data.user.rol_id, data.user);
      console.log(data);

      const rolId = Number(data.user?.rol_id);
      const nombreRol = String(data.user?.nombre_rol || data.user?.rol || "").toLowerCase();
      const esVigilante = rolId === 4 || nombreRol.includes("vigilante");

      if (esVigilante) {
        navigate("/dashboard/registro-access", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
      
      
    } catch {
      await alerts.error("Credenciales incorrectas");
    }
  }

  //retorna un formulario para el acceso
  return (
    <SignIn
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
    />
  );
}

// Se exporta la función como único para los demás archivos.
export default Login;