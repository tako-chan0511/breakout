//// App.vue /////
import { ref } from 'vue';
import GameCanvas from './components/GameCanvas.vue';
// 設定用リアクティブ変数
const paddleWidth = ref(75);
const ballColor = ref('#FF0000');
const paddleColor = ref('#00FF00');
const brickColors = ref(['#F00', '#0F0', '#00F', '#FF0']);
const backgroundColor = ref('#000000');
// ゲーム制御
const started = ref(false);
const gameOverPopup = ref(false);
const overLevel = ref(1);
const overScore = ref(0);
function startGame() {
    started.value = true;
    gameOverPopup.value = false;
}
function handleGameOver(payload) {
    overLevel.value = payload.level;
    overScore.value = payload.score;
    gameOverPopup.value = true;
}
// ポップアップOKで終了状態へ
function closePopup() {
    gameOverPopup.value = false;
    started.value = false;
}
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    id: "app",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.h1, __VLS_intrinsicElements.h1)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "settings" },
    ...{ class: ({ disabled: __VLS_ctx.started }) },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "number",
    min: "20",
    max: "300",
});
(__VLS_ctx.paddleWidth);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "color",
});
(__VLS_ctx.ballColor);
__VLS_asFunctionalElement(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    type: "color",
});
(__VLS_ctx.paddleColor);
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.startGame) },
    disabled: (__VLS_ctx.started),
});
(__VLS_ctx.started ? 'ゲーム中…' : 'ゲームスタート');
/** @type {[typeof GameCanvas, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(GameCanvas, new GameCanvas({
    ...{ 'onGameOver': {} },
    ballColor: (__VLS_ctx.ballColor),
    paddleColor: (__VLS_ctx.paddleColor),
    brickColors: (__VLS_ctx.brickColors),
    backgroundColor: (__VLS_ctx.backgroundColor),
    paddleWidth: (__VLS_ctx.paddleWidth),
    enableMouse: (true),
    gameActive: (__VLS_ctx.started),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onGameOver': {} },
    ballColor: (__VLS_ctx.ballColor),
    paddleColor: (__VLS_ctx.paddleColor),
    brickColors: (__VLS_ctx.brickColors),
    backgroundColor: (__VLS_ctx.backgroundColor),
    paddleWidth: (__VLS_ctx.paddleWidth),
    enableMouse: (true),
    gameActive: (__VLS_ctx.started),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onGameOver: (__VLS_ctx.handleGameOver)
};
var __VLS_2;
if (__VLS_ctx.gameOverPopup) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "popup-content" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({});
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.overLevel);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({});
    (__VLS_ctx.overScore);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.closePopup) },
    });
}
/** @type {__VLS_StyleScopedClasses['settings']} */ ;
/** @type {__VLS_StyleScopedClasses['disabled']} */ ;
/** @type {__VLS_StyleScopedClasses['popup']} */ ;
/** @type {__VLS_StyleScopedClasses['popup-content']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            GameCanvas: GameCanvas,
            paddleWidth: paddleWidth,
            ballColor: ballColor,
            paddleColor: paddleColor,
            brickColors: brickColors,
            backgroundColor: backgroundColor,
            started: started,
            gameOverPopup: gameOverPopup,
            overLevel: overLevel,
            overScore: overScore,
            startGame: startGame,
            handleGameOver: handleGameOver,
            closePopup: closePopup,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=App.vue.js.map