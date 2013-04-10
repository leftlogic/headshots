var webRTC = require('webrtc.io');

module.exports = {
  listen: function (server) {
    webRTC.listen(server);
  }
};

function log() {
  console.log([].slice.apply(arguments));
}

webRTC.rtc.on('orientation', function(event, socket) {
  var roomList = webRTC.rtc.rooms[event.room] || [],
      i = 0,
      socketId,
      soc;

  // TODO thinking this should always be length of 1
  console.log(roomList);

  // FIXME remove this loop?
  for (i = 0; i < roomList.length; i++) {
    socketId = roomList[i];

    if (socketId !== socket.id) {
      soc = webRTC.rtc.getSocket(socketId);

      if (soc) {
        soc.send(JSON.stringify({
          'eventName': 'orientation',
          'data': event.data
        }), /*if error*/ log);
      }
    }
  }
});
