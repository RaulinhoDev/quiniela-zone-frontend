<template>
  <div class="auth-page">
    <div class="auth-box">
      <router-link to="/" class="auth-logo">
        
        <span class="logo-text">QUINIELA ZONE</span>
      </router-link>

      <h1 class="auth-title">Nueva contraseña</h1>
      <p class="auth-sub">Ingresá tu nueva contraseña</p>

      <div v-if="!done">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Nueva contraseña</label>
            <input v-model="password" type="password" placeholder="Mínimo 8 caracteres" required minlength="8" />
          </div>
          <div class="form-group">
            <label>Confirmar contraseña</label>
            <input v-model="confirm" type="password" placeholder="Repetí la contraseña" required />
          </div>
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Guardar contraseña' }}
          </button>
        </form>
      </div>

      <div v-else class="done-state">
        <div class="done-icon">✓</div>
        <p class="done-text">Contraseña actualizada correctamente.</p>
        <router-link to="/login" class="btn btn-primary btn-block" style="margin-top:1.5rem">
          Iniciar sesión
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route    = useRoute()
const password = ref('')
const confirm  = ref('')
const loading  = ref(false)
const error    = ref('')
const done     = ref(false)

async function handleSubmit() {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }
  loading.value = true
  try {
    await api.post('/auth/reset-password', {
      token:    route.query.token,
      password: password.value,
    })
    done.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'El link expiró o es inválido'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.auth-box {
  background: var(--bg-card); border: 1px solid var(--border-light);
  border-radius: var(--radius-lg); padding: 2.5rem;
  width: 100%; max-width: 420px; box-shadow: var(--shadow);
}
.auth-logo  { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; margin-bottom: 2rem; }
.logo-text  { font-family: var(--font-display); font-size: 1.2rem; letter-spacing: 0.1em; color: var(--accent); }
.auth-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 0.3rem; }
.auth-sub   { color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.75rem; }

.done-state { text-align: center; padding: 1rem 0; }
.done-icon  {
  width: 64px; height: 64px; border-radius: 50%;
  background: var(--accent-glow); color: var(--accent);
  border: 2px solid rgba(0,229,160,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.8rem; font-weight: 700; margin: 0 auto 1rem;
}
.done-text { color: var(--text-secondary); font-size: 0.9rem; }
</style>
