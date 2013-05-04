/*globals THREE:true, Ball:true, Track:true, stats:true, $:true, game:true*/
"use strict";

var interactive = {
  camera: null,
  scene: null,
  renderer: null
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
  }
};

var TO_RADIANS = Math.PI/180;

var width = window.innerWidth,
    height = window.innerHeight;

function redrawAll() {
  background.renderer.render(background.scene, background.camera);
  interactive.renderer.render(interactive.scene, interactive.camera);
}

function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function resetBall(posX, x, y, speed) {
  if (!posX) {posX = 0;}
  if (!x) {x = 0;}
  if (!y) {y = 0;}
  if (!speed) {speed = 0;}
  var ball = actor.ball;

  if (game.turn === true) {
    $.trigger('throw', {
      posX: posX,
      x: x,
      y: y,
      speed: speed
    });
  }

  var posZ = game.turn ? 620 : -220;

  if (!game.turn) {
    speed *= -1;
  }

  ball.position.z = posZ;
  ball.position.y = -95;

  ball.position.x = map(posX, 0, window.innerWidth, -100, 100);


  ball.velocity.set(0, 0, -speed * 0.35);

  ball.velocity.rotateY(x);
  ball.velocity.rotateZ(0);
  ball.velocity.rotateX(y * 80);
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
  camera.rotation.x = -8 * TO_RADIANS;

  return camera;
}

function generateSprite() {
  var canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');

  var positions = {},
      defaultPosition = game.turn ? 'center' : 'throw1';

  ['center','left','right', 'hit1', 'hit2', 'throw1'].forEach(function (position) {
    var i = positions[position] = new Image();
    // render the center position
    if (position === defaultPosition) {
      i.onload = function () {
        ctx.drawImage(positions[position], 0, 0);
      };
    }

    i.src = '/images/player-' + game.me.letter + '-' + position + '.png';
  });

  playerDimensions.width = canvas.width = 400;
  playerDimensions.height = canvas.height = 450;

  var clear = function () {
    ctx.clearRect(0, 0, 400, 450);
  };

  var timer = null;

  window.hit = function () {
    clearTimeout(timer);
    clear();
    ctx.drawImage(positions.hit1, 0, 0);
    setTimeout(function () {
      clear();
      ctx.drawImage(positions.hit2, 0, 0);
    }, 400);
  };

  var video = $('video');

  window.updateVideo = function () {
    return;
    if (!video) {
      video = $('video');
    }

    if (video) {
      var w = video.videoWidth;
      var h = video.videoHeight;

      var narrow = w > h ? h : w,
          x = (w - narrow) / 2,
          y = (h - narrow) / 2,
          target = 40;

      var dim = playerDimensions.center.hit;
      //ctx.drawImage(video, x, y, narrow, narrow, dim.x, dim.y, dim.width, dim.height);
    }
  };

  var ctr = 0;
  var types = 'left center right'.split(' ');

  $.on('orientation', function (event) {
    var i = 1;
    if (event.data.raw < -75 || event.data.raw > 200) {
      i = 0;
    } else if (event.data.raw > 75) {
      i = 2;
    }

    clear();
    ctx.drawImage(positions[types[i]], 0, 0);
    actor.activePosition = types[i];
  });

  // function draw() {
  //   clear();
  //   // ctr++;
  //   // ctr = ctr % types.length;
  //   ctr = 1;
  //   ctx.drawImage(positions[types[ctr]], 0, 0);
  //   actor.activePosition = types[ctr];
  //   var dim = playerDimensions[types[ctr]];
  //   timer = setTimeout(draw, 2000);

  //   // TODO remove debug
  //   //ctx.strokeRect(dim.x, dim.y, dim.width, dim.height);
  // }

  // draw();

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

  //debug();

  return scene;
}

function makePlane() {
  var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe:true, wireframeLinewidth: 2 });

  var geom = new THREE.PlaneGeometry(1, 1, 10, 10);
  var plane = new THREE.Mesh(geom, material);

  return plane;
}

function debug() {
  var p = makePlane();
  var b = makePlane();
  var h = makePlane();

  var showDebug = false;
  var update = function (player, ball, hit) {
    if (showDebug) {
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

  interactive.scene.add(p);
  interactive.scene.add(b);
  interactive.scene.add(h);
}

function isObjectInTarget(rect1, rect2) {
  if ( ((rect1.x<rect2.x + rect2.width) && (rect1.x+rect1.width>rect2.x)) &&
       ((rect1.y<rect2.y + rect2.height) && (rect1.y+rect1.height > rect2.y)) ) {
    return true;
  } else {
    return false;
  }
}

function loop() {
  requestAnimationFrame(loop);

  var ball = actor.ball,
      player = actor.player,
      b = {}, p = {}, h = {},
      dims = playerDimensions[actor.activePosition];

  var ballradius = ball.size;

  ball.updatePhysics();

  // don't render unless the ball is moving
  if (ball.position.y - ballradius < actor.floor.position.y) {
    ball.position.y = actor.floor.position.y+ballradius;
    ball.velocity.y *= -0.7;
  }
  
  // would like this to be a sprite
/*  if (ball.position.z < -700) {
    ball.velocity.z *= -0.7;
  }*/

  var px = player.position.y + ((playerDimensions.height * player.scale.y) / 2),
      py = player.position.x - ((playerDimensions.width * player.scale.x) / 2);

  p = {
    width: dims.width * player.scale.x,
    height: dims.height * player.scale.y,
    x: py + (dims.x * player.scale.x),
    y: px - (dims.y * player.scale.y) - dims.height * player.scale.y
  };

  h = {
    width: dims.hit.width * player.scale.x,
    height: dims.hit.height * player.scale.y,
    x: px + (dims.hit.x * player.scale.x),
    y: py - (dims.hit.y * player.scale.y) - dims.hit.height * player.scale.y
  };

  b = {
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
    }
  }

  window.updateVideo();

  // only render whilst the ball is moving
  if (true || Math.abs(ball.velocity.z) > 0.1) {
    //interactive.debug.update(p, b, h);
    interactive.renderer.render(interactive.scene, interactive.camera);
  }

  if (window.stats) {
    stats.update();
  }

}


function init() {
  buildStaticObjects();
  var scene = interactive.scene = createInteractiveScene();

  var ball = actor.ball = new Ball(0.15);
  ball.drag = 0.985;

  scene.add(ball);
  resetBall();

  var player = actor.player = getPlayer(interactive.scene);
  scene.add(player);

  var track = new Track(document.body);

  track.up = function (event) {
    var x = track.x - track.momentumX;
    var y = (track.upY - track.downY) - track.momentumY;

    //if (game.turn === true) {
      resetBall(track.downX, track.momentumX, y / window.height, track.duration);
    //}
  };

  $.on('throw', function (event) {
    if (game.turn === false) {
      resetBall(event.data.posX, event.data.x, event.data.y, event.data.speed);
    }
  });

  resetBall(window.innerWidth / 2);

  // setInterval(loop, 1000 / 30);
  loop();
}


// returns a random number between the two limits provided
function randomRange(min, max){
  return ((Math.random()*(max-min)) + min);
}

window.addEventListener('load', init, false);

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