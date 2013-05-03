/*global rtc:true, alert:true, pin:true, get:true, game:true*/
"use strict";

// fitText($('#welcome p'), 1.2);
// fitText($('h1'), 1.2);

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

function removeVideo(socketId) {
  var video = document.getElementById('remote' + socketId);
  if (video) {
    video.parentNode.removeChild(video);
  }
}

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
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

  var player = $('.player'),
      positionStates = {
        '-1': 'left',
        '0': 'center',
        '1': 'right'
      };

  rtc.on(socket.event, function() {
    var data = socket.recv.apply(this, arguments);
    // if (data.type === 'orientation') {
      // player.className = 'player ' + positionStates[data.gamma];
      $.trigger('orientation', data);
    // }

    // if (video) {
    //   document.body.style.webkitTransform = 'rotate(' + data.gamma + 'deg)';
    // }
  });
}

function init() {
  rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], pin);

  if (PeerConnection) {
    rtc.createStream({
      'video': {'mandatory': {}, 'optional': []},
      // 'video': false,
      'audio': false
    }, function(stream) {
      // var video = document.createElement('video');
      // video.id = 'you';
      // document.body.appendChild(video);
      // document.getElementById('you').src = URL.createObjectURL(stream);
      // document.getElementById('you').play();
      // videos.push(document.getElementById('you'));
      rtc.attachStream(stream, 'local');
      // subdivideVideos();
    });
  } else {
    // TODO grab pic from the camera
    alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
  }

  rtc.on('add remote stream', function(stream, socketId) {
    console.log("ADDING REMOTE STREAM...");
    // var clone = cloneVideo('you', socketId);
    // window.video = video = document.createElement('video');
    // document.body.appendChild(video);
    // // rtc.attachStream(stream, video);
    // video.src = window.URL.createObjectURL(stream);
    // video.autoplay = true;
    // video.id = 'remote' + socketId;
    // video.play();

    // console.log(video.readyState);

    // if (video.readyState === 4) {
    //   renderVideo(video);
    // } else {
    //   video.addEventListener('canplay', function () {
    //     console.log('ready');
    //     renderVideo(video);
    //   });
    // }

    // rtc.attachStream(stream, video);
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
  document.body.className = 'pause';
}

function resume(event) {
  event.preventDefault();
  document.body.className = '';
}

function exit(event) {
  event.preventDefault();
  document.body.className = '';
  // send xhr event
  window.location = '/';
}

bind($('#pause'), pause);
bind($('#resume'), resume);
bind($('#exit'), exit);

var scene = $('.scene');

// var 

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


// window.addEventListener('load', init, false);

})();