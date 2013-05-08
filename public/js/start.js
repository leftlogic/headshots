/*globals pin:true, Bind:true, xhr:true, $:true, alert:true*/
(function () {
"use strict";

var timer = null;

function status() {
  clearTimeout(timer);
  xhr.get('/status/' + (pin ? pin : ''), function (err, result) {
    if (err) {
      console.log(this);
      timer = setTimeout(status, 5000);
    }
    if (result) {
      if (result.type === 'ready') {
        window.game = new Bind(result.data, {
          'me.score': '#myscore',
          'them.score': '#theirscore'
        });
        window.initGame();
      } else if (result.type === 'start') {
        console.log('starting game');
        setPin(result.data.pin);
        status();
      }
    }
  });
}

function setPin(p) {
  var triggerEvent = false;
  // make sure it's an int
  p *= 1;

  if (p !== window.pin) {
    triggerEvent = true;
  }

  window.pin = p;
  $('.pincode').forEach(function (el) {
    el.innerHTML = p;
  });

  if (triggerEvent) {
    $.trigger('pinchange', { pin: pin });
  }
}

function joingame(event) {
  event.preventDefault();
  setPin($('#userpin').value);
  xhr.post('/join', { pin: pin }, function (err, result) {
    if (err) {
      console.error('failed to post join');
    } else if (result) {
      $('#join').classList.remove('show');
      $('#start').classList.add('show');

      status();
    } else {
      alert('Could not join that game');
    }
  });
}

function pause(event) {
  event.preventDefault();
  window.running = false;
  if (event.type.indexOf('remote') !== 0) {
    $.trigger('pause');
  }
  control.classList.add('show');
}

function resume(event) {
  event.preventDefault();
  window.running = true;
  if (event.type.indexOf('remote') !== 0) {
    $.trigger('resume');
  }
  control.classList.remove('show');
}

function exit(event) {
  event.preventDefault();
  window.location = '/';
}

function tap(el, handler) {
  el.on('touchstart', handler, false);
  el.on('click', handler, false);
}

var control = $('#game-control');

tap($('#pause'), pause);
tap($('#resume'), resume);
tap($('#exit'), exit);
tap($('#joingame'), joingame);

$.on('remotePause', pause);
$.on('remoteResume', resume);

window.initConnection();

var hash = window.location.hash;

if (hash.indexOf('join') !== -1) {
  console.log('showing join');
  $('#join').classList.add('show');
} else if (!pin) {
  console.log('showing start');
  $('#start').classList.add('show');
  status();
}

if (pin) {
  setPin(pin);
}

})();