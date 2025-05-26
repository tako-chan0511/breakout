//// App.vue /////
<template>
  <div id="app">
    <!-- 短縮タイトル -->
    <h1>Vue3版Breakout</h1>

    <!-- 設定画面 -->
    <div class="settings" :class="{ disabled: started }">
      <label>
        パドル幅:
        <input type="number" v-model.number="paddleWidth" min="20" max="300" />
      </label>
      <label>
        ボールカラー:
        <input type="color" v-model="ballColor" />
      </label>
      <label>
        パドルカラー:
        <input type="color" v-model="paddleColor" />
      </label>
      <button @click="startGame" :disabled="started">
        {{ started ? 'ゲーム中…' : 'ゲームスタート' }}
      </button>
    </div>

    <!-- ゲーム画面 → 常に表示 -->
    <GameCanvas
      :ball-color="ballColor"
      :paddle-color="paddleColor"
      :brick-colors="brickColors"
      :background-color="backgroundColor"
      :paddle-width="paddleWidth"
      :enable-mouse="true"
      :game-active="started"
      @game-over="handleGameOver"
    />

    <!-- ゲームオーバーポップアップ -->
    <div class="popup" v-if="gameOverPopup">
      <div class="popup-content">
        <h2>ゲームオーバー</h2>
        <p>レベル: {{ overLevel }}</p>
        <p>得点: {{ overScore }}</p>
        <button @click="closePopup">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import GameCanvas from './components/GameCanvas.vue';

// 設定用リアクティブ変数
const paddleWidth    = ref(75);
const ballColor      = ref('#FF0000');
const paddleColor    = ref('#00FF00');
const brickColors    = ref(['#F00', '#0F0', '#00F', '#FF0']);
const backgroundColor= ref('#000000');

// ゲーム制御
const started       = ref(false);
const gameOverPopup= ref(false);
const overLevel     = ref(1);
const overScore     = ref(0);

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
</script>

<style>
/* レイアウト調整 */
#app {
  position: relative;
  text-align: center;
  background: #000; /* モバイル含め背景を黒に固定 */
  min-height: 100vh;
  margin: 0;
  padding: 1rem;
  box-sizing: border-box;
  color: #fff; /* テキスト白 */
}

/* 設定エリア */
.settings {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: #222;
  color: #fff;
  padding: 0.5rem;
  border-radius: 8px;
}
.settings.disabled {
  opacity: 0.6;
  pointer-events: none;
}
.settings label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.settings button {
  padding: 0.5rem 1rem;
}

/* ポップアップ */
.popup {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}
.popup-content {
  background: #333;
  color: #fff;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}
.popup-content button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #fff;
  border: none;
  color: #000;
}

/* モバイル専用調整: サイド余白 */
@media (max-width: 600px) {
  #app {
    padding: 0.5rem;
  }
}
</style>