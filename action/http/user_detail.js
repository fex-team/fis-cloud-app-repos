var Component = require("../../lib/component.js"),
    User = require("../../lib/user.js"),
    md5 = require('MD5'),
    moment = require('moment'),
    render_helper = require("../../lib/render.js");

module.exports = function(req, res, app){
    res.set('connection', 'close');
    render_helper.setRender(app);
    var username = req.query.name;
    if(username){
        Component.getComponentsByUser(username, function(error, components){
            if(error){
                res.render(500, error);
            }else{
                for(var i=0; i<components.length; i++){
                    components[i].updateTime = moment(components[i].updateStamp).fromNow();
                    components[i].componentUrl = "/" + app.get("appName") + "/component_detail?name=" + components[i].name;
                }
                User.getUserByName(username, function(error, user){
                    if(error){
                        res.render(500, error);
                    }else{
                        res.render("user_detail",{
                            appName : app.get("appName"),
                            user : user,
                            total : components.length,
                            components : components,
                            redirectUrl : req.originalUrl,
                            emailhash : md5(user.email),
                            isLogin : req.session.username == username
                        });
                    }
                });
            }
        })
    }else{
        res.render(500, "mission username");
    }
};
