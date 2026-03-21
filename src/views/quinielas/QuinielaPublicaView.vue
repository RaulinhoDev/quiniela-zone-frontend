<template>
  <div class="public-page">
    <nav class="pub-nav">
      <router-link to="/" class="pub-logo">⚽ QUINIELA ZONE</router-link>
      <div class="pub-nav-actions">
        <router-link to="/login" class="btn btn-secondary btn-sm">Ingresar</router-link>
        <router-link to="/registro" class="btn btn-primary btn-sm">Registrarse</router-link>
      </div>
    </nav>

    <div class="container page" v-if="data">
      <div class="pub-header">
        <h1 class="pub-title">{{ data.quiniela.name }}</h1>
        <div class="pub-meta">
          {{ data.quiniela.competition }} · {{ data.quiniela.season }}
        </div>
        <span :class="statusBadge(data.quiniela.status)">{{ statusLabel(data.quiniela.status) }}</span>
      </div>

      <!-- CTA para unirse -->
      <div class="join-cta card" v-if="data.quiniela.status === 'ESPERANDO'">
        <div class="join-text">
          <div class="join-title">¿Querés participar?</div>
          <div class="join-desc">Registrate gratis y unite con el código <strong>{{ data.quiniela.invite_code }}</strong></div>
        </div>
        <router-link to="/registro" class="btn btn-primary">Unirme gratis →</router-link>
      </div>

      <!-- Ranking -->
      <div class="card">
        <div class="ranking-header">
          <h2 class="ranking-title">Ranking</h2>
          <span class="ranking-total">{{ data.total_participantes }} participantes</span>
        </div>

        <div class="ranking-list">
          <div v-for="(p, i) in data.ranking" :key="p.user.id" class="ranking-row">
            <div class="rr-rank">
              <span v-if="i === 0">🥇</span>
              <span v-else-if="i === 1">🥈</span>
              <span v-else-if="i === 2">🥉</span>
              <span v-else class="rank-num">{{ i + 1 }}</span>
            </div>
            <div class="rr-user">
              <span class="rr-username">{{ p.user.username }}</span>
              <span>{{ countryFlag(p.user.country) }}</span>
            </div>
            <span class="rr-pts">{{ p.total_points }} pts</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">Cargando...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const data  = ref(null)

onMounted(async () => {
  const res = await api.get(`/quinielas/${route.params.id}/ranking`)
  data.value = res.data
})

function statusLabel(s) {
  return { ESPERANDO: 'Esperando', ACTIVA: 'Activa', FINALIZADA: 'Finalizada' }[s] || s
}
function statusBadge(s) {
  return { ESPERANDO: 'badge badge-blue', ACTIVA: 'badge badge-green', FINALIZADA: 'badge badge-gray' }[s] || 'badge badge-gray'
}
function countryFlag(c) {
  const f = { HN:'🇭🇳', CR:'🇨🇷', GT:'🇬🇹', SV:'🇸🇻', NI:'🇳🇮', PA:'🇵🇦', BZ:'🇧🇿', MX:'🇲🇽', US:'🇺🇸' }
  return f[c] || '🌎'
}
</script>

<style scoped>
.public-page { min-height: 100vh; }
.pub-nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.5rem; border-bottom: 1px solid var(--border);
  background: var(--bg-surface);
}
.pub-logo { font-family: var(--font-display); font-size: 1.1rem; letter-spacing: 0.08em; color: var(--accent); text-decoration: none; }
.pub-nav-actions { display: flex; gap: 0.5rem; }
.pub-header { margin-bottom: 1.5rem; }
.pub-title  { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.04em; margin-bottom: 0.3rem; }
.pub-meta   { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.75rem; }

.join-cta {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  margin-bottom: 1rem; border-color: rgba(0,229,160,0.3);
  background: var(--accent-glow);
}
.join-title { font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; }
.join-desc  { font-size: 0.85rem; color: var(--text-secondary); }

.ranking-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.ranking-title  { font-family: var(--font-display); font-size: 1.3rem; letter-spacing: 0.05em; }
.ranking-total  { font-size: 0.8rem; color: var(--text-muted); }
.ranking-list   { display: flex; flex-direction: column; gap: 0.35rem; }
.ranking-row    { display: flex; align-items: center; gap: 1rem; padding: 0.7rem 1rem; border-radius: var(--radius); background: var(--bg-surface); }
.rr-rank  { width: 30px; text-align: center; font-size: 1.1rem; }
.rank-num { font-family: var(--font-display); color: var(--text-muted); }
.rr-user  { flex: 1; display: flex; align-items: center; gap: 0.5rem; }
.rr-username { font-weight: 500; font-size: 0.92rem; }
.rr-pts   { font-family: var(--font-display); font-size: 1.1rem; color: var(--accent); }
.empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
</style>
