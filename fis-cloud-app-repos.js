
require('fs').readdirSync(__dirname + "/action/cli").forEach(function (f) {
    if (!f.match(/\.js$/) || !f.match(/^cli_.+/)) return;
    module.exports[f.replace(/\.js$/, '')] = require('./action/cli/' + f);
});

require('fs').readdirSync(__dirname + "/action/http").forEach(function (f) {
    if (!f.match(/\.js$/)) return;
    module.exports[f.replace(/\.js$/, '')] = require('./action/http/' + f);
});
