module.exports = function(grunt) {
  var package = grunt.file.readJSON('package.json');

  grunt.initConfig({
    pkg: package,
    coffee: {
      compile: {
        options: {
          bare: true
        },
        files: [{
          expand: true,
          cwd: 'src/scripts',
          src: ['**/*.coffee'],
          dest: 'dist/scripts',
          ext: '.js'
        }]
      }
    },
    pug: {
      compile: {
        options: {
          data: function() {
            var util = require('util')
            var files = {
              css: grunt.file.expand({ cwd: 'dist/' }, ['styles/reset.css', 'styles/bower/**/*.css', 'styles/**/*.css']),
              js:  grunt.file.expand({ cwd: 'dist/' }, ['scripts/bower/**/*.js', 'scripts/**/*.js'])
            }
            var template = {
              css: '<link rel=\'stylesheet\' href=\'%s\'>',
              js:  '<script src=\'%s\'></script>'
            }
            var res = {
              css: '',
              js:  ''
            }
            for (var i = 0; i < ['js', 'css'].length; i++) {
              var type = ['js', 'css'][i]
              for (var j = 0; j < files[type].length; j++) {
                res[type] += util.format(template[type], files[type][j])
              }
            }
            return res;
          }
        },
        files: [{
          expand: true,
          cwd: 'src/templates',
          src: ['**/*.pug'],
          dest: 'dist',
          ext: '.html'
        }]
      }
    },
    stylus: {
      compile: {
        options: {
          compress: false,
          import: [ 'nib' ]
        },
        files: [{
          expand: true,
          cwd: 'src/styles',
          src: ['**/*.styl'],
          dest: 'dist/styles',
          ext: '.css'
        }]
      }
    },
    watch: {
      scripts: {
        files: ['<%= coffee.compile.files[0].cwd %>/<%= coffee.compile.files[0].src %>'],
        tasks: ['newer:coffee'],
        options: { spawn: false }
      },
      styles: {
        files: ['<%= stylus.compile.files[0].cwd %>/<%= stylus.compile.files[0].src %>'],
        tasks: ['newer:stylus'],
        options: { spawn: false }
      },
      templates: {
        files: ['<%= pug.compile.files[0].cwd %>/<%= pug.compile.files[0].src %>'],
        tasks: ['newer:pug'],
        options: { spawn: false }
      },
      bower: {
        files: ['bower_components/*'],
        tasks: ['bower'],
        options: { spawn: false }
      }
    },
    bower: {
      dev: {
        dest: 'dist/',
        js_dest: 'dist/scripts/bower',
        css_dest: 'dist/styles/bower'
      }
    },
    modify_json: {
      options: {
        indent: '  ',
        fields: {
          name: package.name,
          version: package.version,
          description: package.description,
          repository: package.repository,
          keywords: package.keywords,
          authors: package.authors,
          license: package.license,
          homepage: package.homepage
        }
      },
      files: {
        src: [ 'bower.json' ]
      }
    },
    clean: {
      dev: {
        src: ['dist']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-modify-json');
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-newer');

  grunt.registerTask('default', ['clean', 'newer:modify_json', 'bower', 'newer:coffee', 'newer:stylus', 'newer:pug', 'watch']);
};
