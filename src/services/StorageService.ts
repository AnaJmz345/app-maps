import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityLog, SavedRoute, SessionStats } from "../models/ActivityModel";

const ROUTES_KEY = "@routes";
const LOGS_KEY = "@logs";
const TOTAL_KEY = "@totalStats";

export class StorageService {
  async saveLogs(logs: ActivityLog[]) {
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }

  async saveRoute(route: SavedRoute) {
    const routes = await this.getRoutes();
    routes.push(route);
    await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
  }

  async getRoutes(): Promise<SavedRoute[]> {
    const res = await AsyncStorage.getItem(ROUTES_KEY);
    return res ? JSON.parse(res) : [];
  }

  async updateTotals(stats: SessionStats) {
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
  }

  async saveAllRoutes(routes: SavedRoute[]) {
    await AsyncStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
  }

}

export const storageService = new StorageService();
