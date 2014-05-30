var Component = require("../../lib/component.js"),
    render_helper = require("../../lib/render.js"),
    Keyword = require("../../lib/keyword.js"),
    moment = require('moment'),
    md5 = require('MD5'),
    async = require('async');

module.exports = function(req, res, app){
    res.set('connection', 'close');
    render_helper.setRender(app);

    async.parallel({
        updateComponents : function(callback){
            Component.getComponentByTime({}, 10, function(error, updateComponents){
                if(error){
                    callback(error);
                }else if(updateComponents == null){
                    callback(error, null);
                }else{
                    for(var i=0; i<updateComponents.length; i++){
                        updateComponents[i].updateTime = moment(updateComponents[i].updateStamp).fromNow();
                        updateComponents[i].componentUrl = "/" + app.get("appName") + "/component_detail?name=" + updateComponents[i].name;
                        updateComponents[i].maintainers.forEach(function(m){
                            if(m.name ==  updateComponents[i].updateAuthor && m.email){
                                updateComponents[i].emailhash = md5(m.email);
                            }
                        });
                    }

                    callback(error, updateComponents);
                }
            });
        },
        downloadComponents : function(callback){
            Component.getComponentByDownloads({}, 10, function(error, downloadComponents){
                if(error){
                    callback(error);
                }else if(downloadComponents == null){
                    callback(error, null);
                }else{
                    for(var i=0; i<downloadComponents.length; i++){
                        downloadComponents[i].componentUrl = "/" + app.get("appName") + "/component_detail?name=" + downloadComponents[i].name;
                    }
                    callback(error, downloadComponents);
                }
            })
        },
        categories : function(callback){
            Keyword.getCategories(callback);
        },
        hotTags : function(callback){
            Keyword.getHotTags(callback);
        },
        submittorComponents : function(callback){
            Component.getUserPackageNum(callback);
        }
    },function(error, results){
        if(error){
            res.send(500, error);
        }else{
            res.render("components", {
                data : results,
                appName : app.get("appName"),
                redirectUrl : req.originalUrl,
                searchUrl : "/" + app.get("appName") + "/component_search",
                username : app.get("userName") ? app.get("userName") : null
            });
        }
    });

};
