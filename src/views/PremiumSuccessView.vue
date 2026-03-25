<template>
  <div class="auth-page">
    <div class="auth-box" style="text-align:center">
      <div class="success-icon">⭐</div>
      <h1 class="success-title">¡Bienvenido a Premium!</h1>

      <div v-if="verificando" class="verificando">
        <div class="spinner"></div>
        <p class="success-desc">Verificando tu suscripción...</p>
      </div>
      <div v-else>
        <p class="success-desc">Tu suscripción está activa. Ya podés disfrutar de todas las funciones Premium.</p>
        <router-link to="/app/dashboard" class="btn btn-primary btn-block" style="margin-top:1.5rem">
          Ir a mi dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth       = ref(useAuthStore())
const verificando = ref(true)

let intentos  = 0
let intervalo = null

onMounted(() => {
  intervalo = setInterval(async () => {
    await auth.value.refreshUser()
    intentos++

    if (auth.value.user?.is_premium || intentos >= 8) {
      clearInterval(intervalo)
      verificando.value = false
    }
  }, 2000)
})

onUnmounted(() => {
  clearInterval(intervalo)
})
</script>

<style scoped>
.auth-page    { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.auth-box     { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 2.5rem; width: 100%; max-width: 420px; }
.success-icon { font-size: 4rem; margin-bottom: 1rem; }
.success-title{ font-family: var(--font-display); font-size: 1.6rem; letter-spacing: 0.05em; margin-bottom: 0.75rem; color: var(--accent); }
.success-desc { color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; }

.verificando  { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-top: 0.5rem; }
.spinner      {
  width: 28px; height: 28px; border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
