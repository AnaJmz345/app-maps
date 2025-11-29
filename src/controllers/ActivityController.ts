// src/controllers/ActivityController.ts
import { ActivityLog, SessionStats } from "../models/ActivityModel";
import { routeService } from "../services/RouteService";
import { logDebug, logError, logInfo } from "../utils/logger";

class ActivityController {
  async saveSessionRoute(logs: ActivityLog[], stats: SessionStats) {
    try {
      logInfo("ActivityController: Guardando ruta de sesión...");
      logDebug(`Logs: ${logs.length} | Distancia: ${stats.distanceMeters}m | Duración: ${stats.durationSec}s`);

      const result = await routeService.saveRoute(logs, stats);

      logInfo(`ActivityController: Ruta guardada con id ${result.id}`);

      return result;
    } catch (error) {
      logError("Error en ActivityController.saveSessionRoute", error);
      throw error; // lo mandamos al hook para que pueda mostrar alerta
    }
  }
}

export const activityController = new ActivityController();
