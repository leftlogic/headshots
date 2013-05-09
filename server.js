"use strict";
var port = process.env.PORT || 8080,
    express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    parseCookie = express.cookieParser(),
    webRTC = require('webrtc.io').listen(server),
    // WebSocketServer = require('ws').Server,
    // wss = new WebSocketServer({ server: server }),
    MemoryStore = express.session.MemoryStore,
    store = new MemoryStore(),
    gzippo = require('gzippo'),
    pkg = require('./package.json');

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine' ,'hbs');

  app.set('version', pkg.version);
  app.set('build', pkg.version + '-' + Date.now());

  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());

  app.use(express.cookieParser('spa6kugo3chi4rti8wajy1no5ku'));
  app.use(express.session({ store: store, secret: 'spa6kugo3chi4rti8wajy1no5ku' }));

  // if in production, redirect http requests to https
  if (process.env.NODE_ENV === 'production') {
    app.use(function (req, res, next) {
      if (req.connection.encrypted) {
        return next();
      } else {
        res.redirect('https://' + req.headers.host + req.path);
      }
    });
  }

  app.use(app.router);

  // include our router before the static router
  require('./lib/routes')(app);
});

// set up static handlers, but make sure this is conditional to allow for compression in production
app.configure('production', function () {
  app.use(gzippo.staticGzip(__dirname + '/public'));
  app.set('isproduction', true);
});

app.configure('live', function () {
  app.use(express.static(__dirname + '/public'));

  app.set('version', Date.now());

});

app.configure('development', function () {
  app.use(express.static(__dirname + '/public'));

  app.set('version', Date.now());

  var fs = require('fs'),
      options = {
        key: fs.readFileSync('privatekey.pem'),
        cert: fs.readFileSync('certificate.pem')
      };
  require('https').createServer(options, app).listen(port+1, function () {
    var addr = this.address();
    process.stdout.write('Up and running on https://' + addr.address + ':' + addr.port + '\n');
  });
});

if (module.parent) {
  module.exports = server;
}

server.listen(port, function () {
  var addr = this.address();
  process.stdout.write('Up and running on http://' + addr.address + ':' + addr.port + '\n');
});

// TODO add non-webrtc support
webRTC.rtc.on('game_msg', function(data, socket) {
  console.log(data, socket);
});
