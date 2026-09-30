import { useCallback, useState } from "react";
import { api } from "../lib/api";
import type { City } from "../lib/api";

type Status = "idle" | "locating" | "resolved" | "denied" | "error";

export function useGeolocation() {
  const [status, setStatus] = useState<Status>("idle");
  const [city, setCity] = useState<City | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("Бұл браузерде геолокация қолжетімсіз.");
      return;
    }

    setStatus("locating");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { city } = await api.geolocate(pos.coords.latitude, pos.coords.longitude);
          setCity(city);
          setStatus("resolved");
        } catch {
          setStatus("error");
          setError("Аймақты анықтау кезінде қате орын алды.");
        }
      },
      (err) => {
        setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Орналасуға рұқсат берілмеді. Аймақты қолмен таңдаңыз."
            : "Орналасуды анықтау мүмкін болмады.",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  const setManualCity = useCallback((c: City) => {
    setCity(c);
    setStatus("resolved");
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setCity(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { status, city, error, locate, setManualCity, reset };
}
