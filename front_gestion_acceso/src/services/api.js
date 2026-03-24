//constante que almacena el login del backend
const api_backend = "http://localhost:8000";

//validar si el usuario exite y la contraseña coincide
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

//estructura para enviar los datos al fastApi para ser leidos

  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // SOLO agregar JSON si NO es FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    method: options.method || "GET",
    headers,
    body: options.body instanceof FormData
      ? options.body
      : options.body
      ? JSON.stringify(options.body)
      : undefined
  };


  //url dinámica para ejecutar la vista principal del usuario
  const response = await fetch(`${api_backend}/${endpoint}`, config);

  //validación de errores 
  if (!response.ok) {

    // const errorData = await response.json();

    // console.log("STATUS:", response.status);
    // console.log("ERROR BACKEND:", errorData);


    //si es 401, elimina el token para volver a intentar el acceso
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    //Muestra el mensaje de error
    const error = await response.json();
    throw error;
  }
  return response.json();
}