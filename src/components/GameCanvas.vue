//// GameCanvas.vue /////
<template>
  <div class="canvas-wrapper">
    <canvas
      ref="canvas"
      :width="width"
      :height="height"
      class="game-canvas"
    ></canvas>
    <!-- パドル下のスワイプエリア（80px） -->
    <div
      class="swipe-area"
      @touchstart.prevent="touchStartHandler"
      @touchmove.prevent="touchMoveHandler"
      @touchend.prevent="touchEndHandler"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, defineProps, getCurrentInstance } from 'vue';
import type { PropType } from 'vue';

// Emit 型
const emit = getCurrentInstance()!.emit as (e: 'game-over', payload: { level: number; score: number }) => void;

// Props
const props = defineProps({
  ballColor:       { type: String as PropType<string>, default: '#0095DD' },
  paddleColor:     { type: String as PropType<string>, default: '#0095DD' },
  brickColors:     { type: Array as PropType<string[]>, default: () => ['#0095DD', '#DD9500', '#95DD00'] },
  backgroundColor: { type: String as PropType<string>, default: '#000' },
  paddleWidth:     { type: Number as PropType<number>, default: 75 },
  enableMouse:     { type: Boolean as PropType<boolean>, default: false },
  gameActive:      { type: Boolean as PropType<boolean>, default: false }
});

// Canvas 設定
const width = 480;
const height = 320;
const canvas = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D;

// ゲームステート
let ballX = 0;
let ballY = 0;
const ballRadius = 10;
let dx = 0;
let dy = 0;
const paddleHeight = 10;
let paddleX = 0;
let gameOver = false;

const score = ref(0);
const level = ref(1);

// キーボード状態
const leftPressed = ref(false);
const rightPressed = ref(false);

// ブロック設定
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
const bricks: { x: number; y: number; status: number }[][] = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// ゲーム初期化
function initGame() {
  ballX = width / 2;
  ballY = height - paddleHeight - ballRadius;
  dx = 2;
  dy = -2;
  paddleX = (width - props.paddleWidth) / 2;
  gameOver = false;
  score.value = 0;
  level.value = 1;
  bricks.forEach(col => col.forEach(b => (b.status = 1)));
}
watch(() => props.gameActive, active => { if (active) initGame(); });

// キーボード操作
function keyDownHandler(e: KeyboardEvent) {
  if (!props.gameActive || gameOver) return;
  if (e.key === 'ArrowLeft') leftPressed.value = true;
  if (e.key === 'ArrowRight') rightPressed.value = true;
}
function keyUpHandler(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') leftPressed.value = false;
  if (e.key === 'ArrowRight') rightPressed.value = false;
}

// タッチ操作
let lastTouchX: number | null = null;
function touchStartHandler(e: TouchEvent) {
  lastTouchX = e.touches[0].clientX;
}
function touchMoveHandler(e: TouchEvent) {
  if (!props.gameActive || gameOver || lastTouchX === null || !canvas.value) return;
  const tx = e.touches[0].clientX;
  const deltaPx = tx - lastTouchX;
  const scale = width / canvas.value.getBoundingClientRect().width;
  paddleX = Math.max(0, Math.min(paddleX + deltaPx * scale, width - props.paddleWidth));
  lastTouchX = tx;
}
function touchEndHandler() {
  lastTouchX = null;
}

// マウス操作
let isMouseDown = false;
let lastMouseX: number | null = null;
function mouseDownHandler(e: MouseEvent) {
  if (!props.enableMouse || !props.gameActive || gameOver) return;
  isMouseDown = true;
  lastMouseX = e.clientX;
}
function mouseMoveHandler(e: MouseEvent) {
  if (!props.enableMouse || !isMouseDown || !canvas.value || !props.gameActive || gameOver) return;
  const deltaPx = e.clientX - (lastMouseX ?? e.clientX);
  const scale = width / canvas.value.getBoundingClientRect().width;
  paddleX = Math.max(0, Math.min(paddleX + deltaPx * scale, width - props.paddleWidth));
  lastMouseX = e.clientX;
}
function mouseUpHandler() {
  isMouseDown = false;
  lastMouseX = null;
}

// 描画関数
function clearBackground() {
  ctx.fillStyle = props.backgroundColor!;
  ctx.fillRect(0, 0, width, height);
}
function drawHUD() {
  ctx.font = '16px Arial';
  ctx.fillStyle = props.ballColor!;
  ctx.fillText(`Score: ${score.value}`, 8, 20);
  ctx.fillText(`Level: ${level.value}`, width - 70, 20);
}
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = props.ballColor!;
  ctx.fill();
  ctx.closePath();
}
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, height - paddleHeight, props.paddleWidth, paddleHeight);
  ctx.fillStyle = props.paddleColor!;
  ctx.fill();
  ctx.closePath();
}
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = bricks[c][r];
      if (b.status !== 1) continue;
      const x = c * (brickWidth + brickPadding) + brickOffsetLeft;
      const y = r * (brickHeight + brickPadding) + brickOffsetTop;
      b.x = x;
      b.y = y;
      ctx.beginPath();
      ctx.fillStyle = props.brickColors![r % props.brickColors!.length];
      ctx.rect(x, y, brickWidth, brickHeight);
      ctx.fill();
      ctx.closePath();
    }
  }
}
function collisionDetection() {
  let rem = 0;
  bricks.forEach(col => col.forEach(b => {
    if (b.status === 1) {
      rem++;
      if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
        dy = -dy;
        b.status = 0;
        score.value += 10;
      }
    }
  }));
  if (rem === 0) {
    level.value++;
    dx *= 1.2;
    dy *= 1.2;
    bricks.forEach(col => col.forEach(b => (b.status = 1)));
  }
}
function drawLoop() {
  clearBackground();
  drawHUD();
  drawBricks();
  drawPaddle();
  drawBall();
  if (props.gameActive && !gameOver) {
    if (leftPressed.value) paddleX = Math.max(0, paddleX - 7);
    if (rightPressed.value) paddleX = Math.min(width - props.paddleWidth, paddleX + 7);
    collisionDetection();
    if (ballX + dx > width - ballRadius || ballX + dx < ballRadius) dx = -dx;
    if (ballY + dy < ballRadius) dy = -dy;
    else if (ballY + dy > height - ballRadius) {
      if (ballX > paddleX && ballX < paddleX + props.paddleWidth) {
        dy = -dy;
      } else {
        gameOver = true;
        emit('game-over', { level: level.value, score: score.value });
      }
    }
    ballX += dx;
    ballY += dy;
  }
  requestAnimationFrame(drawLoop);
}

onMounted(() => {
  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d')!;
  window.addEventListener('keydown', keyDownHandler);
  window.addEventListener('keyup', keyUpHandler);
  drawLoop();
});

onUnmounted(() => {
  window.removeEventListener('keydown', keyDownHandler);
  window.removeEventListener('keyup', keyUpHandler);
});
</script>

<style scoped>
.canvas-wrapper {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: 80px; /* パドル下操作領域 */
}
.game-canvas {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 480 / 320;
  border: 2px solid #333;
}
.swipe-area {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
}
</style>
