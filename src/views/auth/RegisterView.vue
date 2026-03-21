<template>
  <div class="auth-page">
    <div class="auth-box">
      <router-link to="/" class="auth-logo">
        <span>⚽</span>
        <span class="logo-text">QUINIELA ZONE</span>
      </router-link>

      <h1 class="auth-title">Crear cuenta</h1>
      <p class="auth-sub">Gratis. Sin tarjeta. En 1 minuto.</p>

      <form @submit.prevent="handleRegister">
        <div class="form-row">
          <div class="form-group">
            <label>Username</label>
            <input v-model="form.username" placeholder="carlos_hn" required />
          </div>
          <div class="form-group">
            <label>País</label>
            <select v-model="form.country">
              <option value="HN">🇭🇳 Honduras</option>
              <option value="CR">🇨🇷 Costa Rica</option>
              <option value="GT">🇬🇹 Guatemala</option>
              <option value="SV">🇸🇻 El Salvador</option>
              <option value="NI">🇳🇮 Nicaragua</option>
              <option value="PA">🇵🇦 Panamá</option>
              <option value="BZ">🇧🇿 Belice</option>
              <option value="MX">🇲🇽 México</option>
              <option value="US">🇺🇸 USA</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Nombre completo</label>
          <input v-model="form.full_name" placeholder="Carlos López" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" placeholder="tu@email.com" required />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="form.password" type="password" placeholder="Mínimo 8 caracteres" required minlength="8" />
        </div>

        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? 'Creando cuenta...' : 'Crear cuenta gratis' }}
        </button>
      </form>

      <div class="auth-footer">
        ¿Ya tenés cuenta?
        <router-link to="/login" class="auth-link">Iniciá sesión</router-link>
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
const form   = ref({ username: '', email: '', password: '', full_name: '', country: 'HN' })
const error  = ref('')
const loading= ref(false)

async function handleRegister() {
  error.value   = ''
  loading.value = true
  try {
    await auth.register(form.value)
    router.push('/app/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al crear la cuenta'
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
  width: 100%; max-width: 460px; box-shadow: var(--shadow);
}
.auth-logo  { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; margin-bottom: 2rem; }
.logo-text  { font-family: var(--font-display); font-size: 1.2rem; letter-spacing: 0.1em; color: var(--accent); }
.auth-title { font-size: 1.4rem; font-weight: 600; margin-bottom: 0.3rem; }
.auth-sub   { color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.75rem; }
.form-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.auth-footer{ text-align: center; margin-top: 1.5rem; font-size: 0.88rem; color: var(--text-muted); }
.auth-link  { color: var(--accent); text-decoration: none; font-weight: 600; margin-left: 0.3rem; }
</style>
