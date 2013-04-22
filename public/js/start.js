function status() {
  get('status/' + pin, function (err, result) {
    if (err) {
      setTimeout(status, 5000);
    }
    if (result) {
      window.location = '/play';
    }
  });
}

status();