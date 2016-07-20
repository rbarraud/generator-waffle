module.exports = function(grunt) {
  var package = grunt.file.readJSON('package.json');
  var path = require('path')
  var rimraf = require('rimraf')
  var minimatch = require('minimatch')
  var util = require('util')

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
            var file = this.dest.replace(/(^dist\/|\.html$)/gi, '').split('/')[0]
            if(file == 'index'){ file = 'homepage' }
            var files = {
              css: function(src){ return grunt.file.expand({ cwd: 'dist/' }, ['styles/reset.css', 'styles/importer.css', 'styles/**/*.css', '!styles/bower/**/*.css']) },
              css_bower: function(src){ return grunt.file.expand({ cwd: 'dist/' }, ['styles/bower/**/*.css']) },
              js: function(src){ return grunt.file.expand({ cwd: 'dist/' }, ['scripts/**/*.js', '!scripts/bower/**/*.js', !src.endsWith('.js')?src+'/**/*.js':'!666.js']) },
              js_bower: function(src){ return grunt.file.expand({ cwd: 'dist/' }, ['scripts/bower/**/*.js']) }
            }
            var template = {
              css: '<link rel=\'stylesheet\' href=\'%s\'>',
              js:  '<script src=\'%s\'></script>'
            }
            var res = {}
            var obj = {}
            for (var namespace in files) {
              if (files.hasOwnProperty(namespace)) {
                var type = namespace.split('_')[0]
                var itype = namespace.split('_')[1]; /* semicolon of the death */
                (function(namespace, type, itype, file){
                  res[namespace] = function (src) {
                    if(obj[namespace] == null) obj[namespace] = {}
                    if(obj[namespace].exclude == null) obj[namespace].exclude = []
                    obj[namespace].files = files[namespace](src)
                    for (var i = 0; i < obj[namespace].exclude.length; i++) {
                      var index = obj[namespace].files.indexOf(obj[namespace].exclude[i])
                      if(index != -1) obj[namespace].files.splice(index, 1)
                    }
                    var r = ''
                    if(src == null){
                      for (var i = 0; i < obj[namespace].files.length; i++) {
                        r += util.format(template[type], obj[namespace].files[i])
                      }
                      return r
                    }
                    obj[namespace].files = obj[namespace].files.filter(minimatch.filter((src != file+'/afterload'?'!':'')+'scripts/*/afterload/**/*.js', {}))
                    var pre = ''
                    var index
                    if(!src.endsWith('.'+type)){
                      src += '/**/*.'+type
                    }
                    switch (type) {
                      case 'js':
                        pre += 'scripts/'
                        break
                      case 'css':
                        pre += 'styles/'
                        break
                    }
                    if (itype != null) { pre += itype+'/' }
                    var not = src[0] == '!'
                    if (src[0] == '!') { src = src.slice(1) }
                    var exclude = obj[namespace].files.filter(minimatch.filter(pre+'*.'+type, {}))
                    var exdynamic = obj[namespace].files.filter(minimatch.filter(pre+src, {}))
                    for (var i = 0; i < exdynamic.length; i++) {
                      if(exclude.indexOf(exdynamic[i]) == -1) exclude.push(exdynamic[i])
                    }
                    for (var i = 0; i < exclude.length; i++) {
                      var index = obj[namespace].files.indexOf(exclude[i])
                      var entry = obj[namespace].files.splice(index, 1)
                      if (!not){
                        obj[namespace].exclude.push(entry[0])
                        r += util.format(template[type], entry[0])
                      }
                    }
                    return r
                  }
                })(namespace, type, itype, file)
              }
            }
            return res
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
      scripts_change: {
        files: ['<%= coffee.compile.files[0].cwd %>/<%= coffee.compile.files[0].src %>'],
        tasks: ['newer:coffee'],
        options: { spawn: true, event: ['changed'] }
      },
      styles_change: {
        files: ['<%= stylus.compile.files[0].cwd %>/<%= stylus.compile.files[0].src %>'],
        tasks: ['newer:stylus'],
        options: { spawn: true, event: ['changed'] }
      },
      scripts_add: {
        files: ['<%= coffee.compile.files[0].cwd %>/<%= coffee.compile.files[0].src %>'],
        tasks: ['newer:coffee', 'pug'],
        options: { spawn: true, event: ['added', 'deleted'] }
      },
      styles_add: {
        files: ['<%= stylus.compile.files[0].cwd %>/<%= stylus.compile.files[0].src %>'],
        tasks: ['newer:stylus', 'pug'],
        options: { spawn: true, event: ['added', 'deleted'] }
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
          author: package.author,
          license: package.license,
          homepage: package.homepage
        }
      },
      files: {
        src: [ 'bower.json' ]
      }
    }
  })

  grunt.registerTask('clean', function() {
    rimraf.sync('dist')
  })

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-stylus')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-contrib-pug')
  grunt.loadNpmTasks('grunt-modify-json')
  grunt.loadNpmTasks('grunt-bower')
  grunt.loadNpmTasks('grunt-newer')

  grunt.registerTask('default', ['clean', 'newer:modify_json', 'bower', 'coffee', 'stylus', 'newer:pug', 'watch'])
}
