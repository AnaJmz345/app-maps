import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { ActivityIndicatorCard } from "../components/ActivityIndicator";
import { SessionStatsCard } from "../components/SessionStatsCard";
import { useActivityClassifier } from "../hooks/useActivityClassifier";

const ActivityTrackerScreen: React.FC = () => {
  const {
    currentActivity,
    confidence,
    sessionStats,
    isActive,
    location,
    acceleration,
    startTracking,
    stopTracking,
  } = useActivityClassifier();

  const speedKmh = sessionStats.avgSpeedKmh;
  const accMag = acceleration?.magnitude ?? 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Actividad en tiempo real</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ubicación actual</Text>
        <Text>
          Lat: {location?.latitude?.toFixed(5) ?? "--"} · Lon:{" "}
          {location?.longitude?.toFixed(5) ?? "--"}
        </Text>
        <Text>Velocidad GPS: {(location?.speed ?? 0).toFixed(1)} m/s</Text>
      </View>

      <ActivityIndicatorCard
        activity={currentActivity}
        confidence={confidence}
        speedKmh={speedKmh}
        accMagnitude={accMag}
      />

      <SessionStatsCard stats={sessionStats} />

      <TouchableOpacity
        onPress={isActive ? stopTracking : startTracking}
        style={[
          styles.button,
          isActive ? styles.buttonStop : styles.buttonStart,
        ]}
      >
        <Text style={styles.buttonText}>
          {isActive ? "Detener actividad" : "Iniciar actividad"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ActivityTrackerScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonStart: {
    backgroundColor: "#10b981",
  },
  buttonStop: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
