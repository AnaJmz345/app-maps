import { ActivityLog, SavedRoute, SessionStats } from "../models/ActivityModel";
import { logDebug, logError, logInfo } from "../utils/logger";
import { storageService } from "./StorageService";

class RouteService {

  async saveRoute(logs: ActivityLog[], stats: SessionStats) {
    try {
      logInfo("Creando objeto de ruta...");

      const route: SavedRoute = {
        id: Date.now().toString(),
        name: `Ruta ${new Date().toLocaleString()}`,
        date: new Date().toISOString(),
        logs,
        stats,
      };

      logDebug(`Ruta creada con id: ${route.id}. Guardando...`);

      await storageService.saveRoute(route);
      await storageService.updateTotals(stats);

      logInfo(`Ruta guardada correctamente. Total logs: ${logs.length}`);

      return route;

    } catch (error) {
      logError("Error en saveRoute", error);
      throw error;
    }
  }

  generateLeafletHtml(route: SavedRoute) {
    try {
      logInfo(`Generando HTML de mapa para la ruta: ${route.id}`);

      const coords = route.logs
        .filter((l) => l.location)
        .map((l) => [l.location!.latitude, l.location!.longitude]);

      logDebug(`Coordenadas generadas: ${coords.length}`);

      // Primer punto -> inicio
      const start = coords[0];
      // Último punto -> fin
      const end = coords[coords.length - 1];

      return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>

      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

      <script>
        const coords = ${JSON.stringify(coords)};
        const start = ${JSON.stringify(start)};
        const end = ${JSON.stringify(end)};

        const map = L.map('map');

        // Capa de mapa base
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        if (coords.length > 0) {
          // Polyline azul
          const poly = L.polyline(coords, {
            color: '#1e40af',
            weight: 5
          }).addTo(map);

          // Centrar mapa a la polyline
          map.fitBounds(poly.getBounds());

          // Marcador verde → inicio
          L.marker(start, {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
            })
          }).addTo(map)
            .bindPopup("Inicio de la ruta");

          // Marcador rojo → fin
          L.marker(end, {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
              shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
            })
          }).addTo(map)
            .bindPopup("Fin de la ruta");
        }
      </script>
    </body>
  </html>
      `;

    } catch (error) {
      logError("Error generando HTML del mapa en generateLeafletHtml", error);
      return `<html><body><h1>Error generando mapa</h1></body></html>`;
    }
  }
}

export const routeService = new RouteService();
