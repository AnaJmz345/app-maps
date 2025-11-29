// src/hooks/useActivityClassifier.ts
import { Accelerometer } from "expo-sensors";
import { useEffect, useRef, useState } from "react";

import { activityController } from "../controllers/ActivityController";
import {
    AccelerometerData,
    ActivityLog,
    ActivityType,
    LocationData,
    SessionStats,
} from "../models/ActivityModel";
import { activityClassifierService } from "../services/ActivityClassifierService";
import { locationService } from "../services/LocationService";

const INITIAL_STATS: SessionStats = {
  startTime: null,
  endTime: null,
  durationSec: 0,
  distanceMeters: 0,
  steps: 0,
  calories: 0,
  avgSpeedKmh: 0,
};

export type UseActivityClassifierReturn = {
  currentActivity: ActivityType;
  confidence: number;
  activityLogs: ActivityLog[];
  sessionStats: SessionStats;
  isActive: boolean;
  location: LocationData | null;
  acceleration: AccelerometerData | null;
  hasPermission: boolean;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<void>;
};

export function useActivityClassifier(): UseActivityClassifierReturn {
  const [currentActivity, setCurrentActivity] = useState<ActivityType>(
    ActivityType.UNKNOWN
  );
  const [confidence, setConfidence] = useState(0);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>(INITIAL_STATS);
  const [isActive, setIsActive] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [acceleration, setAcceleration] = useState<AccelerometerData | null>(
    null
  );
  const [hasPermission, setHasPermission] = useState(false);

  const lastLocationRef = useRef<LocationData | null>(null);
  const accSubscriptionRef = useRef<any>(null);

  // 1) Pedir permisos al montar
  useEffect(() => {
    (async () => {
      const granted = await locationService.requestPermissions();
      setHasPermission(granted);
    })();

    return () => {
      // cleanup
      Accelerometer.removeAllListeners();
      locationService.stopTracking();
    };
  }, []);

  // 2) Actualizar duración cada segundo cuando está activo
  useEffect(() => {
    if (!isActive || !sessionStats.startTime) return;

    const intervalId = setInterval(() => {
      setSessionStats((prev) => ({
        ...prev,
        durationSec: Math.floor(
          (Date.now() - (prev.startTime ?? Date.now())) / 1000
        ),
      }));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive, sessionStats.startTime]);

  // 3) Iniciar tracking
  const startTracking = async () => {
    if (!hasPermission || isActive) return;

    setSessionStats({
      ...INITIAL_STATS,
      startTime: Date.now(),
    });
    setActivityLogs([]);
    setIsActive(true);

    // GPS
    await locationService.startTracking((loc) => {
      handleNewData(loc, acceleration);
    });

    // Acelerómetro
    accSubscriptionRef.current = Accelerometer.addListener((acc) => {
      const magnitude = activityClassifierService.magnitude(
        acc.x,
        acc.y,
        acc.z
      );
      const accData: AccelerometerData = {
        x: acc.x,
        y: acc.y,
        z: acc.z,
        magnitude,
        timestamp: Date.now(),
      };
      setAcceleration(accData);
      handleNewData(location, accData);
    });

    Accelerometer.setUpdateInterval(200); // cada 200 ms
  };

  // 4) Detener tracking y guardar ruta
  const stopTracking = async () => {
    setIsActive(false);
    locationService.stopTracking();

    if (accSubscriptionRef.current) {
      accSubscriptionRef.current.remove();
      accSubscriptionRef.current = null;
    }

    const finalStats: SessionStats = {
      ...sessionStats,
      endTime: Date.now(),
    };
    setSessionStats(finalStats);

    if (activityLogs.length > 0) {
      await activityController.saveSessionRoute(activityLogs, finalStats);
    }
  };

  // 5) Fusionar nuevos datos (ubicación / acelerómetro)
  const handleNewData = (
    newLocation: LocationData | null,
    newAcc: AccelerometerData | null
  ) => {
    if (!newLocation && !newAcc) return;

    // Actualizar ubicación y distancia
    if (newLocation) {
      setLocation(newLocation);

      const last = lastLocationRef.current;
      if (last) {
        const d = locationService.haversine(
          last.latitude,
          last.longitude,
          newLocation.latitude,
          newLocation.longitude
        );

        // ignorar ruido muy pequeño
        if (d > 0.3) {
          setSessionStats((prev) => {
            const distanceMeters = prev.distanceMeters + d;
            const durationH = (prev.durationSec || 1) / 3600;
            const avgSpeedKmh =
              durationH > 0 ? (distanceMeters / 1000) / durationH : 0;
            const steps = prev.steps + d / 0.8; // 0.8 m por paso aprox
            const calories = prev.calories + (d / 1000) * 60; // 60 kcal/km aprox

            return {
              ...prev,
              distanceMeters,
              avgSpeedKmh,
              steps,
              calories,
            };
          });
        }
      }
      lastLocationRef.current = newLocation;
    }

    // Clasificar actividad
    const speed = (newLocation ?? location)?.speed ?? 0;
    const mag = (newAcc ?? acceleration)?.magnitude ?? 0;

    const act = activityClassifierService.classify(speed, mag);
    const conf = activityClassifierService.confidence(speed, mag);

    setCurrentActivity(act);
    setConfidence(conf);

    const log: ActivityLog = {
      id: Date.now().toString(),
      activity: act,
      confidence: conf,
      location: newLocation ?? location,
      acceleration: newAcc ?? acceleration,
    };

    setActivityLogs((prev) => [...prev, log]);
  };

  return {
    currentActivity,
    confidence,
    activityLogs,
    sessionStats,
    isActive,
    location,
    acceleration,
    hasPermission,
    startTracking,
    stopTracking,
  };
}
