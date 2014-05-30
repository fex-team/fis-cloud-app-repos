var Component = require("../../lib/component.js"),
    render_helper = require("../../lib/render.js");

module.exports = function(req, res, app){
    res.set('connection', 'close');
    render_helper.setRender(app);
    var key = req.query.key;
    if(key){
        Component.search(key, function(error, components){
            if(error){
                res.send(500, "search error " + error);
            }else{
                for(var i=0; i<components.length; i++){
                    components[i].componentUrl = "/" + app.get("appName") + "/component_detail?name=" + components[i].name;
                }
                res.render("component_search", {
                    key : key,
                    redirectUrl : req.originalUrl,
                    components : components,
                    appName : app.get("appName"),
                    searchUrl : "/" + app.get("appName") + "/component_search",
                    username : app.get("userName") ? app.get("userName") : null
                });
            }
        });
    }else{
        res.send(500, "input the component you want to search");
    }
};
