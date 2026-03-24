import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const [idRol, setIdRol] = useState(() => {
    const savedRol = localStorage.getItem("idRol");
    if (!savedRol) return null;

    const parsed = Number(savedRol);
    return Number.isNaN(parsed) ? null : parsed;
  });

  const [user, setUser] = useState(null);
  const [permisos, setPermisos] = useState([]);

  const loginUser = (token, rolId, userData = null) => {
    localStorage.setItem("token", token);
    if (rolId !== undefined && rolId !== null) {
      localStorage.setItem("idRol", String(rolId));
      setIdRol(Number(rolId));
    }
    if (userData) {
      setUser(userData);
    }
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("idRol");
    setIdRol(null);
    setUser(null);
    setPermisos([]);
    setIsAuthenticated(false);
  };

  useEffect(() => {
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        idRol,
        setIdRol,
        loginUser,
        logoutUser,
        user,
        permisos,
        setUser,
        setPermisos,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}