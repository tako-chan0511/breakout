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
  getCurrentInstance
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
// 最大速度（この値以上にはならない）
const MAX_SPEED = 12;
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
  dx = 4;
  dy = -4;
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
// ボール円と矩形の衝突判定（改良版）
function circleRectCollision(cx: number, cy: number, r: number, rx: number, ry: number, rw: number, rh: number): { collide: boolean; normal: { x: number; y: number } } {
  // 矩形の最も近い点をボール中心から見つける
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  
  // ボール中心から最も近い点までの距離
  const distX = closestX - cx;
  const distY = closestY - cy;
  const distance = Math.sqrt(distX * distX + distY * distY);
  
  if (distance < r) {
    // 衝突している。法線を計算
    if (distance === 0) {
      return { collide: true, normal: { x: 0, y: -1 } };
    }
    let normalX = distX / distance;
    let normalY = distY / distance;
    return { collide: true, normal: { x: normalX, y: normalY } };
  }
  return { collide: false, normal: { x: 0, y: 0 } };
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
      
      // 高速移動時のすり抜け防止：マルチステップで衝突判定
      const speed = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.max(1, Math.ceil(speed / ballRadius));
      const stepDx = dx / steps;
      const stepDy = dy / steps;
      
      for (let step = 0; step < steps; step++) {
        // ボール位置を更新
        ballX += stepDx;
        ballY += stepDy;

        let collided = false;

        // 壁衝突（水平）
        if (ballX - ballRadius < 0 || ballX + ballRadius > width) {
          dx = -dx;
          ballX = Math.max(ballRadius, Math.min(width - ballRadius, ballX));
          collided = true;
        }

        // 壁衝突（垂直上部）
        if (ballY - ballRadius < 0) {
          dy = -dy;
          ballY = ballRadius;
          collided = true;
        }

        // ボール位置のブロック衝突判定
        if (!collided) {
          for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
              const b = bricks[c][r];
              if (b.status === 1) {
                const collision = circleRectCollision(ballX, ballY, ballRadius, b.x, b.y, brickWidth, brickHeight);
                if (collision.collide) {
                  const dotProduct = dx * collision.normal.x + dy * collision.normal.y;

                  // 簡易的な貫通補正（法線方向へ押し戻す）
                  const cx = b.x + brickWidth / 2;
                  const cy = b.y + brickHeight / 2;
                  const penetration = ballRadius - (Math.abs(collision.normal.x * (ballX - cx)) + Math.abs(collision.normal.y * (ballY - cy)));
                  if (penetration > 0) {
                    ballX -= collision.normal.x * penetration;
                    ballY -= collision.normal.y * penetration;
                  }

                  dx -= 2 * dotProduct * collision.normal.x;
                  dy -= 2 * dotProduct * collision.normal.y;
                  b.status = 0;
                  score.value += 10;

                  // 縦方向の最小速度を保証
                  const minVerticalSpeed = 1.5;
                  if (Math.abs(dy) < minVerticalSpeed) {
                    dy = dy < 0 ? -minVerticalSpeed : minVerticalSpeed;
                  }

                  collided = true;
                  break;
                }
              }
            }
            if (collided) break;
          }
        }

        // パドル衝突と底部判定
        if (!collided && ballY + ballRadius > height - paddleHeight) {
          if (ballX > paddleX && ballX < paddleX + props.paddleWidth) {
            dy = -dy;
            ballY = height - paddleHeight - ballRadius;
            collided = true;
          } else {
            // 完全に画面外に出ている場合もカウント
            lives--;
            emit('update:lives', lives);
            emit('lost-ball', lives);
            paused = true;
            if (lives === 0) {
              gameOver = true;
              emit('game-over', { score: score.value, lives });
            }
            // ボールが見えなくなるのを防ぐため位置補正
            ballX = width / 2;
            ballY = height - paddleHeight - ballRadius;
            break;
          }
        }

        // レベルアップ判定
        let rem = 0;
        for (let c = 0; c < brickColumnCount; c++) {
          for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) rem++;
          }
        }
        if (rem === 0) {
          level.value++;
          // レベル100以上では速度を増やさない
          if (level.value <= 100) {
            dx *= 1.1;
            dy *= 1.1;
            // 速度上限を適用
            const s = Math.sqrt(dx * dx + dy * dy);
            if (s > MAX_SPEED) {
              const scale = MAX_SPEED / s;
              dx *= scale;
              dy *= scale;
            }
          }
          emit('update:level', level.value);
          for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
              bricks[c][r].status = 1;
            }
          }
          break;
        }

        // 衝突が発生したら同フレームの残りステップは処理しない
        if (collided) break;
      }
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
  dx = 4;
  dy = -4;
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