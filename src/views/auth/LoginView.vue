<template>
  <div class="auth-page">
    <div class="auth-box">
      <router-link to="/" class="auth-logo">
        <span>⚽</span>
        <span class="logo-text">QUINIELA ZONE</span>
      </router-link>

      <h1 class="auth-title">Bienvenido de vuelta</h1>
      <p class="auth-sub">Ingresá a tu cuenta para ver tus quinielas</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="tu@email.com" required />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="form.password" type="password" placeholder="••••••••" required />
        </div>

        <div class="forgot-row">
          <router-link to="/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</router-link>
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <div class="auth-footer">
        ¿No tenés cuenta?
        <router-link to="/registro" class="auth-link">Registrate gratis</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()
const form   = ref({ email: '', password: '' })
const error  = ref('')
const loading= ref(false)

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(form.value.email, form.value.password)
    router.push('/app/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || 'Credenciales inválidas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh; display: flex;
  align-items: center; justify-content: center; padding: 1rem;
}
.auth-box {
  background: var(--bg-card); border: 1px solid var(--border-light);
  border-radius: var(--radius-lg); padding: 2.5rem;
  width: 100%; max-width: 420px; box-shadow: var(--shadow);
}
.auth-logo  { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; margin-bottom: 2rem; }
.logo-text  { font-family: var(--font-display); font-size: 1.2rem; letter-spacing: 0.1em; color: var(--accent); }
.auth-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 0.3rem; }
.auth-sub   { color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.75rem; }
.forgot-row { text-align: right; margin-bottom: 1rem; margin-top: -0.5rem; }
.forgot-link{ color: var(--text-muted); font-size: 0.82rem; text-decoration: none; }
.forgot-link:hover { color: var(--accent); }
.auth-footer{ text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted); }
.auth-link  { color: var(--accent); text-decoration: none; font-weight: 600; margin-left: 0.3rem; }
.auth-link:hover { text-decoration: underline; }
</style>
