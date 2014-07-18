var Component = require('../../lib/component.js');

var AdmZip = require('adm-zip'),
    fstream = require('fstream'),
    tar = require('tar'),
    zlib = require('zlib');

module.exports = function(req, res, app){
    var component_name = req.query.component;
    var component_version = req.query.version || "latest";
    Component.getComponentAttachment(component_name, component_version, function(error, file, type){
        if(!error){
            fis.db.read(file, {}, function(error, content){
                Component.addTotaldowns(component_name, function(error){
                    if(!error){
                    	//由于npm只支持gzip文件，所以需要将zip转换为gzip
                    	//使用admzip解压文件然后再转换                  	
                        var zip = new AdmZip(content);
                        var tmp = __dirname + "/../../temp/" + file + "_" + parseInt(Math.random()*100);
                        zip.extractAllTo(tmp, true);	
                        //返回的文件名称
                        var filename = file.replace(".zip",".tar.gz");

                        res.writeHead(200, {
					      'Content-Type'        : 'application/octet-stream',
					      'Content-Disposition' : 'attachment; filename=' + filename,
					      'Content-Encoding'    : 'gzip'
					    });
								 
					    //读取解压的zip文件转换为gzip后返回
					    //TODO 生成的临时解压文件未清理
					    var stream = fstream.Reader({ 'path' : tmp, 'type' : 'Directory' })
							.pipe(tar.Pack())/* Convert the directory to a .tar file */
					        .pipe(zlib.Gzip())/* Compress the .tar file */
							.pipe(res); // Write back to the response, or wherever   
					         			                            
                    }else{
                        res.send(500, error);
                    }
                });
            });
        }else{
            res.send(500, error);
        }
    });
};
