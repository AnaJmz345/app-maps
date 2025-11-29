// app/utils/logger.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { consoleTransport, logger } from "react-native-logs";

const logLevels = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export type LogLevel = keyof typeof logLevels;

const customLogger = logger.createLogger({
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: "blueBright",
      info: "greenBright",
      warn: "yellowBright",
      error: "redBright",
    },
  },
  levels: logLevels,
  severity: "debug", 
  async: true,
  dateFormat: "time",
  printLevel: true,
  printDate: true,
  enabled: true,
});


async function saveLogLocally(level: LogLevel, message: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  try {
    const raw = await AsyncStorage.getItem("logs");
    const existing = raw ? JSON.parse(raw) : [];
    existing.push(logEntry);
    await AsyncStorage.setItem("logs", JSON.stringify(existing));
  } catch (err) {
    console.error("Error guardando log local:", err);
  }
}

export async function logInfo(message: string) {
  customLogger.info(message);
  await saveLogLocally("info", message);
}

export async function logWarn(message: string) {
  customLogger.warn(message);
  await saveLogLocally("warn", message);
}

export async function logError(message: string, error?: any) {
  const fullMessage = error ? `${message} | ${error?.message || error}` : message;
  customLogger.error(fullMessage);
  await saveLogLocally("error", fullMessage);
}

export async function logDebug(message: string) {
  customLogger.debug(message);
  await saveLogLocally("debug", message);
}

export async function getLocalLogs() {
  try {
    const logs = await AsyncStorage.getItem("logs");
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error("Error leyendo logs locales:", error);
    return [];
  }
}

export default customLogger;
