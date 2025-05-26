//// App.vue /////
import GameCanvas from './components/GameCanvas.vue';
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
/** @type {[typeof GameCanvas, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(GameCanvas, new GameCanvas({
    ballColor: "#FF0000",
    paddleColor: "#00FF00",
    brickColors: (['#F00', '#0F', '#00F', '#FF0']),
    backgroundColor: "#000000",
}));
const __VLS_1 = __VLS_0({
    ballColor: "#FF0000",
    paddleColor: "#00FF00",
    brickColors: (['#F00', '#0F', '#00F', '#FF0']),
    backgroundColor: "#000000",
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            GameCanvas: GameCanvas,
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