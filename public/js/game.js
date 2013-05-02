/*globals THREE:true*/
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
  if (klass) container.className += ' ' + klass;
  $('.scene').appendChild(container);

  return container;
}

function getFloor(scene) {
  var material = new THREE.MeshBasicMaterial({ color: 0x16947B, wireframe:true, wireframeLinewidth: 2 });

  var geom = new THREE.PlaneGeometry(1000, 2300, 20, 10);
  var floor = new THREE.Mesh(geom, material);

  floor.rotation.x = -92 * TO_RADIANS;
  floor.position.y = -250;
  floor.position.z = 100;

  var material2 = new THREE.MeshBasicMaterial({ color: 0x169b80 });

  var geom2 = new THREE.PlaneGeometry(1000, 2300, 20, 10);
  var floorbg = new THREE.Mesh(geom2, material2);

  floorbg.rotation.x = -92 * TO_RADIANS;
  floorbg.position.y = -250;
  floorbg.position.z = 100;

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

  var floor = getFloor(scene);

  // TODO add billboard

  var renderer = new THREE.CanvasRenderer();
  renderer.setSize(width, height);

  container.appendChild(renderer.domElement);
  renderer.render(scene, camera);
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
}

function loop() {
  var ballradius = 40;

  ball.updatePhysics();
  if(ball.position.y-ballradius<floor.position.y) {
    ball.position.y = floor.position.y+ballradius;
    ball.velocity.y*=-0.7;
  }

  if (ball.velocity.z < -0.1) renderer.render(scene, camera);

}

// returns a random number between the two limits provided
function randomRange(min, max){
  return ((Math.random()*(max-min)) + min);
}

window.onload = init;