var db_component = fis.db.COLLECTION_LIST.pkg,
    async = require('async'),
    ROOT_USER = "root",
    Keyword = require('./keyword.js'),
    sort = require('sort-component');

module.exports.getComponentByName = function(name, callback){
    fis.db.findOne(db_component, ROOT_USER, {name : name}, callback);
};

module.exports.getComponentByQuery = function(query, fields, options, callback){
    fis.db.find(db_component, ROOT_USER, query, fields, options, callback);
};

module.exports.getOneComponent = function(query, callback){
    fis.db.findOne(db_component, ROOT_USER, query, callback);
};

module.exports.ROOT_USER = ROOT_USER;

function getMaintainerIndex(component, username){
    var maintainers = component.maintainers;
    if(maintainers){
        for(var i=0; i<maintainers.length; i++){
            if(username == maintainers[i].name){
                return i;
            }
        }
    }
    return false;
}

module.exports.isMaintainer = function(component, username){
    var maintainers = component.maintainers;
    if(maintainers && maintainers.length > 0){
        for(var i=0; i<maintainers.length; i++){
            if(username == maintainers[i].name){
                return true;
            }
        }
    }
    return false;
};

module.exports.addMaintainer = function(component, user, callback){

    if(component.maintainers){
        var index = getMaintainerIndex(component, user.name);
        if(index !== false){
            component.maintainers[index] = {
                name : user.name,
                email : user.email
            }
        }else{
            component.maintainers.push({
                name : user.name,
                email : user.email
            });
        }
    }else{
        component.maintainers = [];
        component.maintainers.push({
            name : user.name,
            email : user.email
        });
    }
    delete component._id;
    fis.db.update(db_component, user.name, {name : component.name}, component, {}, function(error){
        callback(error);
    });
};

module.exports.removeMaintainer = function(component, username, callback){
    var index = getMaintainerIndex(component, username);
    if(index !== false){
        component.maintainers.splice(index, 1);
        delete component._id;
        fis.db.update(db_component, username, {name : component.name}, component, {}, function(error){
            callback(error);
        });
    }else{
        callback("User [" + username + "] is not maintainer");
    }
};

/**
 * mongodb中key之不能含有"."
 * @param key
 */
function fixMongoDBKey(key){
    return key.replace(/\./g, "__");
}

module.exports.hasVersion = function(component, version){
    if(version == "latest" || version == "all"){
        return true;
    }
    return fis.util.in_array(version, component.versionHistory);
};

function addVersionHistory(version, historyVersion){
    var pos = fis.util.array_search(version, historyVersion);
    if(pos === false){
        historyVersion.push(version);
    }
    return sort(historyVersion);
}

function deleteVersionHistory(version, historyVersion){
    var pos = fis.util.array_search(version, historyVersion);
    if(pos !== false){
        historyVersion.splice(pos, 1);
    }
    return historyVersion;
}

function getPackageFile(pkg_name, version){
    return pkg_name + "-" + version + ".zip";
}

module.exports.addTotaldowns = function(name, callback){
    fis.db.update(db_component, ROOT_USER, {name : name}, {$inc : {"totaldowns" : 1}}, {}, callback);
};

module.exports.addComponent = function(config, username, email, callback){
    config.latest = config.version;
    config['createTime'] = fis.util.date_format("yyyy-MM-dd hh:mm:ss");
    config['updateTime'] = fis.util.date_format("yyyy-MM-dd hh:mm:ss");
    config['updateStamp'] = (new Date()).getTime();
    config['updateAuthor'] = username;
    //todo
    config['repos'] = '';
    config.totaldowns = 0;
    var historyConfig = fis.util.clone(config),
        fixVersion = fixMongoDBKey(config.version);
    config._id = config.name;
    config.versions = {};
    delete historyConfig.latest;
    config.versions[fixVersion] = historyConfig;
    config.maintainers = [
        {
            name : username,
            email : email
        }
    ];
    config.versionHistory = [config.version];
    config.permission = {
            mode : 777
    };
    //pkgname, keywords, username
    Keyword.update(config.name, config.keywords, username)
        .then(
            function(){ fis.db.insert(db_component, username, config, {}, callback); },
            function(err){ callback(err);}
        )
        .fail(function(err){ callback(err); })
        .done();
};

