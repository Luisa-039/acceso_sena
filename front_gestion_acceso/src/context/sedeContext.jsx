import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/authContext";
import { apiFetch } from "@/services/api";

const SedeContext = createContext(null);
const SEDE_STORAGE_KEY = "selectedSedeId";

const toNumberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export function SedeProvider({ children }) {
  const { user, idRol, isAuthenticated } = useAuth();
  const [sedes, setSedes] = useState([]);
  const [selectedSedeIdState, setSelectedSedeIdState] = useState(() =>
    toNumberOrNull(localStorage.getItem(SEDE_STORAGE_KEY))
  );
  const [loadingSedes, setLoadingSedes] = useState(false);

  const canSelectSede = useMemo(() => [1, 2].includes(Number(idRol)), [idRol]);

  const setSelectedSedeId = (value) => {
    const parsed = toNumberOrNull(value);
    setSelectedSedeIdState(parsed);

    if (parsed) {
      localStorage.setItem(SEDE_STORAGE_KEY, String(parsed));
      return;
    }

    localStorage.removeItem(SEDE_STORAGE_KEY);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setSedes([]);
      setSelectedSedeId(null);
      return;
    }

    if (!canSelectSede) {
      setSedes([]);
      setSelectedSedeId(user?.sede_id || null);
      return;
    }

    let isMounted = true;

    async function loadSedes() {
      setLoadingSedes(true);
      try {
        const data = await apiFetch("sede/all/sedes");
        if (!isMounted) return;

        const sedesList = Array.isArray(data) ? data : data?.sedes || [];
        setSedes(sedesList);

        const savedSedeId = toNumberOrNull(localStorage.getItem(SEDE_STORAGE_KEY));
        const userSedeId = toNumberOrNull(user?.sede_id);

        const availableIds = new Set((sedesList || []).map((s) => Number(s.id_sede)));

        const fallbackSedeId =
          (savedSedeId && availableIds.has(savedSedeId) && savedSedeId) ||
          (userSedeId && availableIds.has(userSedeId) && userSedeId) ||
          toNumberOrNull(sedesList[0]?.id_sede);

        setSelectedSedeId(fallbackSedeId);
      } catch {
        if (!isMounted) return;
        setSedes([]);
        setSelectedSedeId(user?.sede_id || null);
      } finally {
        if (isMounted) {
          setLoadingSedes(false);
        }
      }
    }

    loadSedes();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, canSelectSede, user?.sede_id]);

  const effectiveSedeId = canSelectSede
    ? selectedSedeIdState
    : toNumberOrNull(user?.sede_id);

  const selectedSedeName = useMemo(() => {
    if (!effectiveSedeId) return "No definida";

    const found = (sedes || []).find((s) => Number(s.id_sede) === Number(effectiveSedeId));
    return found?.nombre || user?.nombre || "No definida";
  }, [effectiveSedeId, sedes, user?.nombre]);

  const value = {
    sedes,
    canSelectSede,
    loadingSedes,
    selectedSedeId: selectedSedeIdState,
    setSelectedSedeId,
    effectiveSedeId,
    selectedSedeName,
  };

  return <SedeContext.Provider value={value}>{children}</SedeContext.Provider>;
}

export function useSede() {
  const context = useContext(SedeContext);

  if (!context) {
    throw new Error("useSede debe usarse dentro de SedeProvider");
  }

  return context;
}
