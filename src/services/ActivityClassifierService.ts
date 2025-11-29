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
    // QUIETO
    if (acc > 9.6 && acc < 10.2 && speed < 0.3) {
      return ActivityType.IDLE;
    }

    // VEHÍCULO
    if (speed >= 5 && acc > 9.6 && acc < 10.2) {
      return ActivityType.VEHICLE;
    }

    // CAMINANDO
    if (acc >= 10 && acc < 12) {
      return ActivityType.WALKING;
    }

    // CORRIENDO
    if (acc >= 12 && acc < 18) {
      return ActivityType.RUNNING;
    }

    return ActivityType.UNKNOWN;
  }



  confidence(speed: number, acc: number) {
    const s = Math.min(speed / 5, 1);
    const a = Math.min(acc / 3, 1);
    return Math.round(((s + a) / 2) * 100);
  }
}

export const activityClassifierService = new ActivityClassifierService();
