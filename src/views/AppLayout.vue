<template>
  <div class="app-layout">
    <nav class="navbar">
      <div class="container nav-inner">
        <router-link to="/app/dashboard" class="nav-logo">
          <span class="logo-text">QUINIELA ZONE</span>
        </router-link>

        <!-- Desktop links -->
        <div class="nav-links">
          <router-link to="/app/dashboard" class="nav-link">Mis Quinielas</router-link>
          <router-link to="/app/explorar"  class="nav-link">Explorar</router-link>
          <router-link to="/app/perfil"    class="nav-link">Perfil</router-link>
          <router-link to="/app/premium"   class="nav-link" :class="auth.user?.is_premium ? 'premium-active' : 'premium-link'">
            Premium
          </router-link>
          <router-link v-if="auth.user?.role === 'ADMIN'" to="/admin" class="nav-link admin-link">Admin</router-link>
          <button class="btn btn-outline btn-sm" @click="handleLogout">Salir</button>
        </div>

        <!-- Hamburger (móvil) -->
        <button class="hamburger" @click="menuOpen = !menuOpen" :class="{ open: menuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- Menú móvil -->
      <transition name="menu">
        <div class="mobile-menu" v-if="menuOpen" @click="menuOpen = false">
          <router-link to="/app/dashboard" class="mobile-link">Mis Quinielas</router-link>
          <router-link to="/app/explorar"  class="mobile-link">Explorar</router-link>
          <router-link to="/app/perfil"    class="mobile-link">Perfil</router-link>
          <router-link to="/app/premium"   class="mobile-link" :class="auth.user?.is_premium ? 'premium-active' : 'premium-link'">
            Premium
          </router-link>
          <router-link v-if="auth.user?.role === 'ADMIN'" to="/admin" class="mobile-link admin-link">Admin</router-link>
          <button class="mobile-link mobile-logout" @click="handleLogout">Salir</button>
        </div>
      </transition>
    </nav>

    <main class="app-main">
      <div class="container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router   = useRouter()
const auth     = useAuthStore()
const menuOpen = ref(false)

function handleLogout() {
  menuOpen.value = false
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

.nav-logo    { text-decoration: none; }
.logo-text   { font-family: var(--font-display); font-size: 1.15rem; letter-spacing: 0.1em; color: var(--accent); }

/* Desktop */
.nav-links   { display: flex; align-items: center; gap: 1rem; }
.nav-link    { color: var(--text-secondary); text-decoration: none; font-size: 0.88rem; font-weight: 500; transition: color 0.15s; }
.nav-link:hover, .nav-link.router-link-active { color: var(--text-primary); }
.premium-link   { color: var(--accent) !important; font-weight: 600; }
.premium-active { color: var(--accent) !important; font-weight: 600; opacity: 0.75; }
.admin-link     { color: var(--warning, #f0a500) !important; font-size: 0.82rem; }

/* Hamburger */
.hamburger {
  display: none; flex-direction: column; justify-content: center;
  gap: 5px; width: 36px; height: 36px; padding: 6px;
  background: none; border: none; cursor: pointer;
}
.hamburger span {
  display: block; height: 2px; background: var(--text-secondary);
  border-radius: 2px; transition: all 0.2s;
}
.hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Mobile menu */
.mobile-menu {
  display: flex; flex-direction: column;
  background: var(--bg-surface); border-top: 1px solid var(--border);
  padding: 0.5rem 0;
}
.mobile-link {
  display: block; padding: 0.85rem 1.5rem;
  color: var(--text-secondary); text-decoration: none;
  font-size: 0.95rem; font-weight: 500;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s, color 0.15s;
  text-align: left; background: none; border-left: none; border-right: none; border-top: none; cursor: pointer;
  font-family: var(--font-body); width: 100%;
}
.mobile-link:last-child { border-bottom: none; }
.mobile-link:hover { background: var(--bg-card); color: var(--text-primary); }
.mobile-link.router-link-active { color: var(--text-primary); }
.mobile-logout { color: var(--text-muted); }

/* Transición */
.menu-enter-active, .menu-leave-active { transition: opacity 0.15s, transform 0.15s; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-6px); }

.app-main { flex: 1; padding: 2rem 0; }

@media (max-width: 640px) {
  .nav-links  { display: none; }
  .hamburger  { display: flex; }
}
</style>
