var utils = (function () {
"use strict";
function throttle(fn, threshhold, scope) {
  var last,
      deferTimer;

  if (threshhold === undefined) {
    threshhold = 250;
  }

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

return {
  map: map,
  throttle: throttle
};

})();
