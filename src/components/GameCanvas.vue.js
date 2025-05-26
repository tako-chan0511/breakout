//// GameCanvas.vue /////
import { ref, onMounted, onUnmounted, defineProps } from 'vue';
// Props for customization
const props = defineProps({
    ballColor: { type: String, default: '#0095DD' },
    paddleColor: { type: String, default: '#0095DD' },
    brickColors: { type: Array, default: () => ['#0095DD', '#DD9500', '#95DD00'] },
    backgroundColor: { type: String, default: '#eee' }
});
// Canvas dimensions
const width = 480;
const height = 320;
const canvas = ref(null);
let ctx;
// Game state
let ballX = width / 2;
let ballY = height - 30;
const ballRadius = 10;
let dx = 2;
let dy = -2;
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (width - paddleWidth) / 2;
// Touch state
let lastTouchX = null;
// Score & Level
const score = ref(0);
const level = ref(1);
// Block settings
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
// Keyboard handlers (optional)
function keyDownHandler(e) {
    if (e.key === 'ArrowRight')
        paddleX += 7;
    if (e.key === 'ArrowLeft')
        paddleX -= 7;
    paddleX = Math.max(0, Math.min(paddleX, width - paddleWidth));
}
// Touch handlers: start, move, end
function touchStartHandler(e) {
    lastTouchX = e.touches[0].clientX;
}
function touchMoveHandler(e) {
    if (lastTouchX === null || !canvas.value)
        return;
    const touchX = e.touches[0].clientX;
    const deltaPx = touchX - lastTouchX;
    const rect = canvas.value.getBoundingClientRect();
    // ピクセル差をキャンバス座標に変換
    const scale = width / rect.width;
    paddleX += deltaPx * scale;
    // 境界内に制限
    paddleX = Math.max(0, Math.min(paddleX, width - paddleWidth));
    lastTouchX = touchX;
}
function touchEndHandler() {
    lastTouchX = null;
}
// Drawing utilities
function clearBackground() {
    ctx.fillStyle = props.backgroundColor;
    ctx.fillRect(0, 0, width, height);
}
function drawHUD() {
    ctx.font = '16px Arial';
    ctx.fillStyle = props.ballColor;
    ctx.fillText(`Score: ${score.value}`, 8, 20);
    ctx.fillText(`Level: ${level.value}`, width - 70, 20);
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
    ctx.rect(paddleX, height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = props.paddleColor;
    ctx.fill();
    ctx.closePath();
}
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;
                ctx.beginPath();
                ctx.fillStyle = props.brickColors[r % props.brickColors.length];
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}
function collisionDetection() {
    let remaining = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                remaining++;
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score.value += 10;
                }
            }
        }
    }
    if (remaining === 0) {
        level.value++;
        dx *= 1.2;
        dy *= 1.2;
        for (let c = 0; c < brickColumnCount; c++)
            for (let r = 0; r < brickRowCount; r++)
                bricks[c][r].status = 1;
    }
}
function draw() {
    clearBackground();
    drawHUD();
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();
    if (ballX + dx > width - ballRadius || ballX + dx < ballRadius)
        dx = -dx;
    if (ballY + dy < ballRadius)
        dy = -dy;
    else if (ballY + dy > height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth)
            dy = -dy;
        else {
            document.location.reload();
            return;
        }
    }
    ballX += dx;
    ballY += dy;
    requestAnimationFrame(draw);
}
onMounted(() => {
    if (!canvas.value)
        return;
    ctx = canvas.value.getContext('2d');
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', () => { });
    draw();
});
onUnmounted(() => {
    document.removeEventListener('keydown', keyDownHandler);
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ onTouchstart: (__VLS_ctx.touchStartHandler) },
    ...{ onTouchmove: (__VLS_ctx.touchMoveHandler) },
    ...{ onTouchend: (__VLS_ctx.touchEndHandler) },
    ...{ class: "canvas-container" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
    ref: "canvas",
    width: (__VLS_ctx.width),
    height: (__VLS_ctx.height),
    ...{ class: "game-canvas" },
});
/** @type {typeof __VLS_ctx.canvas} */ ;
/** @type {__VLS_StyleScopedClasses['canvas-container']} */ ;
/** @type {__VLS_StyleScopedClasses['game-canvas']} */ ;
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
        backgroundColor: { type: String, default: '#eee' }
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
        backgroundColor: { type: String, default: '#eee' }
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=GameCanvas.vue.js.map