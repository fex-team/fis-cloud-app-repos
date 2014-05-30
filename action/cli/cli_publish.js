var Component = require('../../lib/component.js');

module.exports = function(req, res, app){

    var file_path = req.files.file.path,
        file_name = req.files.file.name,
        file_type = req.files.file.type,
        file_size = Math.ceil(req.files.file.size / 1024),
        user_name = req.body.user_name,
        email = req.body.email,
        config_str = req.body.config;

    var readme_path = null;

        if(req.files.readme){
            readme_path = req.files.readme.path;
        }

    var config = JSON.parse(config_str),
        component_name = config.name;

    Component.getComponentByName(component_name, function(error, component){
        if(error){
            res.send(500, "Publish component " + error);
        }else{
            //需要添加的内容 ： latest、time、attachments、versions
            fis.db.writeFile(file_name, {}, file_path, function(error, gs){
                if(!error){
                    config._attachments = {
                        name : file_name,
                        "content-type" : file_type,
                        length : file_size
                    };
                    if(readme_path){
                        var readmeFile = Component.getReadmeFile(config.name, config.version);
                        config.readmeFile = readmeFile;
                        fis.db.writeFile(readmeFile, {}, readme_path, function(error, gs){});
                    }
                    if(component){
                        Component.updateComponent(component, config, user_name, email, function(error, result){
                            if(!error){
                                res.send(200, "Publish component [" + component.name + "@" + config.version + "] success!");
                            }else{
                                res.send(500, "Publish component [" + component.name + "@" + config.version + "] error [" + error + "]");
                            }
                        });
                    }else{
                        Component.addComponent(config, user_name, email, function(error, result){
                            if(!error){
                                res.send(200, "Publish component [" + config.name + "@" + config.version + "] success!");
                            }else{
                                res.send(500, "Publish component [" + config.name + "@" + config.version + "] error [" + error + "]");
                            }
                        })
                    }
                }else{
                    res.send(500, error);
                }
            });
        }
    });
};
