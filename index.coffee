# Tape
# SFZILabs 2021

ParseCSV = require 'csv-parse/lib/sync'
Mustache = require 'mustache'
Strings = require './strings'
TOML = require 'toml'
_ = require 'lodash'

{ statSync, readdirSync, readFileSync, writeFileSync, existsSync } = require 'fs'
{ join, relative, resolve, basename, extname, sep } = require 'path'
{ execFileSync } = require 'child_process'
{ retLua } = require './src/util'
{ program } = require 'commander'
{ log } = console

debug = ->

explored = new Set()

explorePath = (target, files) ->
	actual = resolve target
	if existsSync actual
		if explored.has actual
			return debug 'skipping', actual, '(already explored)'
		else explored.add actual

		stat = statSync actual
		if stat.isDirectory()
			debug 'exploring directory', target
			for child in readdirSync actual
				explorePath (join target, child), files

		else if stat.isFile()
			files.add actual
			debug 'added target file', target
	else
		debug 'skipping', target, '(unknown type)'

resolveTargets = (base, args) ->
	files = new Set()
	for dir in args
		explorePath (join base, dir), files

	Array.from files

Transformers =
	'.moon': (content, path) -> execFileSync 'moonc',  ['-p', path]
	'.json': (content) -> retLua JSON.parse content
	'.csv': (content) -> retLua ParseCSV content, skip_empty_lines: true
	'.toml': (content) -> retLua TOML.parse content
	'.txt': retLua
	'.lua': _.identity

getFileTransformer = (path) ->
	ext = extname path
	if t = Transformers[ext]
		t
	else
		throw new Error "No transformer for extension #{ext}!"

readAndTransform = (path) ->
	transformer = getFileTransformer path
	content = (readFileSync path).toString()
	_.trim transformer content, path

removeExtension = (path) ->
	path.substring 0, path.length - (extname path).length

getBundledName = (path, options, entrypoint) ->
	
	unless options.keepExtension
		path = removeExtension path

	if options.namespace
		parts = path.split sep
		if parts[0] == entrypoint
			parts.shift()
			path = parts.join sep

	unless options.separator == '\\'
		while path.includes '\\'
			path = path.replace '\\', options.separator
	
	pattern = options.separator + 'main'
	if options.initify
		if _.endsWith path, pattern
			debug 'initified', path
			path = path.substring 0, path.length - pattern.length

	path

findMain = (assets, entrypoint, options) ->
	main = if entrypoint == '.'
		options.main
	else
		if assets.main
			'main'
		else
			"#{entrypoint}#{options.separator}#{options.main}"

	return main if assets[main]

writeBundle = (bundle, options) ->
	path = resolve options.output
	debug 'writing bundle to', options.output
	writeFileSync path, bundle

program
	.name 'tape'
	.version '2.0.0'

	.arguments '<directories...>', 'specify input directories'
	
	.option '-o, --output <path>', 'output target', 'dist.lua'
	.option '-d, --dir <path>', 'base directory', '.'
	.option '-s, --separator <char>', 'module separator character', '/'
	.option '-p, --prelude <path>', 'file to include before modules'
	.option '-m, --main <name>', 'name of main', 'main'
	.option '-i --initify', 'initify modules', false
	.option '-n, --namespace', 'drop the namespace of the main target', false
	.option '-v, --verbose', 'debug logging', false

	.description 'tape bundler',
		directories: 'the directories to bundle'

	.action (args, options) ->
		entrypoint = args[0]
		actual = resolve options.dir
		assets = {}

		if options.verbose
			debug = log
			debug 'bundling will be verbose'

		debug 'base is', options.dir
		debug 'separator is', options.separator
		debug 'initify is', options.identity and 'on' or 'off'

		# args are targets: [string]
		# flags has output: string, dir: string <src>
		debug 'resolving targets'
		files = resolveTargets options.dir, args
		debug 'finished resolving'

		if options.namespace
			debug 'dropping namespace', entrypoint

		for f in files
			content = readAndTransform f
			name = getBundledName (relative actual, f), options, entrypoint
			debug 'bundled', name
			assets[name] = content

		main = findMain assets, entrypoint, options
		unless main
			throw new Error 'Failed to find main!'
		else debug 'main is', main

		debug 'rendering template'
		prelude = if options.prelude
			actual = (join actual, options.prelude)
			if existsSync actual
				debug 'including prelude', options.prelude
				content = readAndTransform actual
				"\n#{content}\n"
			else throw new Error "Failed to find prelude #{options.prelude}"

		bundle = Mustache.render Strings.bundle, {
			polyfill: Strings.polyfill
			prelude: prelude or ''
			entrypoint: Mustache.render Strings.main, {
				name: main
			}
			modules: _.map assets, (content, name) ->
				Mustache.render Strings.module, {
					content, name
				}
		}

		writeBundle bundle, options
		debug 'done'

try
	program.parse()
catch E
	console.error 'BUNDLE ERROR:', E.message
