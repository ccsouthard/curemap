// The SVG container
var width = 960,
  height = 600,
  active,
  pin;

width = document.getElementById('map').offsetWidth - 10;
height = width / 2;

var color = d3.scale.category10();

var projection = d3.geo.mercator()
  .translate([width / 2, height / 2])
  .scale(width);

var path = d3.geo.path()
  .projection(projection);

var svg = d3.select("#map").append("svg")
  .attr("width", width)
  .attr("height", height);

svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .on("click", reset);

var g = svg.append("g");

svg.append("defs")
  .append('pattern')
  .attr('id', 'background')
  .attr('patternUnits', 'userSpaceOnUse')
  .attr('width', 100)
  .attr('height', 100)
  .append("image")
  .attr("xlink:href", "img/gradient.png")
  .attr('width', 100)
  .attr('height', 100);

var icon = "M256,64c-65.9,0-119.3,53.7-119.3,120c0,114.6,119.3,264,119.3,264s119.3-149.4,119.3-264C375.3,117.7,321.9,64,256,64zM256,242.2c-31.2,0-56.4-25.4-56.4-56.7c0-31.3,25.3-56.8,56.4-56.8c31.2,0,56.4,25.4,56.4,56.8C312.4,216.8,287.2,242.2,256,242.2z";


function click(d) {
  if (active === d) return reset();
  g.selectAll(".active").classed("active", false);
  d3.select(this).classed("active", active = d);

  var b = path.bounds(d);
  g.transition().duration(750).attr("transform",
    "translate(" + projection.translate() + ")"
    + "scale(" + .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height) + ")"
    + "translate(" + -(b[1][0] + b[0][0]) / 2 + "," + -(b[1][1] + b[0][1]) / 2 + ")");

  pin.transition().duration(750).attr("transform", function (d) {
    var projected = projection([d.longitude_deg, d.latitude_deg]);
    return "translate(" + (parseFloat(projected[0]) - 6) + "," + (parseFloat(projected[1]) - 9) +
    ") scale(.02, .02)"
  })
}

function reset() {
  g.selectAll(".active").classed("active", active = false);
  g.transition().duration(750).attr("transform", "");

  pin.transition().duration(750).attr("transform", function (d) {
    var projected = projection([d.longitude_deg, d.latitude_deg]);
    return "translate(" + (parseFloat(projected[0]) - 13) + "," + (parseFloat(projected[1]) - 21) +
    ") scale(.05, .05)"
  })
}


var tooltip = d3.select("#map").append("div")
  .attr("class", "tooltip hidden");

queue()
  .defer(d3.json, "data/world-110m.json")
  .defer(d3.csv, "data/airports.csv")
  .await(ready);

function ready(error, world, names) {

  var countries = topojson.object(world, world.objects.countries).geometries;

  var country = g.selectAll(".country").data(countries);

  country
    .enter()
    .insert("path")
    .attr("class", function (d, i) {
      return "country id" + d.id;
    })
    .attr("d", path)
    .on("click", click)
    .attr("fill", '#6f4771');

  pin = g.selectAll(".pin")
    .data(names)
    .enter()
    .append("path", ".pin")
    .attr("d", icon)
    .attr("transform", function (d) {
      var projected = projection([d.longitude_deg, d.latitude_deg]);
      return "translate(" + (parseFloat(projected[0]) - 13) + "," + (parseFloat(projected[1]) - 21) +
      ") scale(.05, .05)"
    })
    .attr("class", "pin")
    .attr("fill", "white");

  //Show/hide tooltip
  pin
    .on("mousemove", function (d, i) {
      var mouse = d3.mouse(svg.node()).map(function (d) {
        return parseInt(d);
      });

      tooltip
        .classed("hidden", false)
        .attr("style", "left:" + (mouse[0] + 25) + "px;top:" + mouse[1] + "px")
        .html('<p><b>Name</b>: ' + d.name + '</p><p><b>Type</b>: ' + d.type.replace('_', ' ') + '</p>')
    })
    .on("mouseout", function (d, i) {
      tooltip.classed("hidden", true)
    });


}