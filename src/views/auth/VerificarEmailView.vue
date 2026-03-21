<template>
  <div class="auth-page">
    <div class="auth-box">
      <router-link to="/" class="auth-logo">
        <span>⚽</span>
        <span class="logo-text">QUINIELA ZONE</span>
      </router-link>

      <div v-if="loading" class="verify-state">
        <div class="spinner"></div>
        <p>Verificando tu cuenta...</p>
      </div>

      <div v-else-if="success" class="verify-state">
        <div class="verify-icon success">✓</div>
        <h2 class="verify-title">¡Email verificado!</h2>
        <p class="verify-desc">Tu cuenta está activa. Ya podés usar Quiniela Zone.</p>
        <router-link to="/app/dashboard" class="btn btn-primary btn-block" style="margin-top:1.5rem">
          Ir a mi dashboard
        </router-link>
      </div>

      <div v-else class="verify-state">
        <div class="verify-icon error">✕</div>
        <h2 class="verify-title">Link inválido</h2>
        <p class="verify-desc">{{ error }}</p>
        <router-link to="/login" class="btn btn-secondary btn-block" style="margin-top:1.5rem">
          Volver al login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route   = useRoute()
const auth    = useAuthStore()
const loading = ref(true)
const success = ref(false)
const error   = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    error.value = 'Token no encontrado'
    loading.value = false
    return
  }
  try {
    const res = await api.get(`/auth/verify-email?token=${token}`)
    // Guardar token y usuario en el store
    auth.token = res.data.access_token
    auth.user  = res.data.user
    localStorage.setItem('token', res.data.access_token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    success.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'El link expiró o es inválido'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.auth-box {
  background: var(--bg-card); border: 1px solid var(--border-light);
  border-radius: var(--radius-lg); padding: 2.5rem;
  width: 100%; max-width: 420px; box-shadow: var(--shadow);
}
.auth-logo { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; margin-bottom: 2rem; }
.logo-text { font-family: var(--font-display); font-size: 1.2rem; letter-spacing: 0.1em; color: var(--accent); }

.verify-state { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.75rem; }

.spinner {
  width: 48px; height: 48px; border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.verify-icon {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; font-weight: 700;
}
.verify-icon.success { background: var(--accent-glow); color: var(--accent); border: 2px solid rgba(0,229,160,0.3); }
.verify-icon.error   { background: rgba(255,71,87,0.1); color: var(--danger); border: 2px solid rgba(255,71,87,0.3); }

.verify-title { font-size: 1.3rem; font-weight: 600; }
.verify-desc  { color: var(--text-muted); font-size: 0.9rem; }
</style>
