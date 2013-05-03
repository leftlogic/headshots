function CanvasUtil(clientCTX, options) {
  function grid(x, y, c) {
    var i = 0;
    var gcanvas = document.createElement('canvas'),
        gctx = gcanvas.getContext('2d');

    gcanvas.width = x * 2;
    gcanvas.height = y * 2;

    // c = '#000';
    // gctx.fillRect(0, 0, x, y);
    gctx.strokeStyle = c || 'rgba(226,226,226,0.5)';
    gctx.lineWidth = 1;
    for (i = 0; i < ctx.canvas.width; i += x) {
      gctx.moveTo(i-0.5, 0);
      gctx.lineTo(i-0.5, gcanvas.height);
    }

    for (i = 0; i < ctx.canvas.height; i += y) {
      gctx.moveTo(0, i-0.5);
      gctx.lineTo(gcanvas.width, i-0.5);
    }
    gctx.stroke();
    // ctx.restore();
    var gdata = gcanvas.toDataURL('image/png');
    canvas.style.background = 'url(' + gdata + ') repeat';
  }

  function cursor() {
    ctx.font = 'bold 10px sans-serif';

    ctx.strokeStyle = '#ccc';

    canvas.addEventListener('mousemove', function (event) {
      ctx.clearRect(0, 0, this.width, this.height);
      
      if (ruler) {
        ctx.beginPath();
        ctx.moveTo(-0.5, event.pageY-0.5);
        ctx.lineTo(ctx.canvas.width-0.5, event.pageY-0.5);
        ctx.moveTo(event.pageX-0.5, -0.5);
        ctx.lineTo(event.pageX-0.5, ctx.canvas.height-0.5);
        ctx.stroke();
        ctx.closePath();
      }
      
      var str = '(' + event.pageX + ',' + event.pageY + ')';
      ctx.strokeText(str, event.pageX + 20, event.pageY + 20);
      ctx.fillText(str, event.pageX + 20, event.pageY + 20);
    }, false);

    canvas.addEventListener('mouseout', function () {
      ctx.clearRect(0, 0, this.width, this.height);
    }, false);
  }

  var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';

  if (options.grid) {
    grid.apply(this, options.grid);
  }
  
  if (options.cursor) {
    cursor();
  }
  
  var ruler = !!options.ruler;
  
  // this is what will be used by draw, dot and line
  this.ctx = clientCTX;
}

CanvasUtil.prototype = {
  draw: function (fn) {
    var util = this,
        args = [].slice.apply(arguments);
    args.shift();
    // running the code in a setTimeout allows us to draw whilst another
    // path in effect, and not break it - i.e. a console for canvas
    if (this.drawing) {
      setTimeout(function () {
        util.ctx.save();
        fn.apply(this, args);
        util.ctx.restore();
      }, 10);
    }
  },
  dot: function (x, y, r, c, stroke) {
    var util = this,
        args = [].slice.apply(arguments);

    if (args.length == 2) {
      args.push(5);
    }
      
    // if we've got stroke, but missing colour:
    if (args.length === 4 && typeof args[args.length - 1] == 'boolean') {
      args.push(args[args.length - 1]);
      args[args.length - 2] = undefined;
    }
    
    // put the function at the start
    args.unshift(function (x, y, r, c, stroke) {
      util.ctx.beginPath();
      util.ctx.strokeStyle = util.ctx.fillStyle = c || '#f00';
      util.ctx.arc(x, y, r, 0, Math.PI * 2, true);
      if (stroke) {
        util.ctx.stroke();
      }
      util.ctx.closePath();
      
      if (!stroke) {
        util.ctx.fill();
      }
    });
    
    this.draw.apply(this, args);
  },
  circle: function () {
    var args = [].slice.apply(arguments);
    
    if (args.length == 2) {
      args.push(5);
    }
    
    args.push(true);
    this.dot.apply(this, args);
  },
  line: function (x1, y1, x2, y2, c) {
    var util = this;
    this.draw(function (x1, y1, x2, y2, c) {
      util.ctx.beginPath();
      util.ctx.strokeStyle = c || '#f00';
      util.ctx.moveTo(x1, y1);
      util.ctx.lineTo(x2, y2);
      util.ctx.stroke();
      util.ctx.closePath();
    }, x1, y1, x2, y2, c);
  },
  drawing: true
};
