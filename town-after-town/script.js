/* global d3 */
/* global topojson */



var wrapper = d3.select("#wrapper"),
  width = wrapper.node().getBoundingClientRect().width - 40,
  height = wrapper.node().getBoundingClientRect().height - 40;

var svg = d3
  .select("#map")
  .attr("width", width)
  .attr("height", height);

var projection = d3.geoMercator();

var path = d3.geoPath(projection);

var chooser = d3.select("#menu-wrapper").on("click", function() {
  chooser.classed("active", chooser.classed("active") ? false : true);
});

Promise.all([
  d3.json("towns.json"),
  d3.csv("counts.csv")
]).then(initializeMap);

function initializeMap([townTopo,counts]) {
  

  var townShapes = topojson.feature(townTopo, townTopo.objects.towns);

  projection.fitExtent([[10, 10], [width, height]], townShapes);

  var towns = svg
    .append("g")
    .attr("class", "towns-group")
    .selectAll("path")
    .data(townShapes.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "town");

  var mesh = svg
    .append("path")
    .attr("d", path(topojson.mesh(townTopo)))
    .attr("class", "outlines");

  var selector = d3.select("#menu-choices");

  
  let menu = d3.select("#menu-holder").append("select");
    menu
    .selectAll("option")
    .data(counts)
    .join("option")
    .attr("value", d => {
      return d.name;
    })
    .text(d => {
      return `${d.name} (${d.count})`;
    });
  
  menu.on("change", function() {
    let m = d3.select(this).property("value");
    colorTowns(m);
  });
  
  colorTowns(counts[0].name);

  function colorTowns(m) {
    console.log(m);
    towns.transition(200).attr("class", function(d) {
      if (d.properties.name === m) {
        return "town chosen";
      } else {
        return "town";
      }
    });
    d3.select("#chooser-label").text(m.name);
  }
}
