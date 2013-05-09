/*globals THREE:true, Ball:true, Track:true, stats:true, $:true, game:true, utils:true, debug:true, xhr:true*/
var play = (function () {
"use strict";

var hit = function () {};

var running = false,
    activeTurn = true;

var interactive = {
  camera: null,
  scene: null,
  renderer: null,
  projector: new THREE.Projector()
};

var background = {
  camera: null,
  scene: null,
  renderer: null
};

var actor = {
  ball: null,
  floor: null,
  player: null,
  activePosition: 'center'
};

var playerDimensions = {
  width: 0,
  height: 0,
  center: {
    x: 125,
    y: 20,
    width: 130,
    height: 430,
    hit: {
      x: 145,
      y: 40,
      width: 90,
      height: 90
    },
    hit2: {
      x: 178,
      y: 272,
      width: 30,
      height: 30
    }
  },
  left: {
    x: 60,
    y: 65,
    width: 165,
    height: 400,
    hit: {
      x: 64,
      y: 73,
      width: 120,
      height: 120
    }
  },
  right: {
    x: 200,
    y: 70,
    width: 180,
    height: 390,
    hit: {
      x: 226,
      y: 78,
      width: 120,
      height: 120
    }
  },
  hit1: {
    x: 235,
    y: 175,
    width: 90,
    height: 90
  },
  hit2: {
    x: 310,
    y: 210,
    width: 90,
    height: 90
  },
  tilt: {
    center: {
      x: 145,
      y: 40,
      width: 90,
      height: 90
    },
    left: {
      x: 62,
      y: 110,
      width: 90,
      height: 90
    },
    right: {
      x: 260,
      y: 76,
      width: 90,
      height: 90
    }
  }
};

playerDimensions.throw1 = playerDimensions.center;

var TO_RADIANS = Math.PI/180;

var videoWrapper = $('#videowrapper');

var width = window.innerWidth,
    height = window.innerHeight;

function getNarrow(a, b) {
  return a < b ? a : b;
}

function getWide(a, b) {
  return a > b ? a : b;
}

function redrawAll() {
  background.renderer.render(background.scene, background.camera);
  interactive.renderer.render(interactive.scene, interactive.camera);
  renderVideo();
}

function resetBall(posX, x, y, speed) {
  var dirty = false;

  if (!posX) {posX = 0;}
  if (!x) {x = 0;}
  if (!y) {y = 0;}
  if (!speed) {
    speed = 0;
    dirty = true;
  }

  var ball = actor.ball;

  if (game.turn || speed) {
    interactive.scene.add(actor.ball);
  }

  var posZ = game.turn ? 895 : -220;

  if (!game.turn) {
    speed *= -1;
  }

  ball.position.z = posZ;
  ball.position.y = speed ? actor.floor.position.y + 50 : 0;

  ball.position.x = posX;


  ball.velocity.set(0, 0, -speed * 0.35);

  ball.velocity.rotateY(x);
  ball.velocity.rotateZ(0);
  ball.velocity.rotateX(-y * 20 * TO_RADIANS);

  videoWrapper.style.zIndex = 1;
}

function getContainer(c) {
  var container = document.createElement('div');
  container.className = 'three';
  if (c) {
    container.className += ' ' + c;
  }

  $('.game').appendChild(container);

  return container;
}

function getFloor(scene) {
  var material = new THREE.MeshBasicMaterial({ color: 0x16947B, wireframe:true, wireframeLinewidth: 2 });

  var geom = new THREE.PlaneGeometry(2000, 1500, 20, 10);
  var floor = new THREE.Mesh(geom, material);

  floor.rotation.x = -89 * TO_RADIANS;
  floor.position.y = -250;
  floor.position.z = 100;

  if (scene) {
    scene.add(floor);
  }

  return floor;
}

function getCamera() {
  var camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.z = 1000;
  camera.position.y = -170;
  camera.rotation.x = -8 * TO_RADIANS;
  camera.rotation.x = -2.3 * TO_RADIANS;

  return camera;
}

function px(x) {
  return Math.round(x) + "px";
}


function getRect2DForRect3D(positionVector, width3d, height3d, camera, canvas) {

  var projector = new THREE.Projector();

  var topleft3d = positionVector.clone();
  var dimensions3d = new THREE.Vector3(width3d, height3d, topleft3d.z);

  var topleft2d = projector.projectVector( topleft3d.clone(), camera );
  var dimensions2d = projector.projectVector( dimensions3d.clone(), camera );

  // this code used to use canvas.width & height, but for reasons that are utterly beyond 
  // me, this breaks on mobile, so I changed it to window.innerWidth, and it works. Genius.
  var w = window.innerWidth,
      h = window.innerHeight;

  dimensions2d.x *= (w/2);
  dimensions2d.y *= (h/2);

  topleft2d.x = (topleft2d.x +1) *(w/2);
  topleft2d.y = (topleft2d.y * (h/-2))+(h/2);

  return {x : topleft2d.x, y:topleft2d.y, width : dimensions2d.x, height : dimensions2d.y};
}

function generateSprite() {
  var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

  var offset = 25;

  var positions = {},
      defaultPosition = game.turn ? 'center' : 'throw1';

  ['center','left','right', 'hit1', 'hit2', 'throw1'].forEach(function (position) {
    var i = positions[position] = new Image();
    // render the center position
    if (position === defaultPosition) {
      i.onload = function () {
        ctx.drawImage(positions[position], 0, offset);
        paintScore();
      };
    }

    i.src = '/images/player-' + game.me.letter + '-' + position + '.png';
  });

  playerDimensions.width = canvas.width = 400;
  playerDimensions.height = canvas.height = 450 + offset;
  // for the score
  ctx.font = '100 35px Roboto';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';


  var clear = function () {
    ctx.clearRect(0, 0, 400, 450 + offset);
  };

  function paintScore() {
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(canvas.width/2 - 30, 0, 40, 40);
    ctx.fillStyle = '#ECF0F1';
    ctx.fillText(game.them.score + '', canvas.width/2 - 10, 38);
  }

  function captureMug() {
    // do a screen grab of their face, then crop to a new canvas for re-painting
    var ctx = document.createElement('canvas').getContext('2d'),
        narrow = getNarrow(video.videoWidth, video.videoHeight),
        offsetX = (video.videoWidth - narrow) / 2,
        offsetY = (video.videoHeight - narrow) / 2;
    ctx.canvas.height = ctx.canvas.width = narrow;
    if (video) {
      ctx.drawImage(video, offsetX, offsetY, narrow, narrow, 0, 0, 90, 90);
    }
    return ctx.canvas;
  }

  var timer = null;

  hit = function () {
    if (game.turn) {
      xhr.get('/hit');
      game.me.score++;
      $.trigger('hit');

      clearTimeout(timer);
      clear();
      video.className = '';

      var mug = captureMug();

      ctx.drawImage(positions.hit1, 0, offset);
      ctx.drawImage(mug, playerDimensions.hit1.x - 90, playerDimensions.hit1.y - 90 + offset);
      paintScore();
      setTimeout(function () {
        clear();
        ctx.drawImage(positions.hit2, 0, offset);
        ctx.drawImage(mug, playerDimensions.hit2.x - 90, playerDimensions.hit2.y - 90 + offset);
        paintScore();
      }, 400);
    }
  };

  var renderVideo = window.renderVideo = function () {
    if (video.readyState !== 4) {
      return;
    }
    done = true;
    i = events.length;
    while (i--) {
      video.removeEventListener(events[i], echo, false);
    }

    video.className = 'streaming';

    var dims = playerDimensions.tilt[actor.activePosition] || playerDimensions.tilt.center;
    var player = actor.player;

    var y = player.position.y + ((playerDimensions.height * player.scale.y) / 2),
        x = player.position.x - ((playerDimensions.width * player.scale.x) / 2);

    var face = new THREE.Vector3(
              x + (dims.x * player.scale.x),
              y - ((dims.y + offset) * player.scale.y) - dims.height * player.scale.y,
              player.position.z);

    var width3d = dims.width * player.scale.x,
        height3d = dims.height * player.scale.y;

    var coords = getRect2DForRect3D(face, width3d, height3d, interactive.camera, interactive.renderer.domElement);

    // now position
    var parent = video.parentNode;


    // serious no idea why I can't reuse .y & .height, it makes my brain hurt
    // but it turns out if you just mix around the values, then it just
    // *suddenly* works. ::sign::
    
    coords.width++;

    parent.style.left = px(coords.x);
    parent.style.top = px(coords.y - coords.width);// /* don't ask*/ (window.innerHeight / 1000 + 1.5 | 0));
    parent.style.width = px(coords.width);
    parent.style.height = px(coords.width);

    var wide = getWide(video.videoWidth, video.videoHeight);
    var narrow = getNarrow(video.videoWidth, video.videoHeight);
    var factor = coords.width / narrow;

    video.width = wide * factor;
    video.height = wide * factor;

    var videooffset = (wide - narrow) / 2 * factor;

    video.style.left = px(-videooffset);
    video.style.top = px(-videooffset);
  };

  var videoId = debug ? '#local' : '#remote';
  var video = $(videoId);

  var events = 'loadstart progress suspend abort error emptied stalled play pause loadedmetadata loadeddata waiting playing canplay canplaythrough seeking seeked timeupdate ended ratechange durationchange volumechange'.split(' '),
    i = events.length;

  while (i--) {
    video.addEventListener(events[i], echo, false);
  }

  var done = false;
  function echo(event) {
    if (video.videoWidth && !done) {
      console.log('fire on ' + event.type);
      renderVideo();
    }
  }


  var ctr = 0;
  var types = 'left center right'.split(' ');

  $.on('remoteOrientation', function (event) {
    if (game.turn === true) {
      actor.activePosition = types[event.data.position];
      $.trigger('repaintPlayer');
    }
  });

  $.on('repaintPlayer', function () {
    clear();
    ctx.drawImage(positions[actor.activePosition], 0, offset);
    paintScore();
    videoWrapper.dataset.tilt = actor.activePosition;
    redrawAll();
  });

  return canvas;
}

function getPlayer(scene) {
  var material = new THREE.ParticleBasicMaterial({
    map: new THREE.Texture(generateSprite())
  });

  var height = 450,
      width = 400,
      scale = 0.675;

  var player = interactive.player = new THREE.Particle(material);
  player.position.y = ((height / 2) * scale) + actor.floor.position.y;
  player.position.z = -220;
  player.position.x = 7;
  player.scale.x = player.scale.y = scale;

  scene.add(player);

  return player;
}

function buildStaticObjects() {
  var container = getContainer('backdrop');
  var camera = background.camera = getCamera();

  var scene = background.scene = new THREE.Scene();
  scene.add(camera);

  var floor = actor.floor = getFloor(scene);

  // note: the floor must be created before getPlayer, as it's referred to
  // background.player = getPlayer(scene);

  var renderer = background.renderer = new THREE.CanvasRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);
  renderer.render(scene, camera);
  renderer.render(scene, camera);
}

function createInteractiveScene() {
  var container = getContainer();
  var scene = interactive.scene = new THREE.Scene();

  var camera = interactive.camera = getCamera();
  scene.add(camera);

  var renderer = interactive.renderer = new THREE.CanvasRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  return scene;
}

function makePlane() {
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe:true, wireframeLinewidth: 2 });

  var geom = new THREE.PlaneGeometry(1, 1, 10, 10);
  var plane = new THREE.Mesh(geom, material);

  return plane;
}

