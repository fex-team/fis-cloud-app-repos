var User = require("../../lib/user.js"),
    Component = require('../../lib/component.js');

module.exports.component_auth = function(op, req, res, app){
    var req_user = req.body.user,
        req_component = req.body.component,
        options = req.body.options;

    User.getUserByAuth(req_user.name, req_user._auth, function(error, user){
        if(error){
            res.send(500, op + " error " + error);
        }else if(user == null){
            res.send(500, "Username or password is wrong!");
        }else{
            Component.getComponentByName(req_component.name, function(error, component){
                if(error){
                    res.send(500, op + " error " + error);
                }else if(component == null){
                    switch(op){
                        case "publish":
                            res.send(200, "Have the permission publish!");
                            break;
                        case "unpublish":
                            res.send(500, "Unpublish component [" + req_component.name + "@" + req_component.version + "] not exist!");
                            break;
                    }
                }else{
                    if(Component.isMaintainer(component, user.name)){
                        var hasVersion = Component.hasVersion(component, req_component.version);
                        switch(op){
                            case "publish":
                                if(options.force){
                                    res.send(200, "Can publish, I sure hope you know what you are doing.");
                                }else{
                                    if(hasVersion){
                                        res.json(500, "Component [" + req_component.name + "@" + req_component.version + "] already exist.");
                                    }else{
                                        res.send(200, "Can publish component.");
                                    }
                                }
                                break;
                            case "unpublish":
                                if(hasVersion){
                                    res.send(200, "Can unpublish component [" + component.name + "]");
                                }else{
                                    res.send(500, "Unpublish component [" + req_component.name + "@" + req_component.version + "] not exist!");
                                }
                                break;
                        }
                    }else{
                        res.send(500, "No permission " + op + " component [" + component.name + "]");
                    }
                }
            });
        }
    });
};