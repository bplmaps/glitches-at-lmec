/* global L */
/* global geoblaze */

let initialized = false;
let sg;
let hg;

let sumSearch = 800000; // the number of population we're trying to find

let tifbounds = [[23.625, -127.3333333], [51.6666667, -67.2083333]];

let tif;
let ready = false;
const increment = (1 / 60) * 2.5; // 2.5 minutes in decimal degrees

// helper function to return bboxes in formats needed for geoblaze and leaflet
function computeBBox(centerpoint, tick, format) {
  let xmin = centerpoint[0] - tick * increment;
  let ymin = centerpoint[1] - tick * increment;
  let xmax = centerpoint[0] + tick * increment;
  let ymax = centerpoint[1] + tick * increment;

  if (format === "leaflet") {
    return [[ymin, xmin], [ymax, xmax]];
  } else if (format === "geoblaze") {
    return [xmin, ymin, xmax, ymax];
  }
}

function drawPopulationBoxes(centerpoint, tick, outerSum, innerSum) {
  let outerRectBounds = computeBBox(centerpoint, tick, "leaflet");
  outerRectangle.setBounds(outerRectBounds);
  map.fitBounds(outerRectBounds, [20, 20]);
  document.getElementById("outer-sum").textContent = Math.round(
    outerSum
  ).toLocaleString();
  if (tick > 1) {
    innerRectangle.setBounds(computeBBox(centerpoint, tick - 1, "leaflet"));
    document.getElementById("inner-sum").textContent = Math.round(
      innerSum
    ).toLocaleString();
    document.getElementById("legend-box-inner-sum").classList.remove("is-hidden");
  } else {
        document.getElementById("legend-box-inner-sum").classList.add("is-hidden");


  }
  
  document.getElementById("legend-holder").classList.remove("is-hidden");


}

function findPopulationBoxes(centerpoint) {
  if (!ready) {
    window.alert("Population grids have not yet loaded");
    return false;
  }
  
  // clear rectangles hackily by moving them to null island
  outerRectangle.setBounds([[0, 0], [0, 0]]);
  innerRectangle.setBounds([[0, 0], [0, 0]]);

  // start the tick marker at 0
  let tick = 0;
  let lastSum; // store the previous sum in a persistent variable

  function sumFunction() {
    tick = tick + 1;
    let bbox = computeBBox(centerpoint, tick, "geoblaze");
    geoblaze.sum(tif, bbox).then(function(s) {
      if (s[0] > sumSearch) {
        drawPopulationBoxes(centerpoint, tick, s[0], lastSum);
      } else {
        lastSum = s[0];
        sumFunction();
      }
    });
  }

  sumFunction();
}

let map = L.map("map", { tap: false, maxBounds: tifbounds }).fitBounds(
  tifbounds
);

L.tileLayer(
  "https://api.maptiler.com/maps/pastel/{z}/{x}/{y}.png?key=3xnWKwn97ChECGwP8sT0",
  {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e \u003ca href="https://www.maptiler.com/copyright/ "\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright "\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    crossOrigin: true
  }
).addTo(map);

let outerRectangle = L.rectangle([[0, 0], [0, 0]], {
  color: "#e76f51",
  weight: 5,
  fill: false
}).addTo(map);
let innerRectangle = L.rectangle([[0, 0], [0, 0]], {
  color: "#e9c46a",
  weight: 2,
  fill: false
}).addTo(map);

map.on("click", e => {
  findPopulationBoxes([e.latlng.lng, e.latlng.lat]);
});

geoblaze
  .parse("https://s3.us-east-2.wasabisys.com/lmec-public-files/temp/pop.tif")
  .then(d => {
    tif = d;
    ready = true;
    document.getElementById("loading-modal").classList.add("is-hidden");
    document.getElementById("ready-modal").classList.remove("is-hidden");
  });
