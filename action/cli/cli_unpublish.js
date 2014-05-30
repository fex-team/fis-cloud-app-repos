var Component = require('../../lib/component.js');

module.exports = function(req, res, app){
    var req_user = req.body.user,
        req_component = req.body.component;

    Component.removeComponent(req_component.name, req_component.version, req_user.name, function(error, message){
        if(error){
            res.send(500, error);
        }else{
            res.send(200, message);
        }
    })
};
