/* global turf */
/* global autocomplete */
/* global L */

let leafletMap = L.map('leaflet-map').fitBounds([[41.187053,-73.50821],[42.886778,-69.858861]]);
L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=1HCKO0pQuPEfNXXzGgSM',{
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
        crossOrigin: true
      }).addTo(leafletMap);