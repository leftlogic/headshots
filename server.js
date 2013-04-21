"use strict";
var express = require('express'),
    app = express(),
    path = require('path'),
    routes = require('./lib/routes')(app),
    server = require('http').createServer(app),
    port = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine' ,'hbs');

  // load hbs helpers
  require ('./views/helpers.js');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'spa6kugo3chi4rti8wajy1no5ku' }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(app.router);
});

app.configure('production', function () {
  app.set('isproduction', true);
});

server.listen(port, function () {
  process.stdout.write('Up and running on http://localhost:' + port + '\n');
});

