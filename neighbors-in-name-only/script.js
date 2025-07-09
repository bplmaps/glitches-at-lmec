/* global d3 */
/* global _ */
/* global autocomplete */
/* global topojson */

d3.select("#instructions-button")
  .on("click", ()=>{ d3.select("#instructions-button").classed("is-hidden", true); d3.select("#close-button").text("Start"); d3.select("#message-p").text("Select a variable, like income or housing value, to compare in the top menu. You'll see a single city or town ranked relative to its neighbors. The scatterplot shows the overall distribution in the state. Click on a town name or a point in the scatterplot to choose a new town. You can also choose a town by typing its name in the search box or clicking on the indicator map.") });

d3.select("#close-button")
  .on("click", ()=>{ d3.selectAll(".modal").classed("is-active", false); })

d3.select(".modal-background")
  .on("click", ()=>{ d3.selectAll(".modal").classed("is-active", false); })

if(location.hash === "#start") {
  d3.selectAll(".modal").classed("is-active", false);
}

var xScale = d3
  .scaleLinear()
  .domain([0, 1])
  .range([750, 0])
  .clamp(true);

var projection = d3
  .geoConicConformal()
  .parallels([41 + 43 / 60, 42 + 41 / 60])
  .rotate([71 + 30 / 60, 0]);

const colorScaler = d3
  .scaleOrdinal()
  .domain([1, 10])
  .range(d3.schemeTableau10);

const mapSvgWidth = document.getElementById("map-svg").clientWidth > 200 ? document.getElementById("map-svg").clientWidth : 200;

const colorFunction = g => {
  let ix = neighbors[selectedTown].indexOf(g) + 1;

  if (g === selectedTown) {
    return colorScaler(0);
  } else if (ix > 0) {
    return colorScaler(ix);
  } else {
    return "#f3f3f3";
  }
};

const styleFunction = d => {
  if (d.GEOID === selectedTown) {
    return "selected-circle hoverable-circle";
  } else if (neighbors[selectedTown].includes(d.GEOID)) {
    return "neighbor-circle hoverable-circle";
  } else {
    return "other-circle";
  }
};

const textHintFunction = d => {
  if (d.GEOID === selectedTown) {
    return d.TOWN;
  } else if (neighbors[selectedTown].includes(d.GEOID)) {
    return d.TOWN.substring(0, 3);
  } else {
    return;
  }
};

const textClassFunction = d => {
  if (d.GEOID === selectedTown) {
    return "text-selected";
  } else if (neighbors[selectedTown].includes(d.GEOID)) {
    return "text-neighbor";
  } else {
    return "text-none";
  }
};

const townInfoContentWriter = d => {
  let c = colorFunction(d.geoid);
  let townLabel = `<strong style="color: ${c}"><svg height="8" width="8"><circle r="4" cx="4" cy="4" fill="${c}"></svg> ${recaser(
    geoidNames.filter(g => g.GEOID === d.geoid)[0].TOWN
  )}</strong>`;
  let v = getCensusData(d.geoid);
  let fv = selectedOption.formatter(v);

  if (d.geoid === selectedTown) {
    let above = neighbors[selectedTown].filter(x => {
      return getCensusData(x) >= v;
    }).length;
    let below = neighbors[selectedTown].length - above;

    return `<div class="comparison-label">↑ ${above} neighbors ${selectedOption.highComp}</div>${townLabel} has a <span class="underline">${selectedOption.title}</span> of <span class="underline">${fv}</span><div class="comparison-label">↓ ${below} neighbors ${selectedOption.lowComp}</div>`;
  } else {
    return `${townLabel} ${fv}`;
  }
};

const circleClickFunction = (e, d) => {
  if (neighbors[selectedTown].includes(d.GEOID)) {
    switchNeighbor(d.GEOID);
  } else {
    switchNeighbor(d.GEOID);
  }
};

const switchNeighbor = g => {
  selectedTown = g;
  classifyCircles();
};

const recaser = d => {
  return _.startCase(_.lowerCase(d));
};

var neighbors;
var censusData;
var geoidNames;
var selectedTown = "2502507000";
var municipalities;

var description = d3.select("#description-holder");

const cg = d3.select("#circles");
var circles;
const tg = d3.select("#text-hints");
var textHints;

var mapsvg = d3.select("#map-svg").append("g");

var munimap;

var timelineLabelLeft = d3.select("#timeline-label-left");
var timelineLabelRight = d3.select("#timeline-label-right");

var scatterplotLabelTop = d3.select("#scatterplot-label-top");
var scatterplotLabelBottom = d3.select("#scatterplot-label-bottom");

var options = [
  {
    v: "DP03_0062E",
    title: "median household income",
    lowComp: "are less wealthy",
    highComp: "are more wealthy",
    formatter: function(d) {
      return `$${d.toLocaleString()}`;
    }
  },
  {
    v: "DP03_0119PE",
    title: "family poverty rate",
    lowComp: "have fewer families in poverty",
    highComp: "have more families in poverty",
    formatter: function(d) {
      return `${d}%`;
    }
  },
  {
    v: "DP04_0089E",
    title: "median owner-occupied home value",
    lowComp: "are less expensive",
    highComp: "are more expensive",
    formatter: function(d) {
      return `$${d.toLocaleString()}`;
    }
  },
  {
    v: "DP05_0037PE",
    title: "percent white population",
    lowComp: "are less white",
    highComp: "are more white",
    formatter: function(d) {
      return `${d}%`;
    }
  },
  {
    v: "DP02_0068PE",
    title: "percent of the population with a bachelor's degree or higher",
    lowComp: "have fewer BA holders",
    highComp: "have more BA holders",
    formatter: function(d) {
      return `${d}%`;
    }
  },
  {
    v: "DP02_0093PE",
    title: "percent of the population that is foreign-born",
    lowComp: "have less percent foreign-born",
    highComp: "have more percent foreign-born",
    formatter: function(d) {
      return `${d}%`;
    }
  }
];

