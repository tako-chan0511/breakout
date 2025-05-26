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
import {
  ref,
  watch,
  onMounted,
  onUnmounted,
  defineProps,
  getCurrentInstance,
  defineExpose
} from 'vue';
import type { PropType } from 'vue';

// Emit 型定義
const emit = getCurrentInstance()!.emit as (
  e: 'update:score' | 'update:lives' | 'update:level' | 'lost-ball' | 'game-over',
  payload: any
) => void;

// Props
const props = defineProps({
  ballColor:       { type: String as PropType<string>, default: '#0095DD' },
  paddleColor:     { type: String as PropType<string>, default: '#0095DD' },
  brickColors:     { type: Array as PropType<string[]>, default: () => ['#0095DD', '#DD9500', '#95DD00'] },
  backgroundColor: { type: String as PropType<string>, default: '#000' },
  paddleWidth:     { type: Number as PropType<number>, default: 75 },
  enableMouse:     { type: Boolean as PropType<boolean>, default: false },
  gameActive:      { type: Boolean as PropType<boolean>, default: false },
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
let lives = 3;
let paused = false; // ボール喪失後の一時停止
let gameOver = false;
const score = ref(0);
const level = ref(1);

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
  lives = 3;
  score.value = 0;
  level.value = 1;
  gameOver = false;
  paused = false;
  bricks.forEach(col => col.forEach(b => (b.status = 1)));
}
watch(
  () => props.gameActive,
  active => { if (active) initGame(); }
);

// 入力処理
const leftPressed = ref(false);
const rightPressed = ref(false);
function keyDownHandler(e: KeyboardEvent) {
  if (!props.gameActive || gameOver || paused) return;
  if (e.key === 'ArrowLeft')  leftPressed.value = true;
  if (e.key === 'ArrowRight') rightPressed.value = true;
}
function keyUpHandler(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft')  leftPressed.value = false;
  if (e.key === 'ArrowRight') rightPressed.value = false;
}

// タッチ操作
let lastTouchX: number | null = null;
function touchStartHandler(e: TouchEvent) {
  if (!props.gameActive || gameOver || paused) return;
  lastTouchX = e.touches[0].clientX;
}
function touchMoveHandler(e: TouchEvent) {
  if (!props.gameActive || gameOver || paused || lastTouchX === null || !canvas.value) return;
  const tx = e.touches[0].clientX;
  const delta = (tx - lastTouchX) * (width / canvas.value.getBoundingClientRect().width);
  paddleX = Math.max(0, Math.min(paddleX + delta, width - props.paddleWidth));
  lastTouchX = tx;
}
function touchEndHandler() {
  lastTouchX = null;
}

// 描画関数
function clearBackground() {
  ctx.fillStyle = props.backgroundColor!;
  ctx.fillRect(0, 0, width, height);
}
function drawHUD() {
  ctx.font = '16px Arial';
  ctx.fillStyle = props.ballColor!;
  ctx.fillText(`得点: ${score.value}`, 8, 20);
  ctx.fillText(`レベル: ${level.value}`, width / 2 - 30, 20);
  ctx.fillText(`残ボール: ${lives}`, width - 100, 20);
  emit('update:score', score.value);
  emit('update:lives', lives);
  emit('update:level', level.value);
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
      b.x = x; b.y = y;
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
    emit('update:level', level.value);
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
    if (!paused) {
      if (leftPressed.value)  paddleX = Math.max(0, paddleX - 7);
      if (rightPressed.value) paddleX = Math.min(width - props.paddleWidth, paddleX + 7);
      collisionDetection();
      if (ballX + dx > width - ballRadius || ballX + dx < ballRadius) dx = -dx;
      if (ballY + dy < ballRadius) dy = -dy;
      else if (ballY + dy > height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + props.paddleWidth) dy = -dy;
        else {
          lives--;
          emit('update:lives', lives);
          emit('lost-ball', lives);
          paused = true;
          if (lives === 0) {
            gameOver = true;
            emit('game-over', { score: score.value, lives });
          }
        }
      }
      ballX += dx;
      ballY += dy;
    }
  }
  requestAnimationFrame(drawLoop);
}

onMounted(() => {
  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d')!;
  window.addEventListener('keydown', keyDownHandler);
  window.addEventListener('keyup',   keyUpHandler);
  canvas.value.addEventListener('touchstart', touchStartHandler as EventListener);
  canvas.value.addEventListener('touchmove',  touchMoveHandler   as EventListener);
  canvas.value.addEventListener('touchend',   touchEndHandler    as EventListener);
  drawLoop();
});

onUnmounted(() => {
  window.removeEventListener('keydown', keyDownHandler);
  window.removeEventListener('keyup',   keyUpHandler);
  canvas.value?.removeEventListener('touchstart', touchStartHandler as EventListener);
  canvas.value?.removeEventListener('touchmove',  touchMoveHandler   as EventListener);
  canvas.value?.removeEventListener('touchend',   touchEndHandler    as EventListener);
});

// ボール再スタート用メソッドを公開
function resetBall() {
  ballX = width / 2;
  ballY = height - paddleHeight - ballRadius;
  dx = 2;
  dy = -2;
  paused = false;
}
defineExpose({ resetBall });
</script>

<style scoped>
.canvas-wrapper {
  position: relative;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: 80px;
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