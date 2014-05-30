var db_setting = fis.db.COLLECTION_LIST.setting,
    async = require('async'),
    ROOT_USER = "root";

//collection, userid, query, callback
module.exports.findOne = function(query, callback){
    fis.db.findOne(db_setting, ROOT_USER, query, callback);
};

module.exports.update = function(){};

//collection, userid, docs, options, callback
module.exports.insert = function(docs, options, callback){
    fis.db.insert(db_setting,  ROOT_USER, docs, options, callback);
};

module.exports.remove = function(){};
