//处理同步数据库的功能
var Component = require("../../lib/component.js"),
    async = require('async'),
    cp = require("child_process"),
    fs = require("fs"),
    path = require("path"),
    logPath = fis.util.realpath(global.LOG_DIR) + '/' + fis.util.date_format("yyyy-MM-dd"),
    logFile = logPath + '/SyncLog-',
    request = require("request");
module.exports = function(req, res, app){
    res.set('connection', 'close');
    console.log("--------------------------------");
    console.log(global.LOG_DIR);
    var repos = req.query.repos;
    var remoteRepos = (repos && repos !== 'null') ? (repos + '/repos/syncList' ) : null;
    if(!remoteRepos){
        res.send(500, "sorry, sync data failed. Please set Remote Repos first");
    }
    if(!remoteRepos.match(/^http\:\/\//ig)){
        remoteRepos = 'http://' + remoteRepos;
    }
    var last = req.query.lastSyncTime;
    var lastSyncTime = (last && last !== 'null') ? parseInt(last) : 0;
    var current = req.query.currentSyncTime;
    var currentSyncTime = (current && current !== 'null') ? parseInt(current) : Date.parse(new Date());
    //发送请求，获取更新的列表，remove现有数据库中的列表，然后同步。
    var url = remoteRepos + '?lastSyncTime=' + lastSyncTime + '&currentSyncTime=' + currentSyncTime;
    logFile = logFile + lastSyncTime + '-' + currentSyncTime + '.log';
    request.get(url, function(e, r, body){
        if(e){
            fis.util.write(logFile, '[Sync Error]\n\t' + 'Error message: ' + e + '\n\t', 'utf-8', true);
            res.send(500, e);
        }else{
            //返回更新的列表，对比maintainer，开始更新任务。
            //先remove，然后dump，然后restore。
            if(r.statusCode == 200){
                body = JSON.parse(body);
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
                                    if(!isSameMaintainer(i.maintainers, components[i.name].maintainers)){
                                        var index = fis.util.array_search(i.name, names);
                                        if(index !== false){
                                            names.splice(index, 1);
                                        }
                                    }
                                });
                                fis.util.write(logFile, '[Start Sync]\n\t', 'utf-8', true);
                                fis.util.write(logFile, '[Start Remove]\n\t', 'utf-8', true);
                                async.each(names, removeComponent, function(err){
                                    if(err){
                                        fis.util.write(logFile, '[Sync Error]\t' + 'Error message: ' + err + '\n\t', 'utf-8', true);
                                        res.send(500, err);
                                    }else{
                                        fis.util.write(logFile, '[Remove done]\n\t', 'utf-8', true);
                                        var out = fs.openSync(logFile, 'a'),
                                            err = fs.openSync(logFile.replace('.log', '.error'), 'a');
                                        var sh = path.dirname(path.dirname(__dirname)) + '/lib/sync.sh';
                                        var child = cp.spawn('sh', [sh], {
                                            detached: true,
                                            stdio: ['ignore', out, err],
                                            env: {
                                                DUMPDIR : logPath + '/dump-' + lastSyncTime + '-' + currentSyncTime,
                                                BINDIR : DB_BIN_DIR
                                            }
                                        });
                                        child.unref();
                                        res.send(200, 'Start Sync');
                                    }
                                });
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


function isSameMaintainer(a, b){
    var ret = false;
    a.forEach(function(i){
        b.forEach(function(j){
            if(i.name == j.name){
                ret = true;
            }
        });
    });
    return ret;
};

function removeComponent(name, callback){
    Component.removeComponent(name, 'all', Component.ROOT_USER, function(err, result){
        if(err){
            fis.util.write(logFile, '[Sync Error]\t' + 'Pkg Name: ['+ name + ']\n\t'+ 'Error message: ' + err + '\n\t', 'utf-8', true);
            callback(null, 0);
        }else{
            fis.util.write(logFile, '[Remove Success]\t' + 'Pkg Name: ['+ name + ']\n\t', 'utf-8', true);
            callback(null, 1);
        }
    });
};

