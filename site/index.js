var generators = require('yeoman-generator')
module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments)
    this.argument('name', { type: String, required: true })
  },
  'configuring': function(){
    this.destinationRoot(this.destinationRoot()+'/src/')
    this._name = this.name == 'index'?'homepage':this.name
  },
  'writing': function() {
    this.fs.copy(this.sourceRoot()+'/scripts', this.destinationRoot()+'/scripts/'+this._name)
    this.fs.copy(this.sourceRoot()+'/styles', this.destinationRoot()+'/styles/'+this._name)
    this.fs.copyTpl(this.sourceRoot()+'/templates/index.pug', this.destinationRoot()+'/templates/'+this.name+'.pug', { name: this._name })
    this.fs.copy(this.templatePath('.*'), this.destinationRoot())
  }
});
