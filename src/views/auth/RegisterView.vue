<template>
  <div class="auth-page">
    <div class="auth-box">
      <router-link to="/" class="auth-logo">
        
        <span class="logo-text">QUINIELA ZONE</span>
      </router-link>

      <!-- Formulario de registro -->
      <div v-if="!emailSent">
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
                <option value="CO">🇨🇴 Colombia</option>
                <option value="AR">🇦🇷 Argentina</option>
                <option value="BR">🇧🇷 Brasil</option>
                <option value="US">🇺🇸 USA</option>
                <option value="ES">🇪🇸 España</option>
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

      <!-- Mensaje de verificación enviado -->
      <div v-else class="verify-sent">
        <div class="verify-icon"></div>
        <h2 class="verify-title">¡Revisá tu email!</h2>
        <p class="verify-desc">
          Enviamos un link de verificación a
          <strong>{{ form.email }}</strong>
        </p>
        <p class="verify-hint">
          Hacé clic en el link del email para activar tu cuenta. Si no lo ves, revisá la carpeta de spam.
        </p>
        <div class="auth-footer" style="margin-top:1.5rem">
          ¿Ya verificaste?
          <router-link to="/login" class="auth-link">Iniciá sesión</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router    = useRouter()
const auth      = useAuthStore()
const form      = ref({ username: '', email: '', password: '', full_name: '', country: 'HN' })
const error     = ref('')
const loading   = ref(false)
const emailSent = ref(false)

async function handleRegister() {
  error.value   = ''
  loading.value = true
  try {
    const res = await api.post('/auth/register', form.value)

    // Si el backend devuelve access_token → verificación desactivada → login directo
    if (res.data.access_token) {
      auth.token = res.data.access_token
      auth.user  = res.data.user
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/app/dashboard')
    } else {
      // Verificación activada → mostrar mensaje de "revisá tu email"
      emailSent.value = true
    }
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

.verify-sent { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 0.75rem; }
.verify-icon {
  width: 64px; height: 64px; margin-bottom: 0.5rem;
  background: var(--accent-glow); border: 2px solid rgba(0,229,160,0.3);
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  position: relative;
}
.verify-icon::before {
  content: ''; display: block;
  width: 28px; height: 20px;
  border: 2px solid var(--accent); border-radius: 2px;
}
.verify-icon::after {
  content: ''; position: absolute;
  top: 18px; left: 50%; transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 14px solid transparent; border-right: 14px solid transparent;
  border-top: 10px solid var(--accent);
}
.verify-title{ font-size: 1.4rem; font-weight: 600; color: var(--text-primary); }
.verify-desc { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; }
.verify-hint { color: var(--text-muted); font-size: 0.82rem; line-height: 1.6; }
</style>