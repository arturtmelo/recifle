import { useEffect, useState } from "react";
import * as Location from "expo-location";

type Coords = { lat: number; lng: number } | null;

// São Paulo (Praça da Sé) como fallback quando a localização não está disponível
const FALLBACK_COORDS: Coords = { lat: -23.5505, lng: -46.6333 };

export function useLocation() {
  const [coords, setCoords] = useState<Coords>(null);
  const [status, setStatus] = useState<"loading" | "granted" | "denied">("loading");

  useEffect(() => {
    (async () => {
      try {
        const { status: permission } = await Location.requestForegroundPermissionsAsync();
        if (permission !== "granted") {
          setStatus("denied");
          setCoords(FALLBACK_COORDS);
          return;
        }
        const position = await Location.getCurrentPositionAsync({});
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("granted");
      } catch {
        setStatus("denied");
        setCoords(FALLBACK_COORDS);
      }
    })();
  }, []);

  return { coords, status };
}