var selectedOption = options[0];

const datasets = Promise.all([
  d3.json("neighbors.json"),
  d3.json("mass-municipalities.json")
]);

datasets.then(d => {
  setupMenu();
  neighbors = d[0];
  municipalities = d[1];

  geoidNames = municipalities.objects["mass-municipalities"].geometries.map(
    x => {
      return { GEOID: x.properties.GEOID, TOWN: x.properties.massgis_name };
    }
  );

  var autocompleteInput = document.getElementById("autocomplete-entry");
  autocomplete({
    input: autocompleteInput,
    fetch: function(text, update) {
      text = text.toLowerCase();
      var suggestions = geoidNames
        .filter(g => g.TOWN.toLowerCase().startsWith(text))
        .map(x => {
          return { label: recaser(x.TOWN), geoid: x.GEOID };
        });
      update(suggestions);
    },
    onSelect: function(item) {
      autocompleteInput.value = "";
      switchNeighbor(item.geoid);
    }
  });

  munimap = mapsvg
    .selectAll("path")
    .data(
      topojson.feature(
        municipalities,
        municipalities.objects["mass-municipalities"]
      ).features
    )
    .join("path")
    .on("click", (e, d) => {
      switchNeighbor(d.properties.GEOID);
    });

  circles = cg
    .selectAll("circle")
    .data(geoidNames)
    .join("circle");

  textHints = tg
    .selectAll("text")
    .data(geoidNames)
    .join("text")
    .attr("text-anchor", "middle");

  loadVariable();
});

function loadVariable() {
  d3.json(
    `https://api.census.gov/data/2019/acs/acs5/profile?get=GEO_ID,${selectedOption.v}&for=county%20subdivision:*&in=state:25`
  ).then(d => {
    censusData = d.slice(1).map(x => {
      return { geoid: x[0].slice(-10), v: parseFloat(x[1]) };
    });

    let vExtent = d3.extent(censusData.filter(d => d.v > 0).map(d => d.v));
    xScale.domain(vExtent);

    scatterplotLabelTop.text(selectedOption.formatter(vExtent[1]));
    scatterplotLabelBottom.text(selectedOption.formatter(vExtent[0]));

    simulate();
    classifyCircles();
  });
}

function setupMenu() {
  var menu = d3.select("#variable-selector");
  menu
    .selectAll("option")
    .data(options)
    .join("option")
    .attr("value", (d, i) => {
      return i;
    })
    .text(d => d.title);

  menu.on("change", function(e, d) {
    selectedOption = options[this.value];
    loadVariable();
  });
}

function getCensusData(g) {
  var f = censusData.filter(x => {
    return x.geoid === g;
  });
  return f.length > 0 ? f[0].v : 0;
}

function simulate() {
  d3.forceSimulation(geoidNames)
    .force("charge", d3.forceManyBody().strength(0))
    .force("x", d3.forceX().x(0))
    .force(
      "y",
      d3
        .forceY()
        .strength(6)
        .y(function(d) {
          return xScale(getCensusData(d.GEOID));
        })
    )
    .force("collision", d3.forceCollide().radius(4))
    .on("tick", () => {
      circles
        .attr("r", 3.5)
        .attr("cx", d => {
          return d.x;
        })
        .attr("cy", d => {
          return d.y;
        });

      textHints
        .attr("x", d => {
          return d.x;
        })
        .attr("y", d => {
          return d.y - 5;
        });
    });
}

function classifyCircles() {
  circles
    .style("fill", d => colorFunction(d.GEOID))
    .attr("class", styleFunction)
    .on("click", circleClickFunction);

  textHints.text(textHintFunction).attr("class", textClassFunction);

  projection.fitExtent(
    [[100, 100], [mapSvgWidth - 100, 150]],
    topojson
      .feature(municipalities, municipalities.objects["mass-municipalities"])
      .features.filter(x => x.properties.GEOID === selectedTown)[0]
  );
  munimap
    .attr("d", d3.geoPath().projection(projection))
    .attr("class", "muni-line");
  munimap.attr("fill", d => colorFunction(d.properties.GEOID));

  let allTowns = neighbors[selectedTown].map(x => {
    return { geoid: x, v: getCensusData(x) };
  });

  allTowns.push({ geoid: selectedTown, v: getCensusData(selectedTown) });

  allTowns.sort((a, b) => {
    return b.v - a.v;
  });

  description
    .selectAll(".town-info")
    .data(allTowns)
    .join("div")
    .attr("class", x => {
      return x.geoid === selectedTown
        ? "town-info selected-town-info"
        : "town-info neighbor-town-info";
    })
    .html(townInfoContentWriter)
    .on("click", (e, d) => {
      switchNeighbor(d.geoid);
    })
    .on("mouseover", (e, d) => {
      circles.attr("stroke", x => {
        return x.GEOID === d.geoid ? "black" : "";
      });
    })
    .on("mouseout", () => {
      circles.attr("stroke", "");
    });
}
