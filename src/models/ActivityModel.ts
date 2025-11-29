// src/models/ActivityModel.ts

export enum ActivityType {
  IDLE = "idle",
  WALKING = "walking",
  RUNNING = "running",
  VEHICLE = "vehicle",
  UNKNOWN = "unknown",
}

export type LocationData = {
  latitude: number;
  longitude: number;
  speed: number | null;
  timestamp: number;
};

export type AccelerometerData = {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  timestamp: number;
};

export type ActivityLog = {
  id: string;
  activity: ActivityType;
  confidence: number;
  location: LocationData | null;
  acceleration: AccelerometerData | null;
};

export type SessionStats = {
  startTime: number | null;
  endTime: number | null;
  durationSec: number;
  distanceMeters: number;
  steps: number;
  calories: number;
  avgSpeedKmh: number;
};

export type SavedRoute = {
  id: string;
  name: string;
  date: string;
  logs: ActivityLog[];
  stats: SessionStats;
};

export type ClassifierConfig = {
  walkSpeedMin: number;
  runSpeedMin: number;
  vehicleSpeedMin: number;
  accThresholdLow: number;
  accThresholdHigh: number;
};

export const DEFAULT_CLASSIFIER_CONFIG: ClassifierConfig = {
  walkSpeedMin: 0.7,
  runSpeedMin: 2.2,
  vehicleSpeedMin: 6.0,
  accThresholdLow: 0.5,
  accThresholdHigh: 2.5,
};
