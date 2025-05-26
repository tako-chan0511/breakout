import { ref, watch, onMounted, onUnmounted, defineProps, getCurrentInstance } from 'vue';
// Emit 型
const emit = getCurrentInstance().emit;
// Props
const props = defineProps({
    ballColor: { type: String, default: '#0095DD' },
    paddleColor: { type: String, default: '#0095DD' },
    brickColors: { type: Array, default: () => ['#0095DD', '#DD9500', '#95DD00'] },
    backgroundColor: { type: String, default: '#000' },
    paddleWidth: { type: Number, default: 75 },
    enableMouse: { type: Boolean, default: false },
    gameActive: { type: Boolean, default: false }
});
// Canvas サイズ
const width = 480;
const height = 320;
const canvas = ref(null);
let ctx;
// ステート
let ballX = 0;
let ballY = 0;
const ballRadius = 10;
let dx = 0;
let dy = 0;
const paddleHeight = 10;
let paddleX = 0;
let lives = 3;
let gameOver = false;
const score = ref(0);
const level = ref(1);
// ブロック
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;
const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}
// 初期化
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
    bricks.forEach(col => col.forEach(b => b.status = 1));
}
watch(() => props.gameActive, active => {
    if (active)
        initGame();
});
// 入力
const leftPressed = ref(false);
const rightPressed = ref(false);
function keyDownHandler(e) {
    if (!props.gameActive || gameOver)
        return;
    if (e.key === 'ArrowLeft')
        leftPressed.value = true;
    if (e.key === 'ArrowRight')
        rightPressed.value = true;
}
function keyUpHandler(e) {
    if (e.key === 'ArrowLeft')
        leftPressed.value = false;
    if (e.key === 'ArrowRight')
        rightPressed.value = false;
}
let lastTouchX = null;
function touchStartHandler(e) {
    lastTouchX = e.touches[0].clientX;
}
function touchMoveHandler(e) {
    if (!props.gameActive || gameOver || lastTouchX === null || !canvas.value)
        return;
    const tx = e.touches[0].clientX;
    const delta = (tx - lastTouchX) * (width / canvas.value.getBoundingClientRect().width);
    paddleX = Math.max(0, Math.min(paddleX + delta, width - props.paddleWidth));
    lastTouchX = tx;
}
function touchEndHandler() {
    lastTouchX = null;
}
// 描画
function clearBackground() {
    ctx.fillStyle = props.backgroundColor;
    ctx.fillRect(0, 0, width, height);
}
function drawHUD() {
    ctx.font = '16px Arial';
    ctx.fillStyle = props.ballColor;
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
    ctx.fillStyle = props.ballColor;
    ctx.fill();
    ctx.closePath();
}
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, height - paddleHeight, props.paddleWidth, paddleHeight);
    ctx.fillStyle = props.paddleColor;
    ctx.fill();
    ctx.closePath();
}
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status !== 1)
                continue;
            const x = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const y = r * (brickHeight + brickPadding) + brickOffsetTop;
            b.x = x;
            b.y = y;
            ctx.beginPath();
            ctx.fillStyle = props.brickColors[r % props.brickColors.length];
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
        bricks.forEach(col => col.forEach(b => b.status = 1));
    }
}
function drawLoop() {
    clearBackground();
    drawHUD();
    drawBricks();
    drawPaddle();
    drawBall();
    if (props.gameActive && !gameOver) {
        if (leftPressed.value)
            paddleX = Math.max(0, paddleX - 7);
        if (rightPressed.value)
            paddleX = Math.min(width - props.paddleWidth, paddleX + 7);
        collisionDetection();
        if (ballX + dx > width - ballRadius || ballX + dx < ballRadius)
            dx = -dx;
        if (ballY + dy < ballRadius)
            dy = -dy;
        else if (ballY + dy > height - ballRadius) {
            if (ballX > paddleX && ballX < paddleX + props.paddleWidth) {
                dy = -dy;
            }
            else {
                lives--;
                emit('update:lives', lives);
                if (lives > 0) {
                    if (window.confirm(`ボールを失いました。残り${lives}個。OKで再スタート`)) {
                        ballX = width / 2;
                        ballY = height - paddleHeight - ballRadius;
                        dx = 2;
                        dy = -2;
                    }
                    else {
                        gameOver = true;
                        emit('game-over', { score: score.value, lives: lives });
                    }
                }
                else {
                    gameOver = true;
                    emit('game-over', { score: score.value, lives: lives });
                }
            }
        }
        ballX += dx;
        ballY += dy;
    }
    requestAnimationFrame(drawLoop);
}
onMounted(() => {
    if (!canvas.value)
        return;
    ctx = canvas.value.getContext('2d');
    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    canvas.value.addEventListener('touchstart', touchStartHandler);
    canvas.value.addEventListener('touchmove', touchMoveHandler);
    canvas.value.addEventListener('touchend', touchEndHandler);
    drawLoop();
});
onUnmounted(() => {
    window.removeEventListener('keydown', keyDownHandler);
    window.removeEventListener('keyup', keyUpHandler);
    canvas.value?.removeEventListener('touchstart', touchStartHandler);
    canvas.value?.removeEventListener('touchmove', touchMoveHandler);
    canvas.value?.removeEventListener('touchend', touchEndHandler);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "canvas-wrapper" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    ref: "canvas",
    width: (__VLS_ctx.width),
    height: (__VLS_ctx.height),
    ...{ class: "game-canvas" },
});
/** @type {typeof __VLS_ctx.canvas} */ ;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onTouchstart: (__VLS_ctx.touchStartHandler) },
    ...{ onTouchmove: (__VLS_ctx.touchMoveHandler) },
    ...{ onTouchend: (__VLS_ctx.touchEndHandler) },
    ...{ class: "swipe-area" },
});
/** @type {__VLS_StyleScopedClasses['canvas-wrapper']} */ ;
/** @type {__VLS_StyleScopedClasses['game-canvas']} */ ;
/** @type {__VLS_StyleScopedClasses['swipe-area']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            width: width,
            height: height,
            canvas: canvas,
            touchStartHandler: touchStartHandler,
            touchMoveHandler: touchMoveHandler,
            touchEndHandler: touchEndHandler,
        };
    },
    props: {
        ballColor: { type: String, default: '#0095DD' },
        paddleColor: { type: String, default: '#0095DD' },
        brickColors: { type: Array, default: () => ['#0095DD', '#DD9500', '#95DD00'] },
        backgroundColor: { type: String, default: '#000' },
        paddleWidth: { type: Number, default: 75 },
        enableMouse: { type: Boolean, default: false },
        gameActive: { type: Boolean, default: false }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        ballColor: { type: String, default: '#0095DD' },
        paddleColor: { type: String, default: '#0095DD' },
        brickColors: { type: Array, default: () => ['#0095DD', '#DD9500', '#95DD00'] },
        backgroundColor: { type: String, default: '#000' },
        paddleWidth: { type: Number, default: 75 },
        enableMouse: { type: Boolean, default: false },
        gameActive: { type: Boolean, default: false }
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=GameCanvas.vue.js.map