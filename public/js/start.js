/*global: get:true, pin:true*/
function status() {
  get('/status/' + pin, function (err, result) {
    if (err) {
      console.log(this);
      setTimeout(status, 5000);
    }
    if (result) {
      window.location = '/play';
    }
  });
}

status();