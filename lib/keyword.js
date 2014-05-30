var db_pkgKeyword = fis.db.COLLECTION_LIST.pkgKeyword,
    ROOT_USER = "root",
    Q = require('q');

//更新keywords列表，并把新的包的keywords加入表中
module.exports.update = function(pkgname, keywords, username){
    var defer = Q.defer();
    var keywords = ['all'].concat(keywords);
    var addToSet = {$addToSet : {"pkgs" : pkgname}};
    var query = {"_id" : {$in : keywords}};

    fis.db.update(db_pkgKeyword, username, query, addToSet, {multi:true}, function(err, result){
        if(err){
            defer.reject(err);
        }else{
            //添加新的keyword
            if(result < keywords.length){
                keywords.forEach(function(key){
                    _AddNewKeyword(key, pkgname, username)
                        .then(
                            function(res){defer.resolve(res);},
                            function(err){defer.reject(err);}
                        )
                });
            }else{
                defer.resolve(result);
            }
        }
    });
    return defer.promise;
};


//删掉所有包裹。删掉keywords表中所有的pkgname，即所有的关键字中都不包含pkgname这个包
module.exports.removePkg = function(pkgname, username){
    var defer = Q.defer();
    var query = {"pkgs" : {$in : [pkgname]}};
    fis.db.update(db_pkgKeyword, username, query, {$pullAll:{"pkgs": [pkgname, null]}}, {multi:true}, function(err, result){
        if(err){
            defer.reject("remove all keyword failed");
        }else{
            defer.resolve(result);
        }
    });
    return defer.promise;
};


function _AddNewKeyword(keyword, pkgname, username){
    var deferred = Q.defer();
    fis.db.findOne(db_pkgKeyword, username, {_id: keyword}, function(err, result){
        if(err){
            deferred.rejected("find keyword failed");
        }else if(result == null){
            //新增keyword
            var doc = {
                _id : keyword,
                pkgs: [pkgname],
                permission : {mode : 777}
            };
            //collection, userid, docs, options, callback
            fis.db.insert(db_pkgKeyword, username, doc, {}, function(err, result){
                if(err){
                    deferred.reject('insert keyword failed');
                }else{
                    deferred.resolve(result);
                }
            });
        }else{
            deferred.resolve(result);
        }
    });
    return deferred.promise;
};

var DEFAULT_KEYWORD = [
    "framework", "css", "test", "widget",
    "smartyplugin", "assets", "kernal", "monitor",
    "scaffold", "html5", "utils", "all"
];

//获取默认的类型列表数目
module.exports.getCategories = function(callback){
    var categories = [];
    DEFAULT_KEYWORD.forEach(function(item){
        categories[item] = {name : item, number : 0};
    });
    fis.db.find(db_pkgKeyword, ROOT_USER, {_id: {$in:DEFAULT_KEYWORD}}, {}, {}, function(err, cursor){
        if(err){
            callback(err);
        }else{
            cursor.toArray(function(error, result){
                if(error){
                    callback(error);
                }else{
                    result.forEach(function(item){
                        fis.util.map(categories, function(k, v){
                            if(item._id == k){
                                categories[k] = {name:item._id, number:item.pkgs.length};
                            }
                        });
                    });
                    var newcate = [];
                    fis.util.map(categories, function(k, v){
                        if(v.number > 0){
                            newcate.push(v);
                        }
                    });
                    callback(null, newcate.sort(sortNumber));
                }
            });
        }
    });
};
//获取数量最多的10个keyword
module.exports.getHotTags = function(callback){
    fis.db.find(db_pkgKeyword, ROOT_USER, {}, {}, {}, function(err, cursor){
        if(err){
            callback(err);
        }else{
            cursor.toArray(function(error, result){
                if(error){
                    callback(error);
                }else{
                    var categories = [];
                    result.forEach(function(item){
                        if(item._id !== 'all' && item.pkgs.length > 0){
                            categories.push({
                                name : item._id,
                                number : item.pkgs.length
                            });  
                        }
                    });
                    callback(null, categories.sort(sortNumber).slice(0, 10));
                }
            });
        }
    });
};


function sortNumber(a ,b){
    if(a.name == 'all'){
        return -1;
    }else if(b.name == 'all'){
        return 1;
    }else{
        return b.number - a.number;
    }
};