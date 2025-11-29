import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityLog, SavedRoute, SessionStats } from "../models/ActivityModel";
import { logDebug, logError, logInfo, logWarn } from "../utils/logger";

const ROUTES_KEY = "@routes";
const LOGS_KEY = "@logs";
const TOTAL_KEY = "@totalStats";

export class StorageService {
  async saveLogs(logs: ActivityLog[]) {
    try {
      logDebug(`Guardando ${logs.length} logs`);
      await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
      logInfo("Logs guardados correctamente");
    } catch (error) {
      logError("Error guardando logs", error);
    }
  }

  async saveRoute(route: SavedRoute) {
    try {
      logInfo(`Guardando ruta con id ${route.id}`);

      const routes = await this.getRoutes();
      routes.push(route);

      await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(routes));

      logDebug(`Ruta guardada. Total rutas: ${routes.length}`);
    } catch (error) {
      logError("Error guardando ruta", error);
      throw error; // Importante: se lo devolvemos al Controller
    }
  }

  async getRoutes(): Promise<SavedRoute[]> {
    try {
      logDebug("Leyendo rutas desde AsyncStorage…");
      const res = await AsyncStorage.getItem(ROUTES_KEY);

      const list = res ? JSON.parse(res) : [];

      logInfo(`Rutas cargadas: ${list.length}`);

      return list;
    } catch (error) {
      logError("Error obteniendo rutas", error);
      return [];
    }
  }

  async updateTotals(stats: SessionStats) {
    try {
      logInfo("Actualizando estadísticas totales…");

      const currentJson = await AsyncStorage.getItem(TOTAL_KEY);

      const current = currentJson
        ? JSON.parse(currentJson)
        : { distance: 0, calories: 0, steps: 0, sessions: 0 };

      const next = {
        distance: current.distance + stats.distanceMeters,
        calories: current.calories + stats.calories,
        steps: current.steps + stats.steps,
        sessions: current.sessions + 1,
      };

      await AsyncStorage.setItem(TOTAL_KEY, JSON.stringify(next));

      logDebug(
        `Totales actualizados -> distancia:${next.distance}, calorias:${next.calories}, pasos:${next.steps}, sesiones:${next.sessions}`
      );
    } catch (error) {
      logError("Error actualizando totales", error);
    }
  }

  async saveAllRoutes(routes: SavedRoute[]) {
    try {
      logWarn(`Sobrescribiendo ${routes.length} rutas`);
      await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
      logInfo("Rutas sobrescritas correctamente");
    } catch (error) {
      logError("Error sobrescribiendo rutas", error);
    }
  }
}

export const storageService = new StorageService();
