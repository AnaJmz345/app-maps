import * as Location from "expo-location";
import { LocationData } from "../models/ActivityModel";

class LocationService {
  private subscription: Location.LocationSubscription | null = null;

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  }

  async startTracking(callback: (d: LocationData) => void) {
    this.subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Highest,
        timeInterval: 2000,
        distanceInterval: 1,
      },
      (loc) => {
        const c = loc.coords;
        callback({
          latitude: c.latitude,
          longitude: c.longitude,
          speed: c.speed ?? 0,
          timestamp: loc.timestamp,
        });
      }
    );
  }

  stopTracking() {
    this.subscription?.remove();
    this.subscription = null;
  }

  haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const toRad = (v: number) => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }
}

export const locationService = new LocationService();
