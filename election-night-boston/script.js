/* global d3 */
/* global topojson */

let projection = d3
  .geoConicConformal()
  .parallels([41 + 43 / 60, 42 + 41 / 60])
  .rotate([71 + 30 / 60, 0]);

const mapSvgWidth =
  document.getElementById("svg").clientWidth > 200
    ? document.getElementById("svg").clientWidth
    : 200;

const mapSvgHeight =
  document.getElementById("svg").clientHeight > 200
    ? document.getElementById("svg").clientHeight
    : 200;

let mapSvg = d3.select("#svg").append("g");
let pieSvg = d3.select("#svg").append("g");
let legendSvg = d3
  .select("#svg")
  .append("g")
  .attr("transform", `translate(${mapSvgWidth - 150},${mapSvgHeight - 150})`);

let refreshTimer = 100;

const createMap = precincts => {
  projection.fitExtent(
    [[20, 20], [mapSvgWidth - 20, mapSvgHeight - 20]],
    topojson.feature(precincts, precincts.objects["precincts"])
  );

  const path = d3.geoPath().projection(projection);

  const getCentroid = p => {
    let k = topojson
      .feature(precincts, precincts.objects["precincts"])
      .features.find(d => d.properties.WARD_PRECINCT === p.Precinct);
    let centroid = path.centroid(k);
    p.x = centroid[0];
    p.y = centroid[1];
    return p.x;
  };

  const circleScaler = d3
    .scaleRadial()
    .domain([0, 450])
    .range([0, Math.min(mapSvgWidth, mapSvgHeight) / 80]);

  const scaleCircle = p => {
    return +p.Wu + +p["Essaibi George"] > 0
      ? circleScaler(+p.Wu + +p["Essaibi George"])
      : 2;
  };

  const colorFunction = p => {
    return +p.Wu + +p["Essaibi George"] > 0
      ? d3.interpolatePiYG(
          +p.Wu / (+p.Wu + +p["Essaibi George"] + +p["Mayor Write-in"])
        )
      : "#dcdcdc";
  };

  const resultBox = d3.select("#result-box");
  const resultBoxInfo = d3.select("#result-box-info");

  const mouseoverFunction = (e, p) => {
    let denominator = +p.Wu + +p["Essaibi George"] + +p["Mayor Write-in"];
    let wuPct = denominator > 0 ? ' · ' + Math.round(
        (+p.Wu / denominator) * 100) + '%' : "";
    let egPct = denominator > 0 ? ' · ' + Math.round(
        (+p["Essaibi George"] / denominator) * 100) + '%' : "";
    resultBox
      .style("top", () => {
        return `${e.clientY + 10}px`;
      })
      .style("left", () => {
        return `${e.clientX + 10}px`;
      });
    resultBoxInfo.html(
      `<h2>Ward ${p.Precinct.substring(0, 2)} Precinct ${p.Precinct.substring(
        2
      )}</h2><strong>Wu</strong> <span class="result result-Wu">${Math.round(
        p.Wu
      )}${wuPct}</span><br><strong>Essaibi George</strong> <span class="result result-Essaibi-George">${Math.round(
        p["Essaibi George"]
      )}${egPct}</span><br><strong>Write-in</strong> <span class="result result-Mayor-Write-in">${Math.round(
        p["Mayor Write-in"]
      )}</span>`
    );
    resultBox.style("display", "block");
  };

  const clearHover = () => {
    resultBox.style("display", "none");
  };

  const pieColors = c => {
    switch (c.data) {
      case "Wu":
        return d3.interpolatePiYG(1);
        break;
      case "Essaibi George":
        return d3.interpolatePiYG(0);
        break;
      default:
        return "#ddd";
    }
  };

  const fetchResults = () => {
    console.log("fetching results");
    d3.csv(
      "https://docs.google.com/spreadsheets/d/1qaH6zTO7sOfViPFNXfeU3w-E2Vi-eK7Paq30EFKFKis/gviz/tq?tqx=out:csv&sheet=Tableau"
    ).then(populateResults);
    
  };

  const populateResults = results => {
    let fetchTime = new Date();

    pieSvg
      .selectAll("circle")
      .data(results)
      .join("circle")
      .attr("cx", getCentroid)
      .attr("cy", d => d.y)
      .attr("r", scaleCircle)
      .attr("stroke", colorFunction)
      .attr("fill", colorFunction)
      .attr("class", "circle")
      .on("mouseenter", mouseoverFunction)
      .on("mousemove", mouseoverFunction)
      .on("mouseout", clearHover);

    let pie = d3.pie().value(d => d3.sum(results, m => +m[d]))([
      "Wu",
      "Essaibi George",
      "Mayor Write-in"
    ]);

    d3.select("#pie-svg")
      .append("g")
      .attr("transform", "translate(100,100)")
      .selectAll("d")
      .data(pie)
      .join("path")
      .attr(
        "d",
        d3
          .arc()
          .innerRadius(40)
          .outerRadius(80)
      )
      .attr("fill", pieColors);

    d3.select("#overall-results-holder")
      .selectAll("div")
      .data(pie)
      .join("div")
      .attr("class", "overall-results-line")
      .html(
        d =>
          `<strong>${
            d.data
          }</strong> <span class="result result-${d.data.replace(
            " ",
            "-"
          )}">${d.value.toLocaleString()}</span>`
      );

    d3.select("#fetch-time").text(fetchTime.toLocaleTimeString());
  };

  mapSvg
    .append("path")
    .attr("d", path(topojson.mesh(precincts)))
    .attr("class", "precinct-outline");

  fetchResults();

  let countdown = setInterval(function() {
    if (refreshTimer < 1) {
      fetchResults();
      refreshTimer = 100;
    } else {
      d3.select("#refresh-timer").text(refreshTimer);
      refreshTimer = refreshTimer - 1;
    }
  }, 1000);
};

// 1K3yndPW_1wZbC_nSD6jT9AOVbk1kLEAVE9ElQ0FJ_JA
// 1qaH6zTO7sOfViPFNXfeU3w-E2Vi-eK7Paq30EFKFKis

d3.json("precincts.json").then(createMap);
