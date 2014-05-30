
var html2jade = require('html2jade'),
    fs = require("fs");

var html = fs.readFileSync( "./test/index.html");

html2jade.convertHtml(html, {}, function (err, jade) {
    fs.writeFileSync("./index.jdade", jade, null);
});
