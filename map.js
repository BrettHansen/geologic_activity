var earthquakes;
var earthquakes_large;
var volcanoes;

d3.csv("earthquakes.csv", function(data) {

  earthquakes = data.slice(0, 100).filter(function(d) {
    return parseFloat(d.mag) > 3.3;
  });

  d3.csv("volcanoes.csv", function(data) {
    volcanoes = data;
    constructMap();
  });
});

function constructMap() {
  d3.json("plates.json", function(error, mapData) {
    var features = mapData.features;

    var width = $(window).width();
    var height = $(window).height();

    var color = d3.scale.quantile()
        .domain([0, 33, 150, 300, 100000])
        .range(["green", "blue", "red", "yellow"]);

    var sc = Math.min(width / 2, height) / 3.5;

    var projection = d3.geo.equirectangular()
        .scale(sc)
        .translate([width / 2, height / 2])
        .rotate([-180,0]);

    var path = d3.geo.path()
        .projection(projection);

    var graticule = d3.geo.graticule();

    var svg = d3.select("#map").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.selectAll(".land")
        .data([topojson.object(worldtopo, worldtopo.objects.land)])
        .enter().append("path")
        .attr("class","land")
        .attr("d", path);

    svg.selectAll("path")
        .data(features)
      .enter().append("path")
        .attr("d", path)
        .style("stroke", "#cc8888")
        .style("fill", "none");

    svg.selectAll("circle.all")
        .data(earthquakes)
      .enter().append("circle")
        .attr("class", "all")
        .attr("r", function(d) {
          return 5;
        })
        .attr("transform", function(d) {
          return "translate(" + projection([parseFloat(d.longitude), parseFloat(d.latitude)]) + ")";
        })
        .style("fill", function(d) {
          return color(parseFloat(d.depth));
        })
        .style("stroke", "#cccccc")
        .style("stroke-width", .5);

    svg.selectAll("circle.large")
        .data(earthquakes.filter(function(d) {
          return parseFloat(d.mag) > 5;
        }))
      .enter().append("circle")
        .attr("class", "large")
        .attr("r", function(d) {
          return 2;
        })
        .attr("transform", function(d) {
          return "translate(" + projection([parseFloat(d.longitude), parseFloat(d.latitude)]) + ")";
        })
        .style("fill", "black");

    var vols = svg.selectAll("g")
            .data(volcanoes)
        .enter().append("g");

    vols.append("circle")
        .attr("class", "vol")
        .attr("r", function(d) {
          return 4;
        })
        .attr("transform", function(d) {
          return "translate(" + projection([parseFloat(d.lng), parseFloat(d.lat)]) + ")";
        })
        .style("fill", "black")

    vols.append("text")
        .attr("class", "label")
        .attr("transform", function(d) {
          return "translate(" + projection([parseFloat(d.lng) + parseFloat(d.dx), parseFloat(d.lat) + parseFloat(d.dy)]) + ")";
        })
        .text(function(d) {
          return d.name;
        });
  });
}
