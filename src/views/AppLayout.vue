<template>
  <div class="app-layout">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="container nav-inner">
        <router-link to="/app/dashboard" class="nav-logo">
          <span>⚽</span>
          <span class="logo-text">QUINIELA ZONE</span>
        </router-link>

        <div class="nav-links">
          <router-link to="/app/dashboard" class="nav-link">Mis Quinielas</router-link>
          <router-link to="/app/perfil" class="nav-link">Perfil</router-link>

          <!-- Link Premium — distinto si ya es premium o no -->
          <router-link
            v-if="!auth.user?.is_premium"
            to="/app/premium"
            class="nav-link premium-link"
          >
            Premium
          </router-link>
          <router-link
            v-else
            to="/app/premium"
            class="nav-link premium-active"
          >
            Premium
          </router-link>

          <!-- Link Admin solo para ADMIN -->
          <router-link
            v-if="auth.user?.role === 'ADMIN'"
            to="/admin"
            class="nav-link admin-link"
          >
            Admin
          </router-link>

          <button class="btn btn-outline btn-sm" @click="handleLogout">Salir</button>
        </div>
      </div>
    </nav>

    <!-- Contenido -->
    <main class="app-main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

function handleLogout() {
  auth.logout()
  router.push('/')
}
</script>

<style scoped>
.app-layout { min-height: 100vh; display: flex; flex-direction: column; }

.navbar {
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 50;
}

.nav-inner {
  display: flex; align-items: center;
  justify-content: space-between;
  height: 58px;
}

.nav-logo {
  display: flex; align-items: center; gap: 0.5rem;
  text-decoration: none; font-size: 1.1rem;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 1.2rem; letter-spacing: 0.1em;
  color: var(--accent);
}

.nav-links { display: flex; align-items: center; gap: 1rem; }

.nav-link {
  color: var(--text-secondary); text-decoration: none;
  font-size: 0.88rem; font-weight: 500;
  transition: color 0.15s;
}
.nav-link:hover, .nav-link.router-link-active { color: var(--text-primary); }

.premium-link  { color: var(--accent) !important; font-weight: 600; }
.premium-active{ color: var(--accent) !important; font-weight: 600; opacity: 0.8; }
.admin-link    { color: var(--warning, #f0a500) !important; font-size: 0.82rem; }

.app-main { flex: 1; padding: 2rem 0; }
</style>
