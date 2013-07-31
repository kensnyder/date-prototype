'use strict';

module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: pkg,
		banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
		'<%= grunt.template.today("mmm yyyy") %>\n' +
		'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
		'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
		' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		// Task configuration.
		clean: {
			init: ['dist','docs','<%= pkg.constructor_name %>'],
			compress: ['<%= pkg.constructor_name %>']
		},
		copy: {
			compress: {
				files: [
					{
						flatten: true,
						expand: true,
						src: ['./dist/*'],
						dest: './<%= pkg.constructor_name %>'
					}
				]
			}
		},
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true
			},
			dist: {
				src: ['src/<%= pkg.constructor_name %>.js'],
				dest: 'dist/<%= pkg.constructor_name %>.js'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dist: {
				src: '<%= concat.dist.dest %>',
				dest: './dist/<%= pkg.constructor_name %>.min.js'
			}
		},
		compress: {
			main: {
				options: {
					archive: './<%= pkg.constructor_name %>-<%= pkg.version %>-Download.zip'
				},
				files: [
					{
						src: ['./<%= pkg.constructor_name %>/*'], 
						dest: './',
						filter: 'isFile'
					}
				]
			}
		},
		qunit: {
			files: ['test/**/*.html']
		},
		jshint: {
			src: {
				options: {
					jshintrc: 'jshint.conf.json'
				},
				src: ['src/**/*.js']
			}
		},
		yuidoc: {
			compile: {
				name: '<%= pkg.name %>',
				description: '<%= pkg.description %>',
				version: '<%= pkg.version %>',
				url: '<%= pkg.homepage %>',
				options: {
					paths: ['src'],
					outdir: 'docs',
					parseOnly: false
				}
			}
		},
		watch: {
			files: ['./test/*','./src/*','./libs/*','./Gruntfile.js','./jshint.conf.json'],
			tasks: ['jshint','qunit']
		}		
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-watch');
		
	grunt.registerTask('logo', 'Copy logo to yuidoc files', function() {
		//grunt.file.copy('demos/assets/img/logo.png', 'docs/assets/css/logo.png');
	});
	
	// custom tasks	
	function extractDocs(data) {
		var docs = {
			pkg: pkg,
			events: [],
			properties: [],
			methods: [],
			staticProperties: [],
			staticMethods: [],
			options: []
		};
		docs.constructor = data.classes[pkg.constructor_name];
		data.classitems.sort(alphabetic).forEach(function(item) {
			if (item['class'] != pkg.constructor_name) {
				return;
			}
			if (item.itemtype == 'property' && item.name == 'options') {
				docs.options = item.subprops;
			}
			else if (item.itemtype == 'method') {
				docs.methods.push(item); 
			}
			else if (item.itemtype == 'property') {
				docs.properties.push(item); 
			}
			else if (item['static'] && item.itemtype == 'method') {
				docs.staticMethods.push(item); 
			}
			else if (item['static'] && item.itemtype == 'property') {
				docs.staticProperties.push(item); 
			}
			else if (item.itemtype == 'event') {
				docs.events.push(item); 
			}
		});
		docs.events = docs.events.sort(sortEventsByType);
		// remove yuidoc crossLink mustache tags
		var docStr = JSON.stringify(docs).replace(/\{\{.+?\}\}(.+?)\{\{.+?\}\}/g, '$1');
		docs = JSON.parse(docStr);
		return docs;
	}
	
	function alphabetic(a, b) {
		if (!a.name || !b.name) {
			return 0;
		}
		var nameA = a.name.substring(0,1) == '_' ? 'zzz' + a.name : a.name;
		var nameB = b.name.substring(0,1) == '_' ? 'zzz' + b.name : b.name;
		return nameA == nameB ? 0 : (nameA > nameB ? 1 : -1);
	}
	
	function sortEventsByType(a, b) {
		// Sort by the word following "Before" or "After"
		var nameA = a.name.replace(/^(Before|After)/, '');
		var nameB = b.name.replace(/^(Before|After)/, '');
		// Sort descending so that Before comes before After
		return nameA == nameB ? (a.name < b.name ? 1 : -1) : (nameA > nameB ? 1 : -1);
	}
	
	function rename(srcPath, destPath, options) {
		grunt.file.copy(srcPath, destPath, options || {});
		return grunt.file['delete'](srcPath, options || {});
	}
	
	function replaceInFile(file, find, replace) {
		var contents = grunt.file.read(file);
		return grunt.file.write(file, contents.replace(find, replace));
	}
	
	grunt.registerTask('readme', 'Compile the README based on source documentation', function() {
		var tpl = grunt.file.read('src/README.md');
		var docData = extractDocs( grunt.file.readJSON('docs/data.json') );
		var readme = grunt.template.process(tpl, {data:docData});
		grunt.file.write('./README.md', readme);
	});
	
	grunt.registerTask('updateVersions', 'Update version strings in files', function() {
		// update in dist version == '%VERSION%';
		replaceInFile('dist/'+pkg.constructor_name+'.js', '%VERSION%', pkg.version);
		// update version in package.json to match *.jquery.json
		replaceInFile('./package.json', /("version"\s*:\s*").+?"/, '$1'+pkg.version+'"');
	});
	
	// Default task.
	grunt.registerTask('default', ['jshint', 'qunit', 'clean:init', 'concat:dist', 'updateVersions', 'uglify', 'copy:compress', 'compress', 'clean:compress', 'yuidoc', 'logo', 'readme']);

};