function setupDebug() {
  var p = makePlane();
  var b = makePlane();
  var h = makePlane();

  var showDebug = false,
      firsttime = true;
  var update = function (player, ball, hit) {
    if (showDebug) {
      if (firsttime) {
        interactive.scene.add(p);
        interactive.scene.add(b);
        interactive.scene.add(h);
        firsttime = false;
      }
      p.position.x = player.x + player.width / 2;
      p.position.y = player.y + player.height / 2;
      p.position.z = actor.player.position.z;
      p.scale.x = player.width;
      p.scale.y = player.height;

      b.position.x = ball.x + ball.width / 2;
      b.position.y = ball.y + ball.height / 2;
      b.position.z = actor.ball.position.z;
      b.scale.x = ball.width;
      b.scale.y = ball.height;

      h.position.x = hit.x + hit.width / 2;
      h.position.y = hit.y + hit.height / 2;
      h.position.z = actor.player.position.z;
      h.scale.x = hit.width;
      h.scale.y = hit.height;
    }
  };

  interactive.debug = {
    player: p,
    ball: b,
    hit: h,
    update: update
  };

}

function isObjectInTarget(rect1, rect2) {
  if ( ((rect1.x<rect2.x + rect2.width) && (rect1.x+rect1.width>rect2.x)) &&
       ((rect1.y<rect2.y + rect2.height) && (rect1.y+rect1.height > rect2.y)) ) {
    return true;
  } else {
    return false;
  }
}

