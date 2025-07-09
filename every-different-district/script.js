/* global d3 */

let censusVars = [
  { v: "DP03_0062E", name: "Median household income" },
  { v: "DP05_0018E", name: "Median age" },
  { v: "DP05_0077PE", name: "Percent non-Hispanic white" },
  { v: "DP02_0112PE", name: "Percent speaking only English" },
  { v: "DP02_0068PE", name: "Percent with a college degree" },
  { v: "DP02_0093PE", name: "Percent of foreign-born population" },
  { v: "DP03_0119PE", name: "Percent living in poverty" },
  { v: "DP04_0089E", name: "Median owner-occupied home value" },
  { v: "DP02_0153PE", name: "Percent of households with broadband internet"},
  { v: "DP03_0033PE", name: "Percent of workforce in agriculture, forestry, fishing and hunting, and mining"},
  { v: "DP03_0042PE", name: "Percent of workforce in educational services, and health care and social assistance"},
  { v: "DP04_0047PE", name: "Percent of housing occupied by renters" }
];

let hoverbox = d3.select("#hoverbox");

let districtClasser = d => {
  if (d.PARTY === "Republican") {
    return "district district-r";
  } else if (d.PARTY === "Democrat") {
    return "district district-d";
  } else {
    return "district district-i";
  }
};

let selectedVar;
let selectedVarName;

let censusData;

let hoverTimeout;

let tableLabels = d3.selectAll(".table-label");
let sortingModal = d3.select("#sorting-modal");

let hoverHandle = (e, d) => {
  clearTimeout(hoverTimeout);
  hoverbox
    .html(() => {
      let dist = `${d.STATE_ABBR}-${
        d["CDFIPS"] === "00" ? "all" : d["CDFIPS"]
      }`;
      return `<strong>${dist}</strong></a>: ${d.NAME}<br><span class="small">${selectedVarName}: ${Number(
        censusData.find(x => x.GEO_ID === d.GEO_ID).v
      ).toLocaleString()}</span>`;
    })
    .style("top", () => {
      return `${e.clientY + 10}px`;
    })
    .style("left", () => {
      return `${e.clientX + 10}px`;
    });
  tableLabels.style("display", "none");
  hoverbox.style("display", "block");
};

let clearHover = () => {
  hoverbox.style("display", "none");
  hoverTimeout = setTimeout(() => {
    tableLabels.style("display", "block");
  }, 1000);
};

d3.csv("./districts.csv").then(data => {
  let menu = d3.select("#menu-holder").append("select");

  d3.select("#table-guts")
    .selectAll(".district")
    .data(data)
    .join("div")
    .attr("class", districtClasser)
    .on("mouseenter", hoverHandle)
    .on("mousemove", hoverHandle)
    .on("mouseout", clearHover);

  let sorter = v => {
    selectedVar = v;
    sortingModal.style("display", "block");

    d3.json(
      `https://api.census.gov/data/2019/acs/acs5/profile?get=GEO_ID,${v}&for=congressional%20district:*`
    ).then(d => {
      censusData = d.slice(1).map(x => {
        return { GEO_ID: x[0], v: parseFloat(x[1]) };
      });

      d3.selectAll(".district").sort((a, b) => {
        return (
          censusData.find(x => x.GEO_ID === a.GEO_ID).v -
          censusData.find(x => x.GEO_ID === b.GEO_ID).v
        );
      });

      selectedVarName = censusVars.filter(x => {
        return x.v === v;
      })[0].name;
      d3.selectAll(".table-label-text").text(selectedVarName);

      sortingModal.style("display", "none");
    });
  };

  sorter(censusVars[0].v);

  menu
    .selectAll("option")
    .data(censusVars)
    .join("option")
    .attr("value", d => {
      return d.v;
    })
    .text(d => {
      return d.name;
    });

  menu.on("change", function() {
    let v = d3.select(this).property("value");
    sorter(v);
  });
});
