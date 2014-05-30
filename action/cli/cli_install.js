var Component = require('../../lib/component.js');

module.exports = function(req, res, app){
    var req_component = req.body.component;
    Component.getComponentAttachment(req_component.name, req_component.version, function(error, file, type){
        if(!error){
            fis.db.read(file, {}, function(error, content){
                Component.addTotaldowns(req_component.name, function(error){
                    if(!error){
                        res.set("filename", file);
                        res.set("Content-Type", type);
                        res.send(content);
                    }else{
                        res.send(500, error);
                    }
                });
            });
        }else{
            res.send(500, error);
        }
    });
};
