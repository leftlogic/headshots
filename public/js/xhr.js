var xhr = (function () {

var noop = function () {};

function request(type, url, opts, callback) {
  var xhr = new XMLHttpRequest(),
      pd;

  if (typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  if (!callback) {
    callback = noop;
  }

  xhr.open(type, url);

  if (type === 'POST' && opts) {
    pd = JSON.stringify(opts);

    xhr.setRequestHeader('Content-Type', 'application/json');
  }

  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

  xhr.onload = function () {
    var result = null,
        err = null;

    try {
      result = JSON.parse(xhr.response);
    } catch (e) {
      err = e;
    }
    callback.call(xhr, err, result);
  };

  xhr.onerror = function () {
    callback.call(xhr, true);
  };

  xhr.send(opts ? pd : null);

  return xhr;
}

var get = request.bind(this, 'GET');
var post = request.bind(this, 'POST');

return {
  get: get,
  post: post
};

})();