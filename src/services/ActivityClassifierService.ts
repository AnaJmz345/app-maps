import {
    ActivityType,
    ClassifierConfig,
    DEFAULT_CLASSIFIER_CONFIG,
} from "../models/ActivityModel";

class ActivityClassifierService {
  private config: ClassifierConfig = DEFAULT_CLASSIFIER_CONFIG;

  setConfig(cfg: Partial<ClassifierConfig>) {
    this.config = { ...this.config, ...cfg };
  }

  magnitude(x: number, y: number, z: number) {
    return Math.sqrt(x * x + y * y + z * z);
  }

  classify(speed: number, acc: number): ActivityType {
    if (speed < 0.3 && acc < this.config.accThresholdLow)
      return ActivityType.IDLE;

    if (speed >= this.config.vehicleSpeedMin)
      return ActivityType.VEHICLE;

    if (speed >= this.config.runSpeedMin || acc > this.config.accThresholdHigh)
      return ActivityType.RUNNING;

    if (speed >= this.config.walkSpeedMin)
      return ActivityType.WALKING;

    return ActivityType.UNKNOWN;
  }

  confidence(speed: number, acc: number) {
    const s = Math.min(speed / 5, 1);
    const a = Math.min(acc / 3, 1);
    return Math.round(((s + a) / 2) * 100);
  }
}

export const activityClassifierService = new ActivityClassifierService();
