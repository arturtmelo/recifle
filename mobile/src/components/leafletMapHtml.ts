// Gera o HTML de um mapa Leaflet (OpenStreetMap) para rodar dentro de uma WebView.
// Evita depender de react-native-maps, que exige build nativo customizado e não
// funciona dentro do Expo Go a partir das versões recentes do SDK.
export function buildLeafletHtml({
  lat,
  lng,
  primaryColor,
  infoColor,
  dark,
}: {
  lat: number;
  lng: number;
  primaryColor: string;
  infoColor: string;
  dark: boolean;
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: ${dark ? "#0E1712" : "#F7F9F7"}; }
    .center-pin {
      width: 34px; height: 34px; border-radius: 17px;
      background: ${primaryColor};
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    }
    .me-pin {
      width: 18px; height: 18px; border-radius: 9px;
      background: ${infoColor};
      border: 3px solid #fff;
      box-shadow: 0 0 0 4px ${infoColor}33, 0 2px 6px rgba(0,0,0,0.35);
    }
    .leaflet-popup-content-wrapper { border-radius: 14px; }
    .popup-title { font-weight: 700; font-size: 13px; margin-bottom: 2px; }
    .popup-sub { font-size: 11px; color: #667; }
    .leaflet-control-attribution { font-size: 9px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: true }).setView([${lat}, ${lng}], 13);
    var tileUrl = ${dark}
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    L.tileLayer(tileUrl, { attribution: '© OpenStreetMap, © CARTO', maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    var meIcon = L.divIcon({ className: '', html: '<div class="me-pin"></div>', iconSize: [18, 18] });
    L.marker([${lat}, ${lng}], { icon: meIcon }).addTo(map).bindPopup('Você está aqui');

    var markers = [];

    function clearMarkers() {
      markers.forEach(function (m) { map.removeLayer(m); });
      markers = [];
    }

    function updateCenters(centers) {
      clearMarkers();
      centers.forEach(function (c) {
        if (c.lat == null || c.lng == null) return;
        var icon = L.divIcon({ className: '', html: '<div class="center-pin">🏭</div>', iconSize: [34, 34], iconAnchor: [17, 17] });
        var marker = L.marker([c.lat, c.lng], { icon: icon }).addTo(map);
        marker.bindPopup('<div class="popup-title">' + c.name + '</div><div class="popup-sub">' + (c.address || '') + '</div>');
        marker.on('click', function () {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'centerPress', id: c.id }));
          }
        });
        markers.push(marker);
      });
    }

    function recenter(newLat, newLng) {
      map.setView([newLat, newLng], 14, { animate: true });
    }

    window.updateCenters = updateCenters;
    window.recenter = recenter;

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
    }
  </script>
</body>
</html>`;
}
