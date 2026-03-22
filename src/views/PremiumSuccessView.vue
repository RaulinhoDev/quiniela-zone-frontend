<template>
  <div class="auth-page">
    <div class="auth-box" style="text-align:center">
      <div class="success-icon">⭐</div>
      <h1 class="success-title">¡Bienvenido a Premium!</h1>
      <p class="success-desc">Tu suscripción está activa. Ya podés disfrutar de todas las funciones Premium.</p>
      <router-link to="/app/dashboard" class="btn btn-primary btn-block" style="margin-top:1.5rem">
        Ir a mi dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(() => {
  // Actualizar el usuario en el store para reflejar Premium
  if (auth.user) {
    auth.user.is_premium = true
    localStorage.setItem('user', JSON.stringify(auth.user))
  }
})
</script>

<style scoped>
.auth-page    { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.auth-box     { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 2.5rem; width: 100%; max-width: 420px; }
.success-icon { font-size: 4rem; margin-bottom: 1rem; }
.success-title{ font-family: var(--font-display); font-size: 1.6rem; letter-spacing: 0.05em; margin-bottom: 0.75rem; color: var(--accent); }
.success-desc { color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; }
</style>
