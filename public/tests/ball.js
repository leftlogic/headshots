/*globals THREE:true*/
var Ball = (function () {
"use strict";

var TO_RADIANS = Math.PI / 180;

// Particle3D class
var Ball = function (scale) {
  // var material = new THREE.ParticleCanvasMaterial({
  //   color: 0xff0000,
  //   program: function ( context ) {
  //      // paint a custom shape on this canvas
  //     context.beginPath();
  //     context.arc( 0, 0, 1, 0, Math.PI*2, true );
  //     context.closePath();
  //     context.fill();
  //   }
  // });

  var ball = this;

  var material = new THREE.ParticleBasicMaterial( {
    map: THREE.ImageUtils.loadTexture('/images/ball.png', null, function () {
      ball.size = material.map.image.width / 2 * ball.scale.x;
      window.redrawAll();
    })
  });

  THREE.Particle.call( this, material );

  //define properties
  this.velocity = new THREE.Vector3(0,0,0);
  //this.velocity.rotateX(randomRange(-45,45)); 
  //this.velocity.rotateY(randomRange(0,360)); 
  this.gravity = new THREE.Vector3(0,-1,0);
  this.drag = 1;

  this.scale.x = this.scale.y = scale || 20;
  this.size = scale;
};

Ball.prototype = new THREE.Particle();
Ball.prototype.constructor = Ball;
Ball.prototype.updatePhysics = function() {

  this.velocity.multiplyScalar(this.drag);
  this.velocity.add(this.gravity);
  this.position.add(this.velocity);

};

THREE.Vector3.prototype.rotateY = function(angle){
  var cosRY = Math.cos(angle * TO_RADIANS),
      sinRY = Math.sin(angle * TO_RADIANS);

  var tempz = this.z;
  var tempx = this.x;

  this.x= (tempx*cosRY)+(tempz*sinRY);
  this.z= (tempx*-sinRY)+(tempz*cosRY);

};

THREE.Vector3.prototype.rotateX = function(angle){
  var cosRY = Math.cos(angle * TO_RADIANS),
      sinRY = Math.sin(angle * TO_RADIANS);

  var tempz = this.z;
  var tempy = this.y;

  this.y= (tempy*cosRY)+(tempz*sinRY);
  this.z= (tempy*-sinRY)+(tempz*cosRY);

};

THREE.Vector3.prototype.rotateZ = function(angle) {
  var cosRY = Math.cos(angle * TO_RADIANS),
      sinRY = Math.sin(angle * TO_RADIANS);

  var tempx = this.x;
  var tempy = this.y;

  this.y= (tempy*cosRY)+(tempx*sinRY);
  this.x= (tempy*-sinRY)+(tempx*cosRY);

};
})();