import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { SavedRoute } from "../models/ActivityModel";
import { routeService } from "../services/RouteService";
import { storageService } from "../services/StorageService";

export default function EstadisticasScreen() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<SavedRoute | null>(null);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    const data = await storageService.getRoutes();
    setRoutes(data);
  };

  const deleteRoute = async (id: string) => {
    const filtered = routes.filter((r) => r.id !== id);
    setRoutes(filtered);
    await storageService.saveAllRoutes(filtered);
  };

  if (selectedRoute) {
    const html = routeService.generateLeafletHtml(selectedRoute);
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          onPress={() => setSelectedRoute(null)}
          style={styles.backButton}
        >
          <Text style={{ color: "white" }}>← Regresar</Text>
        </TouchableOpacity>

        <WebView source={{ html }} style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.title}>Rutas Guardadas ({routes.length})</Text>

      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.routeName}>{item.name}</Text>

            <View style={styles.row}>
              <Stat label="Distancia" value={`${item.stats.distanceMeters.toFixed(0)} m`} />
              <Stat label="Duración" value={`${item.stats.durationSec}s`} />
              <Stat label="Calorías" value={`${item.stats.calories.toFixed(0)}`} />
              <Stat label="Puntos" value={item.logs.length.toString()} />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() => setSelectedRoute(item)}
              >
                <Text style={{ color: "white" }}>📍 Ver Mapa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteRoute(item.id)}
              >
                <Text style={{ color: "white" }}>🗑</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <View style={{ alignItems: "center", flex: 1 }}>
    <Text>{value}</Text>
    <Text style={{ fontSize: 12, color: "#777" }}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  mapButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    padding: 10,
    marginLeft: 10,
    borderRadius: 10,
  },
  backButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    alignItems: "center",
  },
});