function playerRectIn3d(dims) {
  var player = actor.player,
      py = player.position.y + ((playerDimensions.height * player.scale.y) / 2),
      px = player.position.x - ((playerDimensions.width * player.scale.x) / 2);

  return {
    width: dims.width * player.scale.x,
    height: dims.height * player.scale.y,
    x: px + (dims.x * player.scale.x),
    y: py - (dims.y * player.scale.y) - dims.height * player.scale.y
  };
}

function loop() {
  requestAnimationFrame(loop);

  if (!running) {
    return;
  }

  var ball = actor.ball,
      player = actor.player,
      ballradius = ball.size,
      position = actor.activePosition.indexOf('throw') === 0 ? 'center' : actor.activePosition;

  ball.updatePhysics();

  // bounce off the floor
  if (ball.position.y - ballradius < actor.floor.position.y) {
    ball.position.y = actor.floor.position.y+ballradius;
    ball.velocity.y *= -0.7;
  }

  var p = playerRectIn3d(playerDimensions[position]);
  var h = playerRectIn3d(playerDimensions[position].hit);
  var h2 = playerRectIn3d(playerDimensions[position].hit2);
  var b = {
    width: ballradius * 2,
    height: ballradius * 2,
    x: ball.position.x - ballradius,
    y: ball.position.y - ballradius
  };


  if ((ball.position.z - ballradius < player.position.z) && (ball.position.z - ballradius - ball.velocity.z > player.position.z)) {
    // if we hit the player, make the ball bounce backwards.
    if (isObjectInTarget(b, p)) {
      ball.velocity.z *= -0.7;
    }

    if (isObjectInTarget(b, h)) {
      hit();
    } else {

      if (isObjectInTarget(b, h2)) {
        console.log('Ooouf, in the happy sack.');
      }
      // bring the video to the front
      videoWrapper.style.zIndex = 4;
    }
  }

  // only render whilst the ball is moving
  if (activeTurn || Math.abs(ball.velocity.z) > 0.1) {
    // interactive.debug.update(p, b, h);
    interactive.renderer.render(interactive.scene, interactive.camera);
  }

  if (activeTurn && ball.velocity.z && Math.abs(ball.velocity.z) < 0.1) {
    console.log(Math.abs(ball.velocity.z), Math.abs(ball.velocity.z) < 0.1);
    activeTurn = false;
    $.trigger('endTurn');
  }

  if (window.stats) {
    stats.update();
  }

}


