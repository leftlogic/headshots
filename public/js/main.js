/*global rtc:true, alert:true, pin:true, get:true, game:true, $:true*/
"use strict";

(function () {

var videos = [];
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;

var video = null;

function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date(),
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function removeVideo(socketId) {
  var video = document.getElementById('remote' + socketId);
  if (video) {
    video.parentNode.removeChild(video);
  }
}

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
      channel.send(message);
    }
  },
  recv: function(channel, message) {
    return JSON.parse(message).data;
  },
  event: 'data stream data'
};

function initSocket() {
  var socket;

  if(rtc.dataChannelSupport) {
    console.log('initializing data channel');
    socket = dataChannel;
  } else {
    console.log('initializing websocket :(');
    socket = websocket;
  }

  window.addEventListener('deviceorientation', throttle(function (event) {
    var g = map(event.gamma, -50, 50, -1, 1) | 0;
    // var g = event.gamma | 0;
    socket.send(JSON.stringify({
      eventName: 'orientation_msg',
      data: {
        // type: 'orientation',
        gamma: g,
        raw: event.gamma,
        pin: pin
      }
    }));
  }, 100), false);

  $.on('pause', function () {
    socket.send(JSON.stringify({eventName: 'pause'}));
  }).on('resume', function () {
    socket.send(JSON.stringify({eventName: 'resume'}));
  }).on('throw', function () {
    if (game.turn === true) {
      socket.send(JSON.stringify({
        eventName: 'throw',
        data: event.data
      }));
    }
  }).on('hit', function () {

  });


  var player = $('.player'),
      positionStates = {
        '-1': 'left',
        '0': 'center',
        '1': 'right'
      };

  rtc.on(socket.event, function(rtc, msg) {
    msg = JSON.parse(msg);
    var type = 'remote' + msg.eventName.replace(/(^.)/, function (all, m) { return m.toUpperCase() + all.substr(1); });
    $.trigger(type, msg.data);
  });
}

window.initConnection = function () {
  rtc.on('connect', init);
  rtc.connect((window.location.protocol.indexOf('https') !== -1 ? 'wss:' : 'ws:') + window.location.href.substring(window.location.protocol.length).split('#')[0], pin);
};

function init() {
  console.log('connection established');
  if (PeerConnection) {
    rtc.createStream({
      'video': {'mandatory': {
        // get the video nice and small
        minAspectRatio: 1.333,
        maxAspectRatio: 1.334,
        maxWidth: 320,
        maxHeight: 180
      }, 'optional': [
        {maxFrameRate: 30},
        {maxWidth: 320},
        {maxHeight: 180}
      ]},
      // 'video': false,
      'audio': false
    }, function(stream) {
      // console.log('attached local stream');
      // rtc.attachStream(stream, 'local');
    });
  } else {
    // TODO grab pic from the camera
    alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
  }

  rtc.on('add remote stream', function(stream, socketId) {
    console.log("ADDING REMOTE STREAM...");
    rtc.attachStream(stream, 'remote');
  });
  rtc.on('disconnect stream', function(socketId) {
    console.log('remove ' + socketId);

    // 1. remove old canvas
    // 2. cancel timer (based on id on video)
    // 3. remove video element

    var video = document.getElementById('remote' + socketId);
    if (video) video.parentNode.removeChild(video);
  });

  initSocket();
}

function bind(el, handler) {
  el.addEventListener('touchstart', handler, false);
  el.addEventListener('click', handler, false);
}

function pause(event) {
  event.preventDefault();
  window.running = false;
  if (event.type.indexOf('remote') !== 0) $.trigger('pause');
  control.classList.add('show');
}

function resume(event) {
  event.preventDefault();
  window.running = true;
  if (event.type.indexOf('remote') !== 0) $.trigger('resume');
  control.classList.remove('show');
}

function exit(event) {
  event.preventDefault();
  window.location = '/';
}

var control = $('#game-control');

bind($('#pause'), pause);
bind($('#resume'), resume);
bind($('#exit'), exit);

$.on('remotePause', pause);
$.on('remoteResume', resume);

var scene = $('.scene');

// bind($('.face'), function (event) {
//   event.preventDefault();
//   // next person's turn
//   if (game.turn) {
//     get('/hit', function (success) {
//       if (success) {
//         game.me.score++;
//       }

//       game.turn = false;
//       game.currentPlayer = game.them.letter;
//     });
//   }
// });


})();