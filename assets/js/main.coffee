# requirejs makes life a lot easier when dealing with more than one
# javascript file and any sort of dependencies, and loads faster.

# for more info on require config, see http://requirejs.org/docs/api.html#config
require.config
  paths:
    jquery: '//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min'
    d3: 'd3.min'
    topojson: 'topojson'
    queue: 'queue.v1.min'
    mapscript: 'script'
    share: 'share.min'
    d3tip: 'd3.tip.v0.6.3'
    d3geoprojection: 'd3.geo.projection.v0.min'
  waitSeconds: 0

require ['jquery'], ($) ->
  $('#menu-container a').on 'click', (e)->
    e.preventDefault()
    $('aside').animate
      left: '0px'
      500

  $('aside .close a').on 'click', (e)->
    e.preventDefault()
    $('aside').animate
      left: '-245px'
      500

  if( $('main').hasClass('page') )
    require ['share'], (Share) ->
      new Share("#share-button", {
        ui: {
          flyout: "bottom left",
        }
      });
    if( $('main').hasClass('home') )
      $('#splash .view-map').on 'click', (e)->
        e.preventDefault()
        $(window).scrollTop(0)

        $('header, main, footer').css
          visibility: 'visible'

        $('#splash').animate
          top: '-' + $(window).height()
          1000
          ->
            $('#splash').remove()

      require ['d3', 'topojson'], (e) ->
        require ['d3tip', 'd3geoprojection', 'queue'], (e) ->
          require ['mapscript'], (e) ->
            console.log 'd3 loaded'