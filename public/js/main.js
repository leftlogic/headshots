/*global rtc:true, alert:true, pin:true, get:true, game:true, $:true, utils:true*/
"use strict";

var connection = (function () {

var videos = [];
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;

var video = null;

var websocket = {
  send: function(message) {
    rtc._socket.send(message);
  },
  recv: function(message) {
    return message;
  },
  event: 'receive_chat_msg'
};

var dataChannel = {
  send: function(message) {
    for (var connection in rtc.dataChannels) {
      var channel = rtc.dataChannels[connection];
      if (channel.readyState === 'open') {
        channel.send(message);
      } else {
        console.warn('channel ' + connection + ' is ' + channel.readyState);
      }
    }
  },
  recv: function(channel, message) {
    return JSON.parse(message).data;
  },
  event: 'data stream data'
};

function setupSocket() {
  $.trigger('connecting');
  var socket;

  if(rtc.dataChannelSupport) {
    console.log('initializing data channel');
    socket = dataChannel;
  } else {
    console.log('initializing websocket');
    socket = websocket;
  }

  var lastOrientation = null;
  window.addEventListener('deviceorientation', utils.throttle(function (event) {
    var i = 1;
    if (event.gamma < -75 || event.gamma > 200) {
      i = 2;
    } else if (event.gamma > 75) {
      i = 0;
    }

    if (lastOrientation !== i) {
      lastOrientation = i;
      // var g = event.gamma | 0;
      socket.send(JSON.stringify({
        eventName: 'orientation',
        data: {
          position: i,
          raw: event.gamma,
          pin: pin
        }
      }));

    }
  }, 100), false);

  var eventIfTurn = function (event) {
    if (game.turn === true) {
      socket.send(JSON.stringify({
        eventName: event.type,
        data: event.data
      }));
    }
  };

  var eventSender = function (event) {
    socket.send(JSON.stringify({ eventName: event.type }));
  };

  $.on('pause', eventSender);
  $.on('resume', eventSender);
  $.on('endTurn', eventSender);
  $.on('playagain', eventSender);
  $.on('throw', eventIfTurn);
  $.on('hit', eventIfTurn);

  // when receiving events, convert them to remote{EventName} to distinguish in our code
  var re = /(^.)/;
  rtc.on(socket.event, function(rtc, msg) {
    msg = JSON.parse(msg);
    var type = 'remote' + msg.eventName.replace(re, function (all, m) { return m.toUpperCase() + all.substr(1); });
    $.trigger(type, msg.data);
  });
}

function connectVideo() {
  console.log('connection established');
  if (PeerConnection) {
    rtc.createStream({
      'video': {'mandatory': {
        // **attempt** to get the video nice and small (noticing this totally doesn't work)
        minAspectRatio: 1.333,
        maxAspectRatio: 1.334,
        maxWidth: 320,
        maxHeight: 180
      }, 'optional': [
        {maxFrameRate: 30},
        {maxWidth: 320},
        {maxHeight: 180}
      ]},
      'audio': false
    }, function(stream) {
      console.log('local video streaming');
      $.trigger('readylocal');
      if (debug) rtc.attachStream(stream, 'local');
    });
  } else {
    // TODO grab pic from the camera
    alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
  }
}

function initConnection() {
  var disconnectTimer = null;
  rtc.on('add remote stream', function(stream, socketId) {
    clearTimeout(disconnectTimer);
    console.log('adding remote stream');
    rtc.attachStream(stream, 'remote');
    rtc.dataChannels[socketId].onopen = function () {
      $.trigger('readyremote');
    };
  });
  rtc.on('disconnect stream', function(socketId) {
    console.log('remove stream ' + socketId);
    var video = document.getElementById('remote' + socketId);
    if (video) { video.parentNode.removeChild(video); }
    disconnectTimer = setTimeout(function () {
      $.trigger('disconnect');
    }, 5 * 1000);
  });

  setupSocket();
  setTimeout(function () {
    $('#waiting .delay.one').hidden = false;
  }, 10 * 1000);

  setTimeout(function () {
    $('#waiting .delay.two').hidden = false;
  }, 30 * 1000);
}

rtc.on('connect', connectVideo);

$.on('pinchange', function () {
  var proto = window.location.protocol,
      href = window.location.href;

  try {
    rtc._socket.close();
  } catch (e) {}

  rtc.connect((proto.indexOf('https') !== -1 ? 'wss:' : 'ws:') + href.substring(proto.length).split('#')[0], pin);
});

// should/could be done with bitwise state checking, 
// but it's late :(
var state = {
  readyremote: false,
  readylocal: false
};

function dataChannelOpen() {
  if (PeerConnection) {
    for (var id in rtc.dataChannels) {
      if (rtc.dataChannels[id].readyState === 'open') {
        return true; // otherwise fall through to final return
      }
    }
  } else {
    return rtc._socket.readyState === 1;
  }

  return false;
}

function isReady() {
  if (dataChannelOpen()) {
    $.trigger('ready');
  } else {
    // channels should be open - show reload issue button
    $('#waiting .delay.two').hidden = false;
    setTimeout(isReady, 500);
  }
}

$.on('readyremote', function () {
  state.readyremote = true;
  if (state.readylocal) {
    isReady();
  }
}).on('readylocal', function () {
  state.readylocal = true;
  if (state.readyremote) {
    isReady();
  }
});

return {
  init: initConnection
};

})();