//需要维护一下字段 ： latest、time、attachments、versions、versionHistory
module.exports.updateComponent = function(oldConfig, newConfig, username, email, callback){
    newConfig.updateTime = fis.util.date_format("yyyy-MM-dd hh:mm:ss");
    newConfig.updateStamp = (new Date()).getTime();
    newConfig.updateAuthor = username;
    var updateConfig = fis.util.clone(newConfig);

    var version = newConfig.version;
    var versionHistory = addVersionHistory(newConfig.version, oldConfig.versionHistory);
    var latest = versionHistory[versionHistory.length - 1];
    var fixVersion = fixMongoDBKey(version);

    if(version >= latest){
        newConfig.versions = oldConfig.versions;
        newConfig.versions[fixVersion] = updateConfig;
        newConfig.versionHistory = versionHistory;
        newConfig.latest = latest;
        //更新新版本，把oldconfig 合并到 新的config
        newConfig = fis.util.merge(oldConfig, newConfig);
        //更新新版本，删掉keywords表中所有这个包，然后重新加入keywords表
        Keyword.removePkg(newConfig.name, username)
            .then(
                function(result){
                    return Keyword.update(newConfig.name, newConfig.keywords, username);
                }
            )
            .then(
                function(result){
                    delete newConfig._id;
                    fis.db.update(db_component, username, {name : newConfig.name}, newConfig, {}, callback);
                },
                function(err){ callback(err); }
            )
            .fail(function(err){ callback(err); })
            .done();
    }else{
        //update旧版本，不修改keywords表,和pkgs表
        //update旧版本，修改oldconfig中的versions字段即可，不用合并
        delete oldConfig._id;
        oldConfig.updateTime = updateConfig.updateTime = fis.util.date_format("yyyy-MM-dd hh:mm:ss");
        oldConfig.updateStamp = updateConfig.updateStamp = (new Date()).getTime();
        oldConfig.updateAuthor = updateConfig.updateAuthor = username;

        oldConfig.versions[fixVersion] = updateConfig;
        oldConfig.versionHistory = versionHistory;
        oldConfig.latest = latest;
        fis.db.update(db_component, username, {name : oldConfig.name}, oldConfig, {}, callback);
    }
};


module.exports.removeComponent = function(name, version, username, callback){
    exports.getComponentByName(name, function(error, component){
        if(error){
            callback(error);
        }else if(component == null){
            callback("Not found component [" + name + "]");
        }else{
            if(version == "all"){
                var files = [];
                for(var i=0; i<component.versionHistory.length; i++){
                    var file = getPackageFile(component.name, component.versionHistory[i]);
                    files.push(file);
                }
                async.each(files, fis.db.unlink, function(error){
                    if(error){
                        callback(error);
                    }else{
                        var config = {};
                        config.keywords = component.keywords;
                        config.name = component.name;
                        Keyword.removePkg(component.name, username)
                            .then(
                                function(){
                                    fis.db.remove(db_component, username, {name : component.name}, {}, function(error){
                                        if(error){
                                            callback(error);
                                        }else{
                                            callback(null, "Unpublish component [" + name + "@" + version + "] success!");
                                        }
                                    });
                                },
                                function(err){ callback(err);}
                            )
                            .fail(function(err){callback(err);})
                            .done();
                    }
                });
            }else{
                //删除特定版本
                if(fis.util.in_array(version, component.versionHistory, false)){
                    if(component.versionHistory.length == 1){
                        var filename = getPackageFile(name, version);
                        fis.db.unlink(filename, function(error){
                            if(!error){
                                var config = {};
                                config.keywords = component.keywords;
                                config.name = component.name;
                                Keyword.removePkg(config.name, username)
                                    .then(
                                        function(){
                                            fis.db.remove(db_component, username, {name : name}, {}, function(error, result){
                                                if(error){
                                                    callback(error);
                                                }else{
                                                    callback(null, "Unpublish component [" + name + "@" + version + "] success!");
                                                }
                                            });
                                        },
                                        function(err){callback(err);}
                                    )
                                    .fail(function(err){callback(err)})
                                    .done();
                            }else{
                                callback(error);
                            }
                        });
                    }else{
                        if(version == component.latest){
                            component.versionHistory.pop();
                            delete(component.versions[fixMongoDBKey(version)]);

                            var latest = fixMongoDBKey(component.versionHistory[component.versionHistory.length - 1]),
                                pkgInfo = component.versions[latest];
                            component = fis.util.merge(component, pkgInfo);
                            component.latest = pkgInfo.version;
                            //删除最新版本，先删掉在keyword中删掉所有pkgnam，然后把此时最新版本的keywords重新插入表中
                            Keyword.removePkg(component.name, username)
                                .then(
                                    function(result){
                                        return Keyword.update(component.name, component.keywords, username);
                                    }
                                )
                                .then(
                                    function(result){},
                                    function(err){ callback(err);}
                                )
                                .fail(function(err){callback(err);})
                                .done();
                        }else{
                            var versionHistory = component.versionHistory;
                            versionHistory = deleteVersionHistory(version, versionHistory);
                            component.versionHistory = versionHistory;
                            delete component.versions[fixMongoDBKey(version)];
                        }
                        fis.db.update(db_component, username, {name : name}, component, {}, function(error, result){
                            if(!error){
                                var pkgFile = getPackageFile(name, version);
                                fis.db.unlink(pkgFile, function(error, result){
                                    callback(null, "Unpublish component [" + name + "@" + version + "] success!");
                                });
                            }else{
                                callback(error);
                            }
                        });
                    }
                }else{
                    callback("Unpublish component [" + name + "@" + version + "] not exist!");
                }
            }
        }
    });
};

