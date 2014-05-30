
require('fs').readdirSync(__dirname + "/action/cli").forEach(function (f) {
    if (!f.match(/\.js$/) || !f.match(/^cli_.+/)) return;
    module.exports[f.replace(/\.js$/, '')] = require('./action/cli/' + f);
});

require('fs').readdirSync(__dirname + "/action/http").forEach(function (f) {
    if (!f.match(/\.js$/)) return;
    module.exports[f.replace(/\.js$/, '')] = require('./action/http/' + f);
});

//app根路径
Object.defineProperty(global, 'APP_ROOT', {
    enumerable : true,
    writable : false,
    value : fis.util.realpath(__dirname)
});

//mongo bin路径
Object.defineProperty(global, 'DB_BIN_DIR', {
    enumerable : true,
    writable : false,
    value :  fis.util.readJSON(APP_ROOT + '/setting.json').db.value.binDir.value
});

//log 路径
Object.defineProperty(global, 'LOG_DIR', {
    enumerable : true,
    writable : false,
    value :  fis.util.readJSON(APP_ROOT + '/setting.json').log.value.logDir.value
});