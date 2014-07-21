var path = require("path"),
    marked = require("marked");

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

marked.setOptions({
  highlight: function (code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});


module.exports.setRender = function(app){
    app.engine('.jade', require('jade').__express);
    app.set('views', path.dirname(__dirname) + "/template");
    app.set('view engine', 'jade');
};

module.exports.parseMarkdown = function(markdown){
    return marked(markdown);
};