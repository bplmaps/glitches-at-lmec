let leafletMap = L.map("leaflet-map").fitBounds([
  [42.3098, -71.2],
  [42.3102, -71],
]);
L.tileLayer(
  "https://api.mapbox.com/styles/v1/ebowe/cl45xqpot003x14qtl179jyi6/tiles/512/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoiZWJvd2UiLCJhIjoicjZFLTNpUSJ9.6mrACeWl8wLl7NicvUh0jw",
  {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 11.8,
    attribution:
      '<a href="https://leventhalmap.org">Data processed by LMEC</a>',
    crossOrigin: true,
  }
).addTo(leafletMap);

let layers = {
  "Public Schools": null,
  "Non-Public Schools": null,
  "Public Libraries": null,
  "MBTA Lines": null,
};

function getStyle(feature, layerName) {
  const styles = {
    "Public Schools": {
      point: {
        radius: 6,
        fillColor: "#1f77b4",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
      }
    },
    "Non-Public Schools": {
      point: {
        radius: 6,
        fillColor: "#ff7f0e",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
      }
    },
    "Public Libraries": {
      point: {
        radius: 7,
        fillColor: "#2ca02c",
        color: "#ffffff",
        weight: 1,
        opacity: 1,
        fillOpacity: 1
      }
    },
    "MBTA Lines": {
      line: function (feature) {
        const route = feature.properties.line_id;
        const colors = {
          Red: "#DA291C",
          Orange: "#ED8B00",
          Blue: "#003DA5",
          Green: "#00843D",
          Silver: "#A7A9AC"
        };

        const colorKey = Object.keys(colors).find(k => route.toLowerCase().includes(k.toLowerCase())) || "Silver";

        return {
          color: colors[colorKey],
          weight: 4,
          opacity: 0.9
        };
      }
    }
  };

  return {
    style: styles[layerName]?.line || undefined,
    point: styles[layerName]?.point || undefined
  };
}


$.getJSON("Public_Schools.json", function (data) {
  const styleObj = getStyle(null, "Public Schools");
  layers["Public Schools"] = L.geoJson(data, {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, styleObj.point)
  });
});

$.getJSON("Non_Public_Schools.json", function (data) {
  const styleObj = getStyle(null, "Non-Public Schools");
  layers["Non-Public Schools"] = L.geoJson(data, {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, styleObj.point)
  });
});

$.getJSON("Public_Libraries.json", function (data) {
  const styleObj = getStyle(null, "Public Libraries");
  layers["Public Libraries"] = L.geoJson(data, {
    pointToLayer: (feature, latlng) => L.circleMarker(latlng, styleObj.point)
  });
});

$.getJSON("MBTA_GTFS_RapidTransit.json", function (data) {
  console.log(data)
  const styleObj = getStyle(null, "MBTA Lines");
  layers["MBTA Lines"] = L.geoJson(data, {
    style: styleObj.style
  });
});


document
  .querySelectorAll('#layers input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      let label = this.parentElement.textContent.trim();

      let layer = layers[label];
      if (!layer) {
        console.warn(`Layer for "${label}" not yet loaded`);
        return;
      }

      if (this.checked) {
        layer.addTo(leafletMap);
      } else {
        leafletMap.removeLayer(layer);
      }
    });
  });
