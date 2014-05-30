var User = require("../../lib/user.js"),
    Component = require('../../lib/component.js');

module.exports.owner_auth = function(op, req, res, app){
    var req_user = req.body.user,
        req_component = req.body.component,
        options = req.body.options;

    User.getUserByName(options.username, function(error, opuser){
        if(error){
            res.send(500, "Owner " + op + " error " + error);
        }else if(opuser == null){
            res.send(500, "User [" + options.username + "] not exist, register first!");
        }else{
            User.getUserByAuth(req_user.name, req_user._auth, function(error, user){
                if(error){
                    res.send(500, "Owner " + op + " error " + error);
                }else if(user == null){
                    res.send(500, "Username or password is wrong!");
                }else{
                    Component.getComponentByName(req_component.name, function(error, component){
                        if(error){
                            res.send(500, "Owner " + op + " error " + error);
                        }else if(component == null){
                            res.send(500, "Component [" + req_component.name + "@" + req_component.version + "] not found!");
                        }else{
                            if(Component.isMaintainer(component, user.name)){
                                switch(op){
                                    case "add":
                                        Component.addMaintainer(component, opuser, function(error){
                                            if(error){
                                                res.send(500, "Owner " + op + " error " + error);
                                            }else{
                                                res.send(200, "Add user [" + opuser.name + "] success!");
                                            }
                                        });
                                        break;
                                    case "rm":
                                        Component.removeMaintainer(component, opuser.name, function(error){
                                            if(error){
                                                res.send(500, "Owner " + op + " error " + error);
                                            }else{
                                                res.send(200, "Remove user [" + opuser.name + "] success!");
                                            }
                                        });
                                        break;
                                }
                            }else{
                                res.send(500, "No permission " + op + " owner for component [" + component.name + "@" + component.version + "]");
                            }
                        }
                    });
                }
            });
        }
    });
};
