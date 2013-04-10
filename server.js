"use strict";
var express = require('express'),
    app = express(),
    routes = require('./lib/routes')(app),
    server = require('http').createServer(app),
    port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

server.listen(port, function () {
  process.stdout.write('Up and running on http://localhost:' + port + '\n');
});

