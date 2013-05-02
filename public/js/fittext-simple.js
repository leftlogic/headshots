var addEvent = (function () {
  if (document.addEventListener) {
    return function (el, type, fn) {
      if (el && el.nodeName || el === window) {
        el.addEventListener(type, fn, false);
      } else if (el && el.length) {
        for (var i = 0; i < el.length; i++) {
          addEvent(el[i], type, fn);
        }
      }
    };
  } else {
    return function (el, type, fn) {
      if (el && el.nodeName || el === window) {
        el.attachEvent('on' + type, function () { return fn.call(el, window.event); });
      } else if (el && el.length) {
        for (var i = 0; i < el.length; i++) {
          addEvent(el[i], type, fn);
        }
      }
    };
  }
})();

function fitText(nodes, kompressor, options) {
  // Setup options
  var compressor = kompressor || 1,
      resizers = [];

  if (!nodes[0]) {
    nodes = [nodes];
  }

  if (options === undefined) options = {}; 
  if (options.minFontSize === undefined) options.minFontSize = Number.NEGATIVE_INFINITY;
  if (options.maxFontSize === undefined) options.maxFontSize = Number.POSITIVE_INFINITY;

  var i = 0, length = nodes.length;

  for (; i < length; i++) {
    (function (el) {
      var comp = el.currentStyle ? el.currentStyle : getComputedStyle(el, null);

      // Resizer() resizes items based on the object width divided by the compressor * 10
      var resizer = function () {
        var width = parseFloat(comp.width);

        el.style.fontSize = Math.max(Math.min(width / (compressor*10), parseFloat(options.maxFontSize)), parseFloat(options.minFontSize)) + 'px';
      };

      // Call once to set.
      resizer();
      resizers.push(resizer);
    })(nodes[i]);
  }

  // Call on resize. Opera debounces their resize by default. 
  addEvent(window, 'resize', function () {
    var i = 0, length = resizers.length;
    for (; i < length; i++) {
      resizers[i]();
    }
  }, false);
}