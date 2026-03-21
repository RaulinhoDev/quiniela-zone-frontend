<template>
  <div class="auth-page">
    <div class="auth-box">
      <router-link to="/" class="auth-logo">
        <span>⚽</span>
        <span class="logo-text">QUINIELA ZONE</span>
      </router-link>

      <h1 class="auth-title">Olvidé mi contraseña</h1>
      <p class="auth-sub">Ingresá tu email y te mandamos un link para restablecer tu contraseña</p>

      <div v-if="!sent">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Email</label>
            <input v-model="email" type="email" placeholder="tu@email.com" required />
          </div>
          <div v-if="error" class="alert alert-error">{{ error }}</div>
          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? 'Enviando...' : 'Enviar link' }}
          </button>
        </form>
      </div>

      <div v-else class="sent-state">
        <div class="sent-icon">📧</div>
        <p class="sent-text">Si ese email existe en nuestra base de datos, recibirás un link en los próximos minutos.</p>
      </div>

      <div class="auth-footer">
        <router-link to="/login" class="auth-link">← Volver al login</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'

const email   = ref('')
const loading = ref(false)
const error   = ref('')
const sent    = ref(false)

async function handleSubmit() {
  error.value   = ''
  loading.value = true
  try {
    await api.post('/auth/forgot-password', { email: email.value })
    sent.value = true
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al enviar el email'
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
.auth-sub   { color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.75rem; line-height: 1.5; }
.auth-footer{ text-align: center; margin-top: 1.5rem; }
.auth-link  { color: var(--accent); text-decoration: none; font-size: 0.88rem; font-weight: 600; }

.sent-state { text-align: center; padding: 1rem 0; }
.sent-icon  { font-size: 3rem; margin-bottom: 1rem; }
.sent-text  { color: var(--text-secondary); line-height: 1.6; font-size: 0.9rem; }
</style>
