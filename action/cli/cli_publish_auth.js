var component_helper = require("./component_helper.js");

module.exports = function(req, res, app){
    component_helper.component_auth("publish", req, res, app);
};
