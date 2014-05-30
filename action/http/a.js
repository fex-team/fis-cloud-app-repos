var render_helper = require("../../lib/render.js"),
    setting = require("../../lib/set.js"),
    async = require('async'),
    _ = require('underscore');

module.exports = function(req, res, app){
    render_helper.setRender(app);
    res.set('connection', 'close');
    //读取json内容，渲染到页面
    //读取json内容作为key，value在数据库中
    var updateSetting = false;
    var appName = app.get("appName");
    var json = fis.util.readJSON(APP_ROOT + '/setting.json');
    async.parallel({
            setting : function(cb){
                setting.findOne({_id:appName}, function(err, result){
                    if(err){
                        console.log(0);
                        cb(err);
                    }else if(!result){
                        console.log(result);
                        console.log(1);
                        //数据库中没有setting信息，保存到到数据库
                        var set = {_id:appName};
                        fis.util.merge(set, json);
                        setting.insert(set, {}, function(err, result){
                            if(err){
                                cb(err);
                            }else{
                                console.log(2);
                                //todo
                                delete set._id;
                                cb(null, set);
                            }
                        });
                    }else{
                        //显示数据库中的信息
                        console.log(3);
                        var set = {_id:appName};
                        fis.util.merge(set, json);
                        console.log(set);
                        if(_.isEqual(set, result)){
                            //todo diff result和json，是否需要界面显示update按钮
                        }else{
                            updateSetting = true;
                        }
                        delete result._id;
                        delete result.permission;
                        console.log(result);
                        cb(null, result);
                    }
                });
            }
        },
        function(error, results){
            if(error){
                console.log(4);
                res.send(500, error);
            }else{
                console.log(5);
                res.render("setting", {
                    appName : app.get("appName"),
                    data : results,
                    updateSetting: updateSetting
                });
            }
        }
    );
};



