/*globals THREE:true, Ball:true, Track:true, stats:true, $:true, game:true*/
"use strict";
var container;
var camera, scene, renderer;
var floor, ball;
var material;
var TO_RADIANS = Math.PI/180;

var track;

var width = 400,
    height = window.innerHeight;

function resetBall(x, y, speed) {
  console.log(x, y, (speed * y) /10);
  ball.position.z = 800;
  ball.position.y = -200;
  ball.position.x = 0;
  ball.velocity.set(0, -20, -20 - (speed * y / 200));
  ball.velocity.rotateY(x);
  ball.velocity.rotateZ(0);
  ball.velocity.rotateX(y);
}

function getContainer(klass) {
  var container = document.createElement('div');
  container.className = 'three';
  if (klass) { container.className += ' ' + klass; }
  $('.scene').appendChild(container);

  return container;
}

function getFloor(scene) {
  var material = new THREE.MeshBasicMaterial({ color: 0x16947B, wireframe:true, wireframeLinewidth: 2 });

  var geom = new THREE.PlaneGeometry(1000, 1500, 20, 10);
  var floor = new THREE.Mesh(geom, material);

  floor.rotation.x = -89 * TO_RADIANS;
  floor.position.y = -250;
  floor.position.z = 100;

/*  var material2 = new THREE.MeshBasicMaterial({ color: 0x169b80 });

  var geom2 = new THREE.PlaneGeometry(1000, 2300, 20, 10);
  var floorbg = new THREE.Mesh(geom2, material2);

  floorbg.rotation.x = -92 * TO_RADIANS;
  floorbg.position.y = -250;
  floorbg.position.z = 100;
*/
  if (scene) {
    scene.add(floor);
 //   scene.add(floorbg);
  }

  return floor;
}

function getCamera() {
  var camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.z = 1000;
  camera.rotation.x = -8 * TO_RADIANS;

  return camera;
}

function buildStaticObjects() {
  var container = getContainer('backdrop');

  var camera = getCamera();

  var scene = new THREE.Scene();
  scene.add(camera);
  
  var ready = function () {
    var renderer = new THREE.CanvasRenderer();
    renderer.setSize(width, height);
  
    container.appendChild(renderer.domElement);
    renderer.render(scene, camera);
    
      renderer.render(scene, camera);
  };

  var floor = getFloor(scene);
  var player = getPlayer(scene, floor, ready);

}

function getPlayer(scene, floor, ready) {

  // TODO add billboard
  var material = new THREE.MeshBasicMaterial({
    map: new THREE.ImageUtils.loadTexture('/images/player-' + game.me.letter + '-center-3.png', undefined, ready)
  });

  var height = 430,
      width = 140,
      scale = 0.675;

  var geom = new THREE.PlaneGeometry(width, height, 0, 0);
  window.player = new THREE.Mesh(geom, material);

  var y = ((height / 2) * scale) + floor.position.y;

  player.position.y = y;
  player.position.z = -220;
  player.position.x = -10;
  
  player.scale.x = player.scale.y = scale;

  scene.add(player);
  return player;
  
}

function createScene() {
  scene = new THREE.Scene();

  container = getContainer();

  camera = getCamera();
  scene.add(camera);

  floor = getFloor();
  renderer = new THREE.CanvasRenderer();
  renderer.setSize(width, height);

  container.appendChild(renderer.domElement);

  return scene;
}

function loop() {
//  requestAnimationFrame(loop);
  var ballradius = 40;

  ball.updatePhysics();
  if (ball.position.y-ballradius<floor.position.y) {
    ball.position.y = floor.position.y+ballradius;
    ball.velocity.y *= -0.7;
  }
  
  if ((ball.position.z < player.position.z) && (ball.position.z - ball.velocity.z > player.position.z)) { 
    if ((ball.position.x > player.position.x) && (ball.position.x < (player.position.x + 140 * 0.675))) {
      //console.log(ball.position.x, player.position.x, player.position.x + 140 * 0.675, (ball.position.x > player.position.x) && (ball.position.x < (player.position.x + 140 * 0.675)));
      console.log('in range');
      ball.velocity.z *= -0.7;
    }
  }

  // only render whilst the ball is moving
  if (Math.abs(ball.velocity.z) > 0.1) {
    renderer.render(scene, camera);
  }

//player.rotation.y+= 0.1;

  if (window.stats) {
    stats.update();
  }

}


function init() {
  buildStaticObjects();
  scene = createScene();

  ball = new Ball(25);
  ball.drag = 0.985;

  scene.add(ball);
  resetBall();

  document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
  });

  track = new Track(document.body);

  track.up = function (event) {
    var x = track.x - track.momentumX;
    var y = track.y - track.momentumY;

    resetBall(track.momentumX, track.momentumY, track.duration);
  };


  setInterval(loop, 1000 / 30);
  //loop();
}


// returns a random number between the two limits provided
function randomRange(min, max){
  return ((Math.random()*(max-min)) + min);
}

window.onload = init;
