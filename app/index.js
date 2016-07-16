var generators = require('yeoman-generator')
module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments)
    this.argument('name', { type: String, required: true })
    this.option('lodash')
    this.option('underscore')
    this.option('angular')
    this.option('waff')
    this.option('moment')
    this.option('requirejs')
  },
  'configuring': function(){
    this.destinationRoot(this.destinationRoot()+'/'+this.name)
  },
  'writing': function() {
    this.fs.copy(this.sourceRoot(), this.destinationRoot())
    this.fs.copy(this.templatePath('.*'), this.destinationRoot())
  },
  'install': {
    init: function() {
      this.dir = process.cwd()
      this.spawnCommand('npm', ['init'], {
        cwd: this.destinationRoot()
      }).on('close', this.async())
    },
    dev: function() {
      this.spawnCommand('npm', [

        'install',
          'grunt',
          'grunt-contrib-coffee',
          'grunt-contrib-stylus',
          'grunt-contrib-watch',
          'grunt-contrib-clean',
          'grunt-contrib-pug',
          'grunt-modify-json',
          'grunt-newer',
          'grunt-bower',
        '--save-dev'
      ], {
        cwd: this.destinationRoot()
      }).on('close', this.async())
    },
    globals: function() {
      var done = this.async()
      this.prompt([{
        type: 'confirm',
        name: 'ok',
        message: 'Do you want to install grunt and bower globally? (required)\nIf you have it already installed, you can skip this step'
      }]).then(function(a) {
        if(a.ok){
          if(process.platform == 'darwin' || process.platform == 'win32'){
            this.spawnCommand('npm', ['install', 'bower', 'grunt', '-g']).on('close', done)
          } else {
            this.log('We\'re about to install ')
            this.spawnCommand('sudo', ['npm', 'install', 'bower', 'grunt', '-g']).on('close', done)
          }
        } else done()
      }.bind(this))
    },
    dependencies: function() {
      var dependencies = ['install']
      if(this.options.lodash || this.options.underscore){
        dependencies.push('lodash')
      }
      if(this.options.angular){
        dependencies.push('lodash')
      }
      if(this.options.waff){
        dependencies.push('waff-query')
      }
      if(this.options.moment){
        dependencies.push('moment')
      }
      if(this.options.requirejs){
        dependencies.push('requirejs')
      }
      if(dependencies.length > 1){
        dependencies.push('--save')
        this.spawnCommand('bower', dependencies, {
          cwd: this.destinationRoot()
        }).on('close', this.async())
      }
    }
  }
});
