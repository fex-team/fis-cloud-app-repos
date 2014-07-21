var render_helper = require("../../lib/render.js"),
    marked = require('marked'),
    fs = require('fs');

module.exports = function(req, res, app){
    render_helper.setRender(app);
    var pathinfo = fis.util.pathinfo(require.resolve('fis-cloud-app-repos'));
    var path = pathinfo.dirname + "/doc/component.md";
    var content = fis.util.read(path);
    res.render("doc",{
        appName : app.get("appName"),
        doc : marked(content)
    });
};