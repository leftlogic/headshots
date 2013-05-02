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
  player: null
};

var TO_RADIANS = Math.PI/180;

var width = window.innerWidth,
    height = window.innerHeight;

function redrawAll() {
  background.renderer.render(background.scene, background.camera);
  interactive.renderer.render(interactive.scene, interactive.camera);
}

function resetBall(posX, x, y, speed) {
  var ball = actor.ball;
  ball.position.z = 700;
  ball.position.y = -180;
  ball.position.x = posX / 2 - window.innerWidth / 4;
  
  ball.velocity.set(0, -20, -20 - (speed * y / 200));
  ball.velocity.rotateY(x);
  ball.velocity.rotateZ(0);
  ball.velocity.rotateX(y);
  interactive.renderer.render(interactive.scene, interactive.camera);
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

function getPlayer(scene) {
  var material = new THREE.ParticleBasicMaterial({
    map: THREE.ImageUtils.loadTexture('/images/player-' + game.me.letter + '-center-3.png', null, redrawAll)
  });

  var height = 430,
      width = 140,
      scale = 0.675;

  var player = interactive.player = new THREE.Particle(material);
  player.position.y = ((height / 2) * scale) + actor.floor.position.y;
  player.position.z = -220;
  player.position.x = -10;
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
  background.player = getPlayer(scene);

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

function isObjectInTarget(rect1, rect2) {
  if ( ((rect1.x<rect2.x + rect2.width) && (rect1.x+rect1.width>rect2.x)) &&
       ((rect1.y<rect2.y + rect2.height) && (rect1.y+rect1.height > rect2.y)) ) {
    return true;
  } else {
    return false;
  }
}

function loop() {
//  requestAnimationFrame(loop);
  var ballradius = 38;

  var ball = actor.ball,
      player = actor.player,
      b, p;

  ball.updatePhysics();

  // don't render unless the ball is moving
  if (ball.position.y - ballradius < actor.floor.position.y) {
    ball.position.y = actor.floor.position.y+ballradius;
    ball.velocity.y *= -0.7;
  }

  if ((ball.position.z - ballradius < player.position.z) && (ball.position.z - ballradius - ball.velocity.z > player.position.z)) {

    p = {
      width: player.material.map.image.width * player.scale.x,
      height: player.material.map.image.height * player.scale.y,
      x: player.position.x,
      y: player.position.y
    };

    p.x -= p.width/2;
    p.y -= p.height/2;

    b = {
      width: ballradius * 2,
      height: ballradius * 2,
      x: ball.position.x - ballradius,
      y: ball.position.y - ballradius
    };

    // if we hit the player, make the ball bounce backwards.
    if (isObjectInTarget(b, p)) {
      ball.velocity.z *= -0.7;
    }
  }

  // only render whilst the ball is moving
  if (Math.abs(ball.velocity.z) > 0.1) {
    interactive.renderer.render(interactive.scene, interactive.camera);
  }

  if (window.stats) {
    stats.update();
  }

}


function init() {
  buildStaticObjects();
  var scene = interactive.scene = createInteractiveScene();

  var ball = actor.ball = new Ball(0.25);
  ball.drag = 0.985;

  scene.add(ball);
  resetBall();

  var player = actor.player = getPlayer(interactive.scene);
  scene.add(player);

  var track = new Track(document.body);

  track.up = function (event) {
    var x = track.x - track.momentumX;
    var y = track.y - track.momentumY;

    resetBall(track.downX, track.momentumX, track.momentumY, track.duration);
  };

  resetBall();
  redrawAll();

  setInterval(loop, 1000 / 30);
}


// returns a random number between the two limits provided
function randomRange(min, max){
  return ((Math.random()*(max-min)) + min);
}

window.onload = init;

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