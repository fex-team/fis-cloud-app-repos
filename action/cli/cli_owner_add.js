var owner_helper = require("./owner_helper.js");

module.exports = function(req, res, app){
    owner_helper.owner_auth("add", req, res, app)
};
