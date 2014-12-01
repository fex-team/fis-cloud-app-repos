var Component = require('../../lib/component.js');

module.exports = function(req, res, app){
    var query = {};
    if(req.query.q){
        var name = req.query.q;
        var version = req.query.version;
        var ref = req.query.ref || 'component.json';

        Component.getComponentAttachment(name, version, function(error, file, type){
            if(!error){

                fis.db.read(file, {}, function(error, content){
                    var AdmZip = require('adm-zip');
                    var zip = new AdmZip(content);
                    var contents = zip.readAsText(ref);

                    res.json({
                        contents: new Buffer(contents).toString('base64'),
                        encoding: 'base64'
                    });
                });

            }else{
                res.send(500, error);
            }
        });
    }
};


