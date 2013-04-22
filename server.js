"use strict";
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    webRTC = require('webrtc.io').listen(server),
    port = process.env.PORT || 8080;

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine' ,'hbs');

  // load hbs helpers
  require ('./views/helpers.js');

  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.cookieParser('spa6kugo3chi4rti8wajy1no5ku'));
  app.use(express.session());

  app.use(app.router);

  // include our router before the static router
  require('./lib/routes')(app);
  app.use(express.static(__dirname + '/public'));
});

app.configure('production', function () {
  app.set('isproduction', true);
});

server.listen(port, function () {
  process.stdout.write('Up and running on http://localhost:' + port + '\n');
});

// for reference

webRTC.rtc.on('chat_msg', function(data, socket) {
  console.log('chat_msg inbound');
  var roomList = webRTC.rtc.rooms[data.room] || [];

  for (var i = 0; i < roomList.length; i++) {
    var socketId = roomList[i];

    if (socketId !== socket.id) {
      var soc = webRTC.rtc.getSocket(socketId);

      if (soc) {
        soc.send(JSON.stringify({
          "eventName": "receive_chat_msg",
          "data": {
            "messages": data.messages,
            "color": data.color
          }
        }), function(error) {
          if (error) {
            console.log(error);
          }
        });
      }
    }
  }
});