module.exports = function (grunt) {
  var fs = require('fs'),
      path = require('path'),
      isjs = /\.js$/;

  // I hate that this ordering is hard to automate. JS Bin has it right, but meh, this is a small project
  var sourceScripts = ['webrtc.io.js', 'min.js', 'utils.js', 'bind.js', 'xhr.js', 'track.js', 'three.js', 'main.js', 'ball.js', 'game.js', 'start.js'];

  var scripts = sourceScripts.filter(function (file) {
    return isjs.test(file);
  }).map(function (file) {
    return 'public/js/' + file;
  });

  var pkg = grunt.file.readJSON('package.json');

  var distpaths = {
    script: 'public/js/build/<%= pkg.name %>-<%= pkg.version %>.js',
    map:    'public/js/build/<%= pkg.name %>.map.json', // don't version this so we overwrite
    min:    'public/js/build/<%= pkg.name %>-<%= pkg.version %>.min.js'
  };

  var config = {
    pkg: pkg,
    jshint: {
      dist: {
        files: {
          src: ['grunt.js', 'lib/**/*.js']
        }
      },
      build: {
        files: {
          src: [].slice.apply(scripts)
        }
      }
    },
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [].slice.apply(scripts),
        dest: distpaths.script
      }
    },
    uglify: {
      options: {
        compress: { unsafe: false },
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: distpaths.map,
        sourceMapPrefix: 2,
        sourceMapRoot: '/js'
      },
      dist: {
        src: scripts,
        dest: distpaths.min
          // 'public/js/<%= pkg.name %>-<%= pkg.version %>.min.js' : scripts
      }
    },
    watch: {
      files: '<%= lint.files %>',
      tasks: 'lint'
    },
    run: {}
  };

  grunt.registerTask("postbuild", function() {
    var filename = grunt.template.process(distpaths.min, pkg),
        text = fs.readFileSync( filename, "utf8" );

    grunt.log.writeln('checking ' + filename + ' (' + text.length + ')');

    // Modify map/min so that it points to files in the same folder;
    // see https://github.com/mishoo/UglifyJS2/issues/47
    // if (/\.map.json$/.test(filename)) {
    //   text = text.replace( /"public\//g, "\"/" );
    //   fs.writeFileSync( filename, text, "utf-8" );
    // } else 

    if (/\.min\.js$/.test(filename)) {
      // Wrap sourceMap directive in multiline comments (#13274)
      text = text.replace(/\n?(\/\/@\s*sourceMappingURL=)(.*)/,
        function( _, directive, path ) {
          map = "\n" + directive + path.replace( /^public\/js/, "/js" );
          return "";
        });
      if (map) {
        text = text.replace( /(^\/\*[\w\W]*?)\s*\*\/|$/,
          function( _, comment ) {
            return ( comment || "\n/*" ) + map + "\n*/";
          });
      }
      fs.writeFileSync( filename, text, "utf-8" );
    }
});


  // Project configuration.
  grunt.initConfig(config);

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task.
  grunt.registerTask('build', ['concat', 'uglify', 'postbuild']);
  grunt.registerTask('default', ['jshint']);

};
