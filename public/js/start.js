function status() {
  get('status/' + pin, function (err, result) {
    if (err) {
      setTimeout(status, 5000);
    }
    console.log('we got in', result);
  });
}

status();