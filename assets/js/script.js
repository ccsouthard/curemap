d3.select(window).on("resize", throttle);

var width, height, zoom, projection, path, svg, countries, markers, scale = 1, marker, tip, usa;

var mode = 'international';

$('#toggle .buttons div')
  .on('click', function(d) {
    if(!$(this).hasClass('active')) {
      $('#toggle .buttons div.active').removeClass('active');
      $(this).addClass('active');
      if($(this).hasClass('usa')) {
        mode = 'us';
      } else {
        mode = 'international';
      }
      $('.d3-tip').remove();
      redraw()
    }
  });

setup();

function setup() {
  width = document.getElementById('map').offsetWidth;
  height = width * ( 500 / 960  );

  zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", position);

  if(mode != 'us') {
    projection = d3.geo.miller()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 2])
      .center([0, 20]);
  } else {
    projection = d3.geo.albersUsa()
      .scale(1000)
      .translate([width / 2, height / 2]);
  }

  path = d3.geo.path()
    .projection(projection);

  tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-15, 0])
    .html(function(d) {
      return '<p><b>Phase Number</b>: &nbsp;<a target="_blank" title="' + d.trial_link + '" href="' + d.trial_link + '">' + d.trial_id + '</a></p>' +
             '<p><b>Sponsor</b>: &nbsp;' + d.sponsor + '</p>' +
             '<p><b>Treatment</b>: &nbsp;' + d.treatment + '</p>' +
             '<p><b>Location</b>: &nbsp;' + d.location + '</p>' +
             '<p><b>Company</b>: &nbsp;<a target="_blank" href="' + d.company_link + '">' + d.company_link + '</a></p>' +
             '<span class="close">&times;</span>';
    });

  svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom)
    .call(tip)
    .append("g");

}

function position() {
  var t = d3.event.translate;
  var s = d3.event.scale;
  var h = height / 3;

  scale = s;

  t[0] = Math.min(width / 4 * (s - 1), Math.max(width * (1 - s), t[0]));
  t[1] = Math.min(height / 2 * (s - 1), Math.max(height * (1 - s), t[1]));

  zoom.translate(t);
  svg.attr("transform", "translate(" + t + ")" + " scale(" + s + ")");
  marker
    .attr('height', 26 / s)
    .attr('width', 19 / s )
    .attr('x', (-9.5 / s) + '')
    .attr('y', (-26 / s) + '');
}

queue()
  .defer(d3.json, "data/world-110m.json")
  .defer(d3.json, "data/us.json")
  .defer(d3.csv, "data/master-cure-map.csv")
  .await(ready);

function ready(error, world, usjson, csv) {

  countries = topojson.object(world, world.objects.countries).geometries;
  usa = topojson.object(usjson, usjson.objects.states).geometries;
  markers = csv;
  draw();
  initFiltering();
  d3.select('#splash .view-map').style('display', 'block');
}

function draw() {
  var country;

  if(mode != 'us')
    country = svg.selectAll(".country").data(countries);
  else
    country = svg.selectAll(".country").data(usa);

  country
    .enter()
    .insert("path")
    .attr("class", function (d, i) {
      return "country id" + d.id;
    })
    .attr("d", path)
    .attr("fill", '#6f4771');

  marker  = svg.selectAll(".marker")
    .data(markers)
    .enter()
    .append("image", ".marker")
    .attr('xlink:href', 'img/marker1.svg')
    .attr('class', 'marker')
    .attr('data-sponsor', function(d) {
      return d.sponsor;
    })
    .attr('data-treatment', function(d) {
      return d.treatment;
    })
    .attr('data-location', function(d) {
      return d.location;
    })
    .attr('data-phase', function(d) {
      return d.trial_id;
    })
    .attr('data-country', function(d) {
      return d.iso_country;
    })
    .attr('height', '26')
    .attr('width', '19')
    .attr('x', '-9.5')
    .attr('y', '-26')
    .on('click', function(d) {
      tip.hide();
      tip.show(d);
      $('.d3-tip .close').on('click', function() {
        tip.hide();
      });
    })
    .attr("transform", function(d) {
      return "translate(" + projection([
        d.longitude_deg,
        d.latitude_deg
      ]) + ")"
    });
}

function initFiltering() {
  var sponsor = [],
      treatment = [],
      location = [],
      phase = [];

  $.each(markers, function (k,v) {
    if(mode == 'us' && v.iso_country != 'US') return;
    if(typeof(v.sponsor) !== undefined) {
      if ($.inArray($.trim(v.sponsor),sponsor) === -1 && v.sponsor != '') {
        sponsor.push($.trim(v.sponsor));
      }
    }

    if(typeof(v.treatment) !== undefined) {
      if ($.inArray($.trim(v.treatment),treatment) === -1 && v.treatment != '') {
        treatment.push($.trim(v.treatment))
      }
    }

    if(typeof(v.location) !== undefined) {
      if ($.inArray($.trim(v.location),location) === -1 && v.location != '') {
        location.push($.trim(v.location))
      }
    }

    if(typeof(v.trial_id) !== undefined) {
      if ($.inArray($.trim(v.trial_id),phase) === -1 && v.trial_id != '') {
        phase.push($.trim(v.trial_id))
      }
    }

  });

  populateDropdown(sponsor, '#sponsor');
  populateDropdown(treatment, '#treatment');
  populateDropdown(location, '#location');
  populateDropdown(phase, '#phase');

  $('#filters .filter select').on('change',function() {
    var selector = '.marker';
    $.each(['sponsor', 'treatment', 'location', 'phase'], function(k, v) {
      if($('select#' + v).val() != '') {
        selector += '[data-' + v + '="' + $('select#' + v).val() + '"]';
      }
    });
    $('.marker').hide();
    $(selector).show();
  });
}

function populateDropdown(options, id) {
  options = $.unique(options);
  options.sort();
  $.each(options, function(k, v) {
    var o = new Option($.trim(v), $.trim(v));
    $(o).html($.trim(v));
    $(id).append(o);

  })
}

function redraw() {
  d3.select('svg').remove();
  setup();
  draw();
  initFiltering();
  if(mode=='us') {
    $('.marker').hide();
    $('.marker[data-country=US]').show();
  } else {
    $('.marker').show();
  }
}

var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
  throttleTimer = window.setTimeout(function () {
    redraw();
  }, 200);
}