function initGame() {
  $.trigger('showPanel', 'playing');

  window.addEventListener('resize', function () {
    var w = window.innerWidth,
        h = window.innerHeight;
    interactive.camera.aspect = w / h;
    interactive.camera.updateProjectionMatrix();
    interactive.renderer.setSize(w, h);
    background.camera.aspect = w / h;
    background.camera.updateProjectionMatrix();
    background.renderer.setSize(w, h);
    redrawAll();
  }, false /*yeah, like I need this, but heck, I'm a stickler for habits*/);

  document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
  });

  buildStaticObjects();
  var scene = interactive.scene = createInteractiveScene();

  var ball = actor.ball = new Ball(0.15);
  ball.drag = 0.985;

  var player = actor.player = getPlayer(interactive.scene);
  scene.add(player);

  resetBall();

  var track = new Track(interactive.renderer.domElement),
      waitforup = false;

  track.down = function (event) {
    waitforup = true;
    console.log('down', event.type);
  };
  track.up = function (event) {
    console.log('up', event.type);
    if (waitforup && game.turn === true) {
      var x = utils.map(track.downX, 0, window.innerWidth, -100, 100);
      var y = utils.map((track.upY - track.downY - track.momentumY) * -1, 0, window.innerHeight / 2, 0, 100);

      // TODO discover timeout based on a ping test
      var delay = 250;

      $.trigger('throw', {
        posX: x,
        x: track.momentumX,
        y: y,
        speed: track.duration
      });

      setTimeout(function () {
        resetBall(x, track.momentumX, y, track.duration);
      }, delay);
    }
    waitforup = false;
  };

  $.on('remoteThrow', function (event) {
    if (game.turn === false) {
      game.turns--;
      resetBall(event.data.posX, event.data.x, event.data.y, event.data.speed);
    }
  });

  $.on('remoteEndTurn', function () {
    game.turn = !game.turn;
  });

  $.on('endTurn', function () {
    // this event is listened to in the streaming code to push it across to the peer
    game.turn = !game.turn;
  });

  $.on('throw', function () {
    activeTurn = true;
  });

  $.on('remoteHit', function () {
    if (game.turn === false && game.turns) {
      game.them.score++;
      game.turn = true;
      // show hit
      $.trigger('showPanel', 'hit');
      setTimeout(function () {
        $.trigger('showPanel', 'playing');
      }, 500);
    }
  });

  $.on('myturn', function () {
    if (game.turn) {
      // show the "your turn banner";
      // center player for ball throwing
      actor.activePosition = 'center';
    } else {
      // show "their turn banner"
      // show throw player state
      actor.activePosition = 'throw1';
    }
    $.trigger('repaintPlayer');
    $('#turn').classList.add('showTurn');
  });

  $.on('theirScore', function () {
    $.trigger('repaintPlayer');
  });

  resetBall(utils.map(window.innerWidth / 2, 0, window.innerWidth, -100, 100));

  // setupDebug();

  // setInterval(loop, 1000 / 30);
  running = true;
  redrawAll();
  loop();
}

return {
  init: initGame
};

})();