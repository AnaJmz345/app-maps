import { ActivityLog, SavedRoute, SessionStats } from "../models/ActivityModel";
import { storageService } from "./StorageService";

class RouteService {
  async saveRoute(logs: ActivityLog[], stats: SessionStats) {
    const route: SavedRoute = {
      id: Date.now().toString(),
      name: `Ruta ${new Date().toLocaleString()}`,
      date: new Date().toISOString(),
      logs,
      stats,
    };

    await storageService.saveRoute(route);
    await storageService.updateTotals(stats);

    return route;
  }

  generateLeafletHtml(route: SavedRoute) {
    const coords = route.logs
      .filter((l) => l.location)
      .map((l) => [l.location!.latitude, l.location!.longitude]);

    return `
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style> #map{ height:100vh; } </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const coords = ${JSON.stringify(coords)};
  const map = L.map('map');
  if(coords.length){
    map.setView(coords[0], 15);
    const poly = L.polyline(coords).addTo(map);
    map.fitBounds(poly.getBounds());
  }
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
</script>
</body>
</html>`;
  }
}

export const routeService = new RouteService();
