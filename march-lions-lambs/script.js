/* global d3 */

d3.csv(
  "https://cdn.glitch.com/b4f7f3a0-dbc1-41b1-938c-cb5ea242a02c%2Fweather-march-min.csv?v=1617191604475"
).then(weatherData => {
  let formatDay = (d, y) => {
    return `${y}-03-${d.toString().padStart(2, "0")}`;
  };

  let getWeatherForDay = day => {
    let weather = weatherData.filter(x => {
      return x["DATE"] === day;
    })[0];
    return weather;
  };

  let table = d3.select("#content").append("table");

  table
    .append("thead")
    .append("tr")
    .selectAll("td")
    .data(d3.range(0, 32))
    .enter()
    .append("td")
    .text(d => {
      return d > 0 ? d : "Days →";
    });

  let tbody = table.append("tbody");
  let infobox = d3.select("#info-box");

  let rows = tbody
    .selectAll("tr")
    .data(d3.range(1936, 2021))
    .enter()
    .append("tr")
    .each(function(y) {
      d3.select(this)
        .append("td")
        .attr("class", "year-cell")
        .text(() => {
          return y;
        });

      d3.select(this)
        .selectAll(".day-cell")
        .data(d3.range(1, 32))
        .enter()
        .append("td")
        .attr("class", "day-cell")
        .html(d => {
          let weather = getWeatherForDay(formatDay(d, y));

          if (
            weather["TMAX"] > 50 &&
            weather["TMIN"] > 25 &&
            weather["PRCP"] < 0.1
          ) {
            return "🐑";
          } else if (weather["TMAX"] > 65 && weather["PRCP"] < 1.0) {
            return "🐑";
          } else if (weather["SNOW"] > 0.1) {
            return "🦁";
          } else if (weather["TMAX"] < 30) {
            return "🦁";
          } else {
            return "▫️";
          }
        })
        .on("mouseover touchstart", (e, d) => {
          let day = formatDay(d, y);
          let weather = getWeatherForDay(day);

          infobox.html(
            `On <strong>March ${day.split("-")[2]}, ${
              day.split("-")[0]
            }</strong>, the max temperature was <strong>${
              weather.TMAX
            }°F</strong> and the min was <strong>${
              weather.TMIN
            }°F</strong>. There was <strong>${
              weather.PRCP
            } in</strong> of precipitation and <strong>${
              weather.SNOW
            } in</strong> of snow.`
          );
        })
        .on("mouseout", () => {
          infobox.html("");
        });
    });
});
