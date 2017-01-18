/* jshint node: true */

var http = require('http');
var router = require('./router'); 

const _port = process.env.PORT || 3000;

http.createServer(router.handleRequest).listen(_port); 

