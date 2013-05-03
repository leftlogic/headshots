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

  // load hbs helpers
  require ('./views/helpers.js');

  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());

  app.use(express.cookieParser('spa6kugo3chi4rti8wajy1no5ku'));
  app.use(express.session({ store: store, secret: 'spa6kugo3chi4rti8wajy1no5ku' }));

  app.use(app.router);

  // include our router before the static router
  require('./lib/routes')(app);
});

app.configure('production', function () {
  app.use(gzippo.staticGzip(__dirname + '/public'));
  app.set('isproduction', true);
});

app.configure('development', function () {
  app.use(express.static(__dirname + '/public'));
});

if (module.parent) {
  module.exports = server;
} else {
  server.listen(port, function () {
    process.stdout.write('Up and running on http://localhost:' + port + '\n');
  });
}


// wss.on('connection', function(ws) {
//   console.log('connection');
//   parseCookie(ws.upgradeReq, null, function(err) {
//     console.log('>>>>>>>> in!', ws.upgradeReq.cookies);
//     var sessionID = ws.upgradeReq.cookies['connect.sid'];
//     store.get(sessionID, function(err, session) {
//         // session
//       console.log([].slice.call(arguments));
//     });
//   });

//     ws.on('message', function(message) {
//         console.log('received: %s', message);
//     });
//     // ws.send('something');
// });

webRTC.rtc.on('game_msg', function(data, socket) {
  console.log(data, socket);
});

// for reference
// webRTC.rtc.on('chat_msg', function(data, socket) {
//   console.log('chat_msg inbound');
//   var roomList = webRTC.rtc.rooms[data.room] || [];

//   for (var i = 0; i < roomList.length; i++) {
//     var socketId = roomList[i];

//     if (socketId !== socket.id) {
//       var soc = webRTC.rtc.getSocket(socketId);

//       if (soc) {
//         soc.send(JSON.stringify({
//           "eventName": "receive_chat_msg",
//           "data": {
//             "messages": data.messages,
//             "color": data.color
//           }
//         }), function(error) {
//           if (error) {
//             console.log(error);
//           }
//         });
//       }
//     }
//   }
// });