//处理同步数据库的功能
var Component = require("../../lib/component.js");

module.exports = function(req, res, app){
    res.set('connection', 'close');
    var lastSyncTime = parseInt(req.query.lastSyncTime);
    var currentSyncTime = parseInt(req.query.currentSyncTime);
    //获取两次时间中，更新的pkgs列表
    var query = {
        "updateStamp" : {"$gt": lastSyncTime, "$lt":currentSyncTime}
    };
    Component.getComponentByQuery(query, {_id:true, maintainers:true, updateStamp:true, name:true}, {}, function(err, cursor){
        if(err){
            res.send(500, 'sorry, Synchronize database failed, please try later');
        }else{
            cursor.toArray(function(error, components){
                if(error){
                    res.send(500, 'sorry, Synchronize database failed, please try later');
                }else{
                    res.send(200, JSON.stringify(components));
                }
            });
        }
    });
};