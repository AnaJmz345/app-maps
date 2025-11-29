import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SessionStats } from "../models/ActivityModel";

type Props = {
  stats: SessionStats;
};

export const SessionStatsCard: React.FC<Props> = ({ stats }) => {
  const minutes = Math.floor(stats.durationSec / 60);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Estadísticas de sesión</Text>

      <Row label="Duración" value={`${minutes} min`} />
      <Row
        label="Distancia"
        value={`${(stats.distanceMeters / 1000).toFixed(2)} km`}
      />
      <Row label="Calorías" value={`${stats.calories.toFixed(0)} kcal`} />
      <Row label="Pasos" value={stats.steps.toFixed(0)} />
      <Row label="Vel. promedio" value={`${stats.avgSpeedKmh.toFixed(1)} km/h`} />
    </View>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: "#4b5563",
  },
  value: {
    fontWeight: "600",
  },
});
