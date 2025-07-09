/* global turf */
/* global autocomplete */
/* global L */

let leafletMap = L.map('leaflet-map').fitBounds([[42.3098,-71.2],[42.3102,-71]]);
L.tileLayer('https://api.mapbox.com/styles/v1/ebowe/cl45xqpot003x14qtl179jyi6/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZWJvd2UiLCJhIjoicjZFLTNpUSJ9.6mrACeWl8wLl7NicvUh0jw',{
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 11.8,
        attribution: "\u003ca Data processed by LMEC href=\"\" target=\"\"\ ",
        crossOrigin: true
      }).addTo(leafletMap);


let publicSchools = $.getJSON("Public_Schools.json");
let nonpublicSchools = $.getJSON("Non_Public_Schools.json");
let libraries = $.getJSON("Public_Libraries.json");
let Tlines = $.getJSON("MBTA_GTFS_RapidTransit.json");

// function processCheck(checkbox) {
//   var checkId = checkbox.id;

//   if (checkbox.checked) {
//     if (selId != null) {
//       map.removeLayer(layerArray[selId - 1]);
//       document.getElementById(selId).checked = false;
//     }
//     layerArray[checkId - 1].addTo(map);
//     selId = checkId;
//     }
//   else {
//     map.removeLayer(layerArray[checkId - 1]);
//     selId = null;
//   }
// }

// var overlayObj = {
// "Public Schools": L.geoJson(...),
// "Private Schools": L.geoJson(...),
// "Public Libraries": L.geoJson(...),
// "MBTA Lines": L.geoJson(...),                            
// }

// L.control.layers(overlayObj).addTo(map);