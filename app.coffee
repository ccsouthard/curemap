# roots v2.1.4
# Files in this list will not be compiled - minimatch supported
grate = module.require('grate')
module.exports =
	ignore_files: ['_*', 'readme*', '.gitignore', '.DS_Store', 'workspace.xml']
	ignore_folders: ['.git', 'node_modules', '.idea']

	watcher_ignore_folders: ['components', 'node_modules', 'grate']

	# Layout file config
	# `default` applies to all views. Override for specific
	# views as seen below.
	layouts:
    default: 'layout.jade'
		# 'special_view.jade': 'special_layout.jade'
	stylus:
			plugins: ['axis-css', grate]

  # Locals will be made available on every page. They can be
  # variables or (coffeescript) functions.
  locals:
    formatDate: (date) ->
      months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      date = date.toString()
      parts = date.split('/')
      return months[parts[0]] + ' ' + parts[1] + ', ' + parts[2]
# Precompiled template path, see http://roots.cx/docs/#precompile
# templates: 'views/templates'
