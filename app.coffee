axis            = require 'axis-css'
autoprefixer    = require 'autoprefixer-stylus'
dynamic_content = require 'dynamic-content'

module.exports =
  ignores: ['readme.md', '**/layout.*', '**/_*', '.gitignore']

  stylus:
    use: [axis(), autoprefixer()]

  extensions: [dynamic_content()]

  locals:
    formatDate: (date) ->
      months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
      ]
      date = date.toString()
      parts = date.split('/')
      return months[parts[0]] + ' ' + parts[1] + ', ' + parts[2]

    sort: (ary, opts) ->
      opts ||= {}
      opts.by = opts.by || 'order'

      if opts.order == 'asc'
        fn = (a, b) -> if (a[opts.by] > b[opts.by]) then -1 else 1
      else
        fn = (a, b) -> if (a[opts.by] < b[opts.by]) then -1 else 1

      if opts.by == 'date'
        fn = (a,b) ->
          if (new Date(a[opts.by]) > new Date(b[opts.by])) then -1 else 1

      if opts.fn then fn = opts.fn

      ary.sort(fn)
