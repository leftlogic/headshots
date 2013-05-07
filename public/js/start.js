/*globals: xhr:true, pin:true, Bind:true, get:true, $:true*/
(function () {

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
  window.pin = p;
  $('.pincode').forEach(function (el) {
    el.innerHTML = p;
  });
}

function joingame(event) {
  event.preventDefault();
  setPin($('#userpin').value);
  xhr.post('/join', { pin: pin }, function (err, result) {
    if (err) {
      console.error('failed to post join');
    } else if (result) {
      status();
    } else {
      alert('Could not join that game');
    }
  });
}

$('#joingame').on('click', joingame).on('touchstart', joingame);

window.initConnection();
status();

var hash = window.location.hash;

if (hash.indexOf('join') !== -1) {
  console.log('showing join');
  $('#join').classList.add('show');
} else if (hash.indexOf('start') !== -1) {
  console.log('showing start');
  $('#start').classList.add('show');
}

if (pin) {
  setPin(pin);
}

})();