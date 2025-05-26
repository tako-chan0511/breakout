<template>
  <div v-if="show" class="modal-backdrop">
    <div class="modal">
      <h3 class="modal-title">ボールを失いました</h3>
      <p class="modal-text">残り <span class="lives">{{ lives }}</span> 個</p>
      <button class="modal-button" @click="onOk">OK</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{ show: boolean; lives: number }>();
const emit = defineEmits(['restart']);

function onOk() {
  emit('restart');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: #222;
  color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  min-width: 260px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.modal-title {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}
.modal-text {
  font-size: 1rem;
  margin-bottom: 1rem;
}
.lives {
  font-weight: bold;
  color: #FFD700;
}
.modal-button {
  padding: 0.5rem 1rem;
  background: #fff;
  color: #000;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
}
.modal-button:hover {
  background: #eee;
}
</style>
