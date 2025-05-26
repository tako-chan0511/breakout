<template>
  <div id="app">
    <!-- 短縮タイトル -->
    <h1>Vue3版ブロック崩し</h1>

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

    <!-- ゲーム画面 -->
    <GameCanvas
      ref="gameCanvas"
      :ball-color="ballColor"
      :paddle-color="paddleColor"
      :brick-colors="brickColors"
      :background-color="backgroundColor"
      :paddle-width="paddleWidth"
      :enable-mouse="true"
      :game-active="started"
      @update:score="overScore = $event"
      @update:lives="overLives = $event"
      @update:level="currentLevel = $event"
      @lost-ball="onLostBall"
      @game-over="handleGameOver"
    />

    <!-- ボール喪失時モーダル -->
    <GameOverModal
      :show="lifeModalVisible"
      :lives="overLives"
      @restart="onRestartBall"
    />

    <!-- ゲームオーバーポップアップ -->
    <div class="popup" v-if="gameOverPopup">
      <div class="popup-content">
        <h2>ゲームオーバー</h2>
        <p>レベル: {{ currentLevel }}</p>
        <p>得点: {{ overScore }}</p>
        <button @click="closePopup">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GameCanvas from './components/GameCanvas.vue';
import GameOverModal from './components/GameOverModal.vue';

// 設定用
const paddleWidth     = ref(75);
const ballColor       = ref('#FF0000');
const paddleColor     = ref('#00FF00');
const brickColors     = ref(['#F00', '#0F0', '#00F', '#FF0']);
const backgroundColor = ref('#000000');

// ステート
const overScore        = ref(0);
const overLives        = ref(3);
const currentLevel     = ref(1);
const gameOverPopup    = ref(false);
const lifeModalVisible = ref(false);
const started          = ref(false);

// 子コンポーネント参照
const gameCanvas = ref<InstanceType<typeof GameCanvas> | null>(null);

function startGame() {
  overScore.value        = 0;
  overLives.value        = 3;
  currentLevel.value     = 1;
  gameOverPopup.value    = false;
  lifeModalVisible.value = false;
  started.value          = true;
}

function onLostBall(lives: number) {
  overLives.value        = lives;
  lifeModalVisible.value = true;
}

function onRestartBall() {
  lifeModalVisible.value = false;
  // GameCanvas.vue の resetBall メソッド呼び出し
  gameCanvas.value?.resetBall();
}

function handleGameOver(payload: { score: number; lives: number }) {
  overScore.value     = payload.score;
  overLives.value     = payload.lives;
  currentLevel.value  = payload.lives; // 必要に応じて調整
  gameOverPopup.value = true;
  started.value       = false;
}

function closePopup() {
  gameOverPopup.value = false;
}
</script>

<style>
#app {
  position: relative;
  text-align: center;
  background: #000;
  color: #fff;
  min-height: 100vh;
  margin: 0;
  padding: 1rem;
  box-sizing: border-box;
}
.settings {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background: #222;
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
  color: #000;
  border: none;
}
</style>