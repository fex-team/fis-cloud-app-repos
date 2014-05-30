var Component = require("../../lib/component.js"),
	keyword = require("../../lib/keyword.js"),
    render_helper = require("../../lib/render.js"),
    async = require('async');

module.exports = function(req, res, app){
    res.set('connection', 'close');
    render_helper.setRender(app);
    var type = req.query.type || 'all';
    var page = req.query.page || 1;
    async.parallel({
    	components : function(callback){
            //query, limit, page, callback
            var query = new Array();
            query.push(eval("/" + type + "/i"));
    		Component.getComponentByPage({"keywords" : {$in : query}}, 10, page, function(error, components){
    			if(error){
	                callback(error);
	            }else if(components == null){
	                callback(error, null);
	            }else{
	                callback(error, components);
	            }
    		});
    	},
    	categories : function(callback){
            	keyword.getCategories(callback);
        },
        hotTags : function(callback){
        		keyword.getHotTags(callback);
        }
    }, function(error, results){
        if(error){
            res.send(500, error);
        }else{
            res.render("category", {
                data : results,
                appName : app.get("appName"),
                redirectUrl : req.originalUrl,
                searchUrl : "/" + app.get("appName") + "/component_search",
                username : app.get("userName") ? app.get("userName") : null,
                type : type,
                page : page,
                startPage : (page - 1) * 10 + 1,
                endPage : (page - 1) * 10 + 10
            });
        }
    }
    );
};