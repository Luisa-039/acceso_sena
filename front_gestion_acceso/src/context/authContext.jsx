import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AUTH_USER_KEY = "authUser";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getSessionKeys = (userId) => ({
  current: `currentSessionAt_${userId}`,
  last: `lastSessionAt_${userId}`,
});

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

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    if (!savedUser) return null;
    return safeParse(savedUser);
  });
  const [permisos, setPermisos] = useState([]);

  const loginUser = (token, rolId, userData = null) => {
    localStorage.setItem("token", token);
    if (rolId !== undefined && rolId !== null) {
      localStorage.setItem("idRol", String(rolId));
      setIdRol(Number(rolId));
    }
    if (userData) {
      if (userData.id_usuario !== undefined && userData.id_usuario !== null) {
        const { current, last } = getSessionKeys(userData.id_usuario);
        const currentSession = localStorage.getItem(current);
        if (currentSession) {
          localStorage.setItem(last, currentSession);
        }
        localStorage.setItem(current, new Date().toISOString());
      }

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("idRol");
    localStorage.removeItem(AUTH_USER_KEY);
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