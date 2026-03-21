<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span>⚽</span>
        <span class="logo-text">QUINIELA ZONE</span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard"  class="nav-item">
          <span class="nav-icon">📊</span> Dashboard
        </router-link>
        <div class="nav-divider"></div>
        <router-link to="/admin/sync"       class="nav-item">
          <span class="nav-icon">🔄</span> Sync API
        </router-link>
        <router-link to="/admin/jornadas"   class="nav-item">
          <span class="nav-icon">📅</span> Jornadas
        </router-link>
        <router-link to="/admin/partidos"   class="nav-item">
          <span class="nav-icon">⚽</span> Partidos
        </router-link>
        <router-link to="/admin/resultados" class="nav-item">
          <span class="nav-icon">🏆</span> Resultados
        </router-link>
        <div class="nav-divider"></div>
        <router-link to="/admin/usuarios"   class="nav-item">
          <span class="nav-icon">👥</span> Usuarios
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div>
            <div class="user-name">{{ auth.user?.username }}</div>
            <div class="user-role">Administrador</div>
          </div>
        </div>
        <button class="btn-logout" @click="handleLogout" title="Cerrar sesión">⏻</button>
      </div>
    </aside>

    <!-- Contenido principal -->
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const router = useRouter()

const userInitial = computed(() =>
  auth.user?.username?.charAt(0).toUpperCase() || 'A'
)

function handleLogout() {
  auth.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

/* ── Sidebar ──────────────────────────────────────────────────── */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  height: 100vh;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 1.5rem;
  margin-bottom: 2rem;
  font-size: 1.2rem;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 1.3rem;
  letter-spacing: 0.1em;
  color: var(--accent);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 0.75rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.9rem;
  border-radius: var(--radius);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 500;
  transition: all 0.15s;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.router-link-active {
  background: var(--accent-glow);
  color: var(--accent);
  border: 1px solid rgba(0,229,160,0.2);
}

.nav-divider {
  height: 1px;
  background: var(--border);
  margin: 0.5rem 0.9rem;
}

.nav-icon { font-size: 1rem; }

/* ── Footer del sidebar ──────────────────────────────────────── */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.user-info { display: flex; align-items: center; gap: 0.65rem; flex: 1; min-width: 0; }

.user-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: var(--accent-glow);
  border: 1px solid rgba(0,229,160,0.3);
  color: var(--accent);
  font-weight: 700;
  font-size: 0.9rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role { font-size: 0.72rem; color: var(--text-muted); }

.btn-logout {
  background: none; border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: var(--radius);
  transition: color 0.15s;
  flex-shrink: 0;
}
.btn-logout:hover { color: var(--danger); }

/* ── Main ─────────────────────────────────────────────────────── */
.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: var(--bg-base);
}
</style>
