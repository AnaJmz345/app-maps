import * as Location from "expo-location";
import { LocationData } from "../models/ActivityModel";
import { logDebug, logError, logInfo, logWarn } from "../utils/logger";

class LocationService {
  private subscription: Location.LocationSubscription | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      logInfo("Solicitando permisos de GPS...");

      const { status } = await Location.requestForegroundPermissionsAsync();

      const granted = status === "granted";

      if (granted) {
        logInfo("Permisos de GPS concedidos.");
      } else {
        logWarn("Permisos de GPS DENEGADOS.");
      }

      return granted;
    } catch (error) {
      logError("Error al solicitar permisos de GPS", error);
      return false;
    }
  }

 
  
  async startTracking(callback: (d: LocationData) => void) {
    try {
      logInfo("Iniciando tracking de GPS...");

      this.subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (loc) => {
          try {
            const c = loc.coords;

            const data: LocationData = {
              latitude: c.latitude,
              longitude: c.longitude,
              speed: c.speed ?? 0,
              timestamp: loc.timestamp,
            };

            logDebug(
              `GPS -> lat:${data.latitude}, lon:${data.longitude}, speed:${data.speed}`
            );

            callback(data);
          } catch (innerError) {
            logError("Error procesando actualización del GPS", innerError);
          }
        }
      );

      logInfo("Tracking de GPS iniciado correctamente.");
    } catch (error) {
      logError("Error al iniciar watchPositionAsync", error);
      throw error; 
    }
  }

  stopTracking() {
    try {
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
        logInfo("Tracking de GPS detenido.");
      } else {
        logWarn("Intento de detener GPS pero no había subscription activa.");
      }
    } catch (error) {
      logError("Error al detener tracking de GPS", error);
    }
  }

  haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    try {
      const R = 6371000;
      const toRad = (v: number) => (v * Math.PI) / 180;

      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;

      const distance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

      logDebug(`Distancia Haversine calculada: ${distance.toFixed(2)} m`);

      return distance;
    } catch (error) {
      logError("Error calculando distancia Haversine", error);
      return 0; 
    }
  }
}

export const locationService = new LocationService();
