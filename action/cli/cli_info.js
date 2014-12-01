var Component = require('../../lib/component.js');

module.exports = function(req, res, app){
    var query = {};
    if(req.query.q){
        query = req.query.q;
        Component.getComponentByName(query, function(err, result){
            if(err){
                res.json(500, {error : err});
            }else{
                res.json(200, result);
            }
        });
    }
};


