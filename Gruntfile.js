module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-html2js');

  grunt.initConfig({
    'pkg': grunt.file.readJSON('package.json'),

    'meta': {
      'jsFilesForTesting': [
          'lib/angular/angular.js',
          'lib/angular-route/angular-route.js',
          'lib/angular-sanitize/angular-sanitize.js',
          'lib/angular-mocks/angular-mocks.js',
          'lib/angular-resource/angular-resource.js',
          'test/**/*Spec.js'
      ]
    },

    'karma': {
      'development': {
        'configFile': 'karma.conf.js',
        'options': {
          'files': [
            '<%= meta.jsFilesForTesting %>',
            'src/**/*.js'
          ],
        }
      },
    
    'dist': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '<%= meta.jsFilesForTesting %>',
            'dist/<%= pkg.name %>-<%= pkg.version %>.js'
          ],
        }
      },
      
    'minified': {
        'options': {
          'configFile': 'karma.conf.js',
          'files': [
            '<%= meta.jsFilesForTesting %>',
            'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
          ],
        }
      }
    },
    'html2js': {
      'ngDjangoTranslate': {
        'options': {
          'base': 'src'
        },
        'src': [ 'src/*.html' ],
        'dest': 'src/<%= pkg.name %>.tpls.js'
      }
    },
    'jshint': {
      'beforeconcat': ['src/**/*.js'],
    },
    
    'concat': {
      'dist': {
        'src': ['src/**/*.js'],
        'dest': 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
      }
    },

    'uglify': {
      'options': {
        'mangle': false
      },  
      'dist': {
        'files': {
          'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/<%= pkg.name %>-<%= pkg.version %>.js']
        }
      }
    },
    
    'jsdoc': {
      'src': ['src/**/*.js'],
      'options': {
        'destination': 'doc'
      }
    }
  });

  grunt.registerTask('test', ['jshint', 'karma:development']);
  grunt.registerTask('build',
    [
      'jshint',
      'karma:development',
      'html2js',
      'concat',
      'karma:dist',
      'uglify',
      'karma:minified',
      'jsdoc'
    ]);

};