module.exports.getComponentAttachment = function(name, version, callback){
    fis.db.findOne(db_component, ROOT_USER, {name : name}, function(error, component){
        if(!error){
            if(component){
                if(version == "latest"){
                    version = component.version;
                }
                var fixVersion = fixMongoDBKey(version),
                    versionComponent = component.versions[fixVersion];
                if(versionComponent){
                    var filename = versionComponent._attachments.name,
                        filetype = versionComponent._attachments["content-type"];
                    callback(null, filename, filetype);
                }else{
                    callback("Component [" + name + "@" + version + "] not found!");
                }
            }else{
                callback("Component [" + name + "] not found!");
            }
        }else{
            callback(error);
        }
    });
};

module.exports.getReadmeFile = function(name, version){
    return name + "-" + version + ".README.md";
};

module.exports.getReadmeContent = function(name, version, callback){
    var readme = exports.getReadmeFile(name, version);
    fis.db.read(readme, {}, function(error, stream){
        if(error){
            callback(error);
        }else{
            callback(null, stream);
        }
    });
};

module.exports.getComponentByTime = function(query, limit, callback){
    fis.db.find(db_component, ROOT_USER, query, {"name":true, "maintainers":true,"updateAuthor":true, "updateStamp":true, "version":true}, {}, function(error, cursor){
        if(error){
            callback(error);
        }else if(cursor == null){
            callback(null, null);
        }else{
            cursor.sort({"updateTime" : -1}).limit(limit).toArray(function(error, components){
                if(!error){
                    callback(null, components);
                }else{
                    callback(error);
                }
            });
        }
    });
};

module.exports.getComponentByDownloads = function(query, limit, callback){
    fis.db.find(db_component, ROOT_USER, query, {"name":true, "totaldowns":true}, {}, function(error, cursor){
        if(error){
            callback(error);
        }else if(cursor == null){
            callback(null, null);
        }else{
            cursor.sort({"totaldowns" : -1}).limit(limit).toArray(function(error, components){
                if(!error){
                    callback(null, components);
                }else{
                    callback(error);
                }
            });
        }
    });
};

module.exports.getComponentsByUser = function(username, callback){
    var queryObj = {
            "maintainers.name" : username
        },
        fields = {
            name : true,
            description : true,
            updateStamp : true
        };
    fis.db.find(db_component, ROOT_USER, queryObj, fields, {}, function(error, cursor){
        if(error){
            callback(error);
        }else if(cursor == null){
            callback(error, null);
        }else{
            cursor.sort({"updateTime" : -1}).toArray(function(error, components){
                if(error){
                    callback(error);
                }else{
                    callback(null, components);
                }
            });
        }
    });
};
//todo 升级查询
module.exports.search = function(query, callback){
    var reg = new RegExp(query, 'gi'),
        queryObj = {
            $or: [
                { name: reg },
                { description: reg },
                { author: reg },
                { keywords: { $in : [reg] }},
                { "repository.url": reg },
                { "versionHistory": { $in: [reg] }},
                { "maintainers": { $all : [
                    { $elemMatch : { name : reg }}
                    //todo email
                   // , { $elemMatch : { email : reg }}
                ]}},
                { "license": reg }
            ]
        },
        fields = {
            name:true,
            description:true,
            keywords: true,
            author:true,
            repository:true,
            version:true,
            license:true,
            maintainers:true
        };

    fis.db.find(db_component, ROOT_USER, queryObj, fields, {}, function(error, cursor){
        if(error){
            callback(error);
        }else if(!cursor){
            callback("Not found components!");
        }else{
            cursor.toArray(function(error, components){
                if(error){
                    callback(error);
                }else{
                    callback(null, components);
                }
            });
        }
    });
};

module.exports.getUserPackageNum = function(callback){
    fis.db.find(db_component, ROOT_USER, {}, {}, {}, function(error, cursor){
        if(error){
            callback(error);
        }else if(cursor == null){
            callback(error, null);
        }else{
            cursor.toArray(function(error, components){
                var countResult = {};
                for(var i=0; i<components.length; i++){
                    var component = components[i];
                    for(var j=0; j<component.maintainers.length; j++){
                        var maintainer = component.maintainers[j];
                        if(countResult[maintainer.name]){
                            countResult[maintainer.name]++;
                        }else{
                            countResult[maintainer.name] = 1;
                        }
                    }
                }
                var countArray = [];
                for(var name in countResult){
                    if(countResult.hasOwnProperty(name)){
                        countArray.push({
                            name : name,
                            value : countResult[name]
                        });
                    }
                }
                countArray.sort(function(a, b){
                    return a.value < b.value
                });
                callback(null, countArray);
            });
        }
    });
};

module.exports.getComponentByPage = function(query, limit, page, callback){
    var perpage = 10;
    fis.db.find(db_component, ROOT_USER, query, {"name":true, "totaldowns":true, "description" : true}, {}, function(error, cursor){
        if(error){
            callback(error);
        }else if(cursor == null){
            callback(null, null);
        }else{
            cursor.sort({"totaldowns" : -1}).skip((page - 1) * perpage).limit(limit).toArray(function(error, components){
                if(!error){
                    callback(null, components);
                }else{
                    callback(error);
                }
            });
        }
    });
};

