<template>
  <canvas
    ref="canvas"
    :width="width"
    :height="height"
    class="game-canvas"
  ></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const width  = 480;
const height = 320;
const canvas = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D;
let ballX = width / 2;
let ballY = height - 30;
const ballRadius = 10;
let dx = 2;
let dy = -2;

const paddleHeight = 10;
const paddleWidth  = 75;
let paddleX = (width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed  = false;

// ブロック設定
const brickRowCount    = 3;
const brickColumnCount = 5;
const brickWidth       = 75;
const brickHeight      = 20;
const brickPadding     = 10;
const brickOffsetTop   = 30;
const brickOffsetLeft  = 30;

// bricks[c][r] = { x, y, status }
const bricks: { x: number; y: number; status: number }[][] = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

function keyDownHandler(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') rightPressed = true;
  if (e.key === 'ArrowLeft')  leftPressed  = true;
}

function keyUpHandler(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') rightPressed = false;
  if (e.key === 'ArrowLeft')  leftPressed  = false;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (
          ballX > b.x &&
          ballX < b.x + brickWidth &&
          ballY > b.y &&
          ballY < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
        }
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  drawBricks();
  drawBall();
  drawPaddle();
  collisionDetection();

  // 壁との反射
  if (ballX + dx > width - ballRadius || ballX + dx < ballRadius) dx = -dx;
  if (ballY + dy < ballRadius) dy = -dy;
  else if (ballY + dy > height - ballRadius) {
    // パドルとの衝突判定
    if (ballX > paddleX && ballX < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      // ゲームオーバー → リロード
      document.location.reload();
      return;
    }
  }

  // パドル移動
  if (rightPressed) paddleX += 7;
  if (leftPressed)  paddleX -= 7;
  if (paddleX < 0)                 paddleX = 0;
  if (paddleX + paddleWidth > width) paddleX = width - paddleWidth;

  // ボールを次の位置へ
  ballX += dx;
  ballY += dy;
  requestAnimationFrame(draw);
}

onMounted(() => {
  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d')!;
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup',   keyUpHandler);
  draw();
});

onUnmounted(() => {
  document.removeEventListener('keydown', keyDownHandler);
  document.removeEventListener('keyup',   keyUpHandler);
});
</script>

<style scoped>
.game-canvas {
  border: 2px solid #333;
  display: block;
  margin: 0 auto;
  background: #eee;
  touch-action: none; /* モバイルでの不要なズーム防止 */
}
</style>
