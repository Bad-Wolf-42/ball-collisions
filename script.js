const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;

let mouse = {
  x: undefined,
  y: undefined,
  holdingBall: false
}

const maxBalls = 30;
let ballsArray = [];

let cueBall = {
  originX: 250,
  originY: 300,
  x: 250,
  y: 300,
  vx: 0,
  vy: 0,
  theta: undefined,
  radius: 10,
  color: 'white',
  draw: function() {
    ctx.strokeStyle = '#777';
    ctx.beginPath();
    ctx.moveTo(this.originX, this.originY);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  },
  update: function() {
    if (mouse.holdingBall) {
      this.x = mouse.x;
      this.y = mouse.y;
    }
    this.x += this.vx;
    this.y += this.vy;
    if (this.x - this.radius > canvas.width || this.x + this.radius < 0 || this.y + this.radius < 0 || this.y - this.radius > canvas.height) {
      this.vx = 0;
      this.vy = 0;
      this.x = this.originX;
      this.y = this.originY;
    }
  }
}

class Ball {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = 0;
    this.vy = 0;
    this.radius = 10;
    this.hue = this.x / canvas.width * 360;
    this.color = `hsla(${this.hue}, 100%, 50%, 1)`;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
  }
  update() {
    let friction = 0.99;
    if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0) {
      this.vx = -this.vx;
    }
    if (this.y + this.radius >= canvas.height || this.y - this.radius <= 0) {
      this.vy = - this.vy;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= friction;
    this.vy *= friction;
    this.hue = this.x / canvas.width * 360;
    this.color = `hsla(${this.hue}, 100%, 50%, 1)`;
  }
}

function shoot() {
  let dx = cueBall.x - cueBall.originX;
  let dy = cueBall.y - cueBall.originY;
  let magnitude = 0.1;
  cueBall.vx = -dx * magnitude;
  cueBall.vy = -dy * magnitude;
  mouse.holdingBall = false;
}

function impact(angle, ball, cue) {
  let cueSpeed = Math.sqrt(cue.vx * cue.vx + cue.vy * cue.vy);
  let vx = Math.cos(angle) * cueSpeed / 5; //5
  let vy = Math.sin(angle) * cueSpeed / 5;
  ball.vx += vx;
  ball.vy += vy;
}

function handleCollisions() {
  //compare target balls and cue
  for (i = 0; i < ballsArray.length; i++) {
    let dx = ballsArray[i].x - cueBall.x;
    let dy = ballsArray[i].y - cueBall.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let theta = Math.atan2(dy, dx);
    if (distance < ballsArray[i].radius + cueBall.radius) {
      impact(theta, ballsArray[i], cueBall);
    }
  }
  //compare between moving target ballSpeed
  for (i = 0; i < ballsArray.length; i++) {
    for (j = 0; j < ballsArray.length; j++) {
      if (i === j) continue;
      let dx = ballsArray[i].x - ballsArray[j].x;
      let dy = ballsArray[i].y - ballsArray[j].y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let theta = Math.atan2(dy, dx);
      if (distance < ballsArray[i].radius + ballsArray[j].radius) {
        impact(theta, ballsArray[i], ballsArray[j]);
      }
    }
  }
}

function generateBalls() {
  for (i = 0; i < maxBalls; i++) {
    ballsArray.push(new Ball);
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (i = 0; i < ballsArray.length; i++) {
    ballsArray[i].update();
    ballsArray[i].draw();
  }
  cueBall.update();
  cueBall.draw();
  handleCollisions();
  requestAnimationFrame(animate);
}

function init() {
  generateBalls();
  animate();
}

window.addEventListener('mousemove', function(e) {
  let boundary = canvas.getBoundingClientRect();
  mouse.x = e.x - boundary.x - 2;
  mouse.y = e.y - boundary.y - 2;
});

window.addEventListener('mousedown', function() {
  let dx = cueBall.x - mouse.x;
  let dy = cueBall.y - mouse.y;
  let distance = Math.sqrt(dx * dx + dy * dy);
  if (distance < cueBall.radius) {
    mouse.holdingBall = true;
  }
});

window.addEventListener('mouseup', function() {
  if (mouse.holdingBall) shoot();
});

window.addEventListener('mouseout', function() {
  if (mouse.holdingBall) shoot();
});

init();
