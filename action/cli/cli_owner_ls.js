var Component = require('../../lib/component.js');

module.exports = function(req, res, app){
    var req_component = req.body.component,
        name = req_component.name;
    if(name){
        Component.getComponentByName(name, function(error, component_result){
            if(error){
                res.send(500, "Owner ls error " + error);
            }else if(component_result == null){
                res.send(500, "Component [" + req_component.name + "]@" + req_component.version + " not found!");
            }else{
                var str = "\n";
                for(var i =0; i<component_result.maintainers.length; i++){
                    str += "username : " + component_result.maintainers[i].name + " email : " + component_result.maintainers[i].email + "\n";
                }
                res.send(200, str);
            }
        });
    }else{
        res.send(500, "Owner ls must have component name.");
    }
};
