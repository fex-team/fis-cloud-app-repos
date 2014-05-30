var render_helper = require("../../lib/render.js"),
	marked = require('marked'),
	fs = require('fs');

module.exports = function(req, res, app){
    res.set('connection', 'close');
    render_helper.setRender(app);
    var pathinfo = fis.util.pathinfo(require.resolve('fis-cloud-app-fisrepo'));
    var path =pathinfo.dirname + "/doc/component.md";
    var content = fis.util.read(path);
    res.render("doc",{
        appName : app.get("appName"),
        // nav : {
        // 	"介绍" : {
        // 		"id" : "intro"
        // 	},
        // 	"安装" : {
        // 		"id" : "installation"	
        // 	},
        // 	"使用" : {
        // 		"id" : "use",
        // 		"list" : {
        // 			"install" : {
        // 				"id" : "install",
        // 			},
        // 			"search" : {
        // 				"id" : "search",
        // 			},
        // 			"adduser" : {
        // 				"id" : "adduser",
        // 			},
        // 			"publish" : {
        // 				"id" : "publish",
        // 			},
        // 			"unpublish" : {
        // 				"id" : "unpublish",
        // 			},
        // 			"owner" : {
        // 				"id" : "owner",
        // 			},
        // 		}
        // 	},
        // 	"联系我们" : {
        // 		"id" : "connect"
        // 	}
        // },
        doc : marked(content)
    });
};