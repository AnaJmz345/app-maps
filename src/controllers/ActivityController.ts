// src/controllers/ActivityController.ts
import { ActivityLog, SessionStats } from "../models/ActivityModel";
import { routeService } from "../services/RouteService";

class ActivityController {
  async saveSessionRoute(logs: ActivityLog[], stats: SessionStats) {
    return routeService.saveRoute(logs, stats);
  }

  // Aquí podrías agregar más cosas:
  // - cargar rutas
  // - borrar rutas
  // - obtener stats totales, etc.
}

export const activityController = new ActivityController();
