
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ActivityType } from "../models/ActivityModel";

type Props = {
  activity: ActivityType;
  confidence: number;
  speedKmh: number;
  accMagnitude: number;
};

const emojiByActivity: Record<ActivityType, string> = {
  idle: "🧍",
  walking: "🚶",
  running: "🏃",
  vehicle: "🚗",
  unknown: "❓",
};

const labelByActivity: Record<ActivityType, string> = {
  idle: "Quieto",
  walking: "Caminando",
  running: "Corriendo",
  vehicle: "Vehículo",
  unknown: "Desconocido",
};

export const ActivityIndicatorCard: React.FC<Props> = ({
  activity,
  confidence,
  speedKmh,
  accMagnitude,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{emojiByActivity[activity]}</Text>
      <Text style={styles.title}>{labelByActivity[activity]}</Text>

      <Text style={styles.text}>Velocidad: {speedKmh.toFixed(1)} km/h</Text>
      <Text style={styles.text}>
        Aceleración: {accMagnitude.toFixed(2)} m/s²
      </Text>

      <View style={styles.confBarBg}>
        <View style={[styles.confBarFill, { width: `${confidence}%` }]} />
      </View>
      <Text style={styles.confText}>{confidence}% confianza</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 4,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
  },
  text: {
    color: "white",
  },
  confBarBg: {
    marginTop: 8,
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4b5563",
    overflow: "hidden",
  },
  confBarFill: {
    height: "100%",
    backgroundColor: "#10b981",
  },
  confText: {
    color: "white",
    marginTop: 4,
    fontSize: 12,
  },
});
