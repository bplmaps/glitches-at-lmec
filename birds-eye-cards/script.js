/* global d3 */
/* global L */

const views = [
  {
    title: "Largest 200 buildings in Massachusetts",
    src: "https://s3.us-east-2.wasabisys.com/lmec-public-files/birds-eye-grid/largest_200_buildings_mass",
    nameFunction: (p) => {
      return `${Math.round(p.AREA_SQ_FT).toLocaleString()} ft²`;
    }
  },
  {
    title: "Roundest 200 waterbodies in Massachusetts",
    src: "https://s3.us-east-2.wasabisys.com/lmec-public-files/birds-eye-grid/roundest_200_waterbodies",
    nameFunction: (p) => {
      return `${p.NAME ? p.NAME : "Unnamed"} (Roundness score ${p.roundness})`;
    }
  },
  {
    title: "US state and territorial capitol buildings",
    src: "https://s3.us-east-2.wasabisys.com/lmec-public-files/birds-eye-grid/us_capitols",
    nameFunction: (p) => {
      return p.NAME;
    }
  },
  
  {
    title: "Highway exits in Massachusetts",
    src: "https://s3.us-east-2.wasabisys.com/lmec-public-files/birds-eye-grid/highway_exits",
    nameFunction: (p) => {
      return p.PRIMARYKEY;
    }
  },
  
    {
    title: "Libraries of Massachusetts",
    src: "https://s3.us-east-2.wasabisys.com/lmec-public-files/birds-eye-grid/massachusetts_libraries",
    nameFunction: (p) => {
      return p.NAME;
    }
  },
  
  {
    title: "Census blocks by income in Massachusetts, richest 100",
    src: "https://s3.us-east-2.wasabisys.com/lmec-public-files/birds-eye-grid/mass_income_blocks_top_100",
    nameFunction: (p) => {
      return `$${p.median_income.toLocaleString()} median income (2020)`;
    }
  },
  
  {
    title: "Census blocks by income in Massachusetts, poorest 100",
    src: "https://s3.us-east-2.wasabisys.com/lmec-public-files/birds-eye-grid/mass_income_blocks_bottom_100",
    nameFunction: (p) => {
      return `$${p.median_income.toLocaleString()} median income (2020)`;
    }
  },
];

let map = L.map("leaflet-map").setView([0, 0], 1);

L.tileLayer(
  "https://api.maptiler.com/maps/basic/{z}/{x}/{y}.png?key=1HCKO0pQuPEfNXXzGgSM",
  {
    tileSize: 512,
    zoomOffset: -1,
    minZoom: 1,
    attribution:
      '\u003ca href="https://www.maptiler.com/copyright/" target="_blank"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href="https://www.openstreetmap.org/copyright" target="_blank"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e',
    crossOrigin: true,
  }
).addTo(map);

let outlineLayer = L.geoJSON(null, { color: "orange", fill: false }).addTo(map);

let menu = d3.select("#menu-holder").append("select");

menu
  .selectAll("option")
  .data(views)
  .join("option")
  .attr("value", (d, i) => {
    return i;
  })
  .text((d) => {
    return d.title;
  });

menu.on("change", function () {
  let v = d3.select(this).property("value");
  initialize(views[+v]);
});

function lazyload() {
  let imageList = document.querySelectorAll("img.grid-square-image");
  let scrollTop = window.pageYOffset;
  imageList.forEach(function (img) {
    if (img.getBoundingClientRect().top < window.innerHeight + scrollTop) {
      img.src = img.dataset.src;
      img.classList.remove("lazy");
    }
  });
}

function loadGeoJSON(s) {
  return new Promise(function (resolve, reject) {
    fetch(`${s}/list.geojson`)
      .then((d) => d.json())
      .then((d) => {
        resolve(d);
      })
      .catch(() => reject("Could not load GeoJSON file"));
  });
}

function buildGridSkeleton(gj, m) {
  document.removeEventListener("scroll", lazyload);
  window.removeEventListener("resize", lazyload);
  window.removeEventListener("orientationChange", lazyload);

  d3.select("#grid-holder").html("");

  let outers = d3
    .select("#grid-holder")
    .selectAll("div")
    .data(gj.features)
    .join("div")
    .attr("class", "grid-square");

  outers
    .append("img")
    .attr("class", "grid-square-image")
    .attr("data-src", (d, i) => {
      return `${m.src}/${(i + 1).toString().padStart(3, "0")}.png`;
    });

  lazyload();
  document.addEventListener("scroll", lazyload);
  window.addEventListener("resize", lazyload);
  window.addEventListener("orientationChange", lazyload);

  outers
    .append("div")
    .attr("class", "grid-square-text")
    .text((d) => {
      return m.nameFunction(d.properties);
    })
    .on("click", (e, d) => {
      d3.select("#modal-1").classed("is-active", true);
      map.invalidateSize();
      outlineLayer.clearLayers();
      outlineLayer.addData(d);
      map.fitBounds(outlineLayer.getBounds(), { padding: [50, 50] });
    });
}

function initialize(m) {
  loadGeoJSON(m.src)
    .then((d) => buildGridSkeleton(d, m))
    .catch((e) => window.alert(e));
}

d3.selectAll(".modal-closer-trigger").on("click", function () {
  d3.select("#modal-1").classed("is-active", false);
});

d3.select("#adjuster-menu").on("change", function () {
  let v = d3.select(this).property("value");
  d3.select("#grid-holder").attr("class", v);
  lazyload();
});

initialize(views[0]);
