<template>
  <transition name="loader-fade">
    <div v-if="loader.active" class="loader-overlay">
      <div class="loader-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ball"></div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useLoaderStore } from '@/stores/loader'
const loader = useLoaderStore()
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  pointer-events: none;
}

.loader-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  animation: spin 0.7s linear infinite;
}

.spinner-ball {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 0.7s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  50%       { transform: translate(-50%, -50%) scale(0.6); opacity: 0.5; }
}

.loader-fade-enter-active,
.loader-fade-leave-active { transition: opacity 0.2s; }
.loader-fade-enter-from,
.loader-fade-leave-to { opacity: 0; }
</style>
