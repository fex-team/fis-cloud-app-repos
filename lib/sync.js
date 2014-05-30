var Component = require("./component.js"),
    async = require('async'),
    q = require('Q'),
    request = require("request");

module.exports.getList = function(logFile){
    var defer = Q.defer();
    request.get(url, function(e, r, body){
        if(e){
            fis.util.write(logFile, '[Sync Error]\n\t' + 'Error message: ' + e + '\n\t', 'utf-8', true);
            defer.reject(e);
        }else{
            //返回更新的列表，对比maintainer，开始更新任务。
            //先remove，然后dump，然后restore。
            if(r.statusCode == 200){
                //query, fields, options, callback
                //找出id已经存在而remove
                //id不存在的 忽略
                var components = [], names = [];
                body.forEach(function(item){
                    components[item.name] = item;
                    names.push(item.name);
                });
                Component.getComponentByQuery({name : { $in : names }}, {}, {}, function(err, cursor){
                    if(err){
                        fis.util.write(logFile, '[Sync Error]\n\t' + 'Error message: ' + err + '\n\t', 'utf-8', true);
                        res.send(500, err);
                    }else{
                        cursor.toArray(function(err, items){
                            if(err){
                                fis.util.write(logFile, '[Sync Error]\n\t' + 'Error message: ' + err + '\n\t', 'utf-8', true);
                                res.send(500, err);
                            }else{
                                items.forEach(function(i){
                                    //判断maintainer是否一致，一致表示同一资源，不一致表示私有资源，不同步
                                    //todo delete
                                    if(i.maintainers == components[i.name].maintainers){
                                        delete names[i.name];
                                    }
                                });
                                console.log(names);
                                res.send(200, 'Start Sync');
                            }
                        });
                    }
                });
            }else{
                fis.util.write(logFile, '[Sync Error]\n\t' + 'Error message: ' + r + '\n\t', 'utf-8', true);
                res.send(500, r);
            }
        }
    });
};

module.exports.remove = function(logFile){
    async.eachSeries(names, removeComponent, function(err){
        if(err){
            fis.util.write(logFile, '[Sync Error]\n\t' + 'Error message: ' + err + '\n\t', 'utf-8', true);
            res.send(500, err);
        }else{
            fis.util.write(logFile, '[Remove done]\n\t', 'utf-8', true);
            sync(remoteRepos);
            res.send(200, 'Start Sync');
        }
    });
};

module.exports.dump = function(logfile){

};

module.exports.restore = function(logfile){};

function removeComponent(name, callback){
    Component.removeComponent(name, 'all', Component.ROOT_USER, function(err, result){
        if(err){
            fis.util.write(logFile, '[Sync Error]\n\t' + 'Pkg Name: ['+ name + ']\n\t'+ 'Error message: ' + err + '\n\t', 'utf-8', true);
            callback(null, 0);
        }else{
            fis.util.write(logFile, '[Remove Success]\n\t' + 'Pkg Name: ['+ name + ']\n\t', 'utf-8', true);
            callback(null, 1);
        }
    });
};
