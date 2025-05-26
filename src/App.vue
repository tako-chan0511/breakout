//// App.vue /////
<template>
  <div id="app">
    <h1>Vue3＋Vite Breakout Game</h1>
    <GameCanvas
      ball-color="#FF0000"
      paddle-color="#00FF00"
      :brick-colors="['#F00', '#0F', '#00F', '#FF0']"
      background-color="#000000"
    />
  </div>
</template>

<script setup>
import GameCanvas from './components/GameCanvas.vue'
</script>

<style>
#app {
  text-align: center;
  background: #f0f0f0;
  min-height: 100vh;
  margin: 0;
  padding: 1rem;
  box-sizing: border-box;
}
h1 {
  margin-bottom: 1rem;
}
</style>
