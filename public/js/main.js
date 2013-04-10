var videos = [];
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;

var room = '1234',
    video = null;

function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;
  
    var now = +new Date,
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

function openxhr(type, url, data, callback, custom) {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      if (xhr.status == 200 || xhr.status == 0) {
        callback(JSON.parse(xhr.responseText));
      } else {
        callback(xhr.status);
      }
    }
  };

  xhr.open(type, url);

  if (custom) custom(xhr);

  xhr['X-Requested-With'] = 'XMLHttpRequest';
  xhr.send(data);
}

function get(url, callback) {
  openxhr('GET', url, null, callback);
}

function post(url, data, callback) {
  openxhr('POST', url, 'data=' + encodeURIComponent(JSON.stringify(data)), callback, function (xhr) {
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  });
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
    for(var connection in rtc.dataChannels) {
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
    console.log('initializing data channel chat');
    socket = dataChannel;
  } else {
    console.log('initializing websocket chat');
    socket = websocket;
  }

  window.addEventListener('deviceorientation', function (event) {
    var g = map(event.gamma, -90, 90, -20, 20) | 0;
    // var g = event.gamma | 0;
    socket.send(JSON.stringify({
      "eventName": "orientation_msg",
      "data": {
        "gamma": g,
        "room": room
      }
    }));
  }, false);

  rtc.on(socket.event, function() {
    var data = socket.recv.apply(this, arguments);
    if (video) {
      document.body.style.webkitTransform = 'rotate(' + data.gamma + 'deg)';
    }
  });
}

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function init() {
  if (PeerConnection) {
    rtc.createStream({
      "video": {"mandatory": {}, "optional": []},
      "audio": true
    }, function(stream) {
      // document.getElementById('you').src = URL.createObjectURL(stream);
      // document.getElementById('you').play();
      // videos.push(document.getElementById('you'));
      // //rtc.attachStream(stream, 'you');
      // subdivideVideos();
    });
  } else {
    alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
  }

  // get('/room', function (room) {
    rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);

    rtc.on('add remote stream', function(stream, socketId) {
      console.log("ADDING REMOTE STREAM...");
      // var clone = cloneVideo('you', socketId);
      video = document.createElement('video');
      video.src = URL.createObjectURL(stream);
      video.autoplay = true;
      video.id = 'remote' + socketId;
      document.getElementById('videos').appendChild(video);
      rtc.attachStream(stream, video.id);
    });
    rtc.on('disconnect stream', function(data) {
      console.log('remove ' + data);
      removeVideo(data);
    });

    initSocket();
  // });
}