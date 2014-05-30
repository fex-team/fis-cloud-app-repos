var path = require("path"),
    md = require("node-markdown").Markdown;

module.exports.setRender = function(app){
    app.engine('.jade', require('jade').__express);
    app.set('views', path.dirname(__dirname) + "/template");
    app.set('view engine', 'jade');
};

module.exports.parseMarkdown = function(markdown){
    return md(markdown);
};