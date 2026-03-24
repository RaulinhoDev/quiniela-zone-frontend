<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">DASHBOARD</h1>
        <p class="page-sub">{{ fechaHoy }}</p>
      </div>
      <button class="btn btn-secondary btn-sm" @click="loadData" :disabled="loading">
        {{ loading ? 'Cargando...' : '🔄 Actualizar' }}
      </button>
    </div>

    <div v-if="loading && !data" class="loading-state">Cargando métricas...</div>

    <div v-else-if="data">

      <!-- Fila 1: usuarios + quinielas -->
      <div class="metrics-grid">
        <div class="metric-card card accent-green">
          <div class="mc-header">
            <span class="mc-icon">👥</span>
            <span class="mc-trend">+{{ data.metricas.usuariosEstaSemana }} esta semana</span>
          </div>
          <div class="mc-val">{{ data.metricas.totalUsuarios }}</div>
          <div class="mc-lbl">Usuarios registrados</div>
          <div class="mc-bar">
            <div class="mc-bar-item">
              <span class="mc-bar-val accent-gold">{{ data.metricas.usuariosPremium }}</span>
              <span class="mc-bar-lbl">Premium</span>
            </div>
            <div class="mc-bar-sep"></div>
            <div class="mc-bar-item">
              <span class="mc-bar-val">{{ data.metricas.totalUsuarios - data.metricas.usuariosPremium }}</span>
              <span class="mc-bar-lbl">Free</span>
            </div>
            <div class="mc-bar-sep"></div>
            <div class="mc-bar-item">
              <span class="mc-bar-val accent-gold">{{ premiumPct }}%</span>
              <span class="mc-bar-lbl">Conversión</span>
            </div>
          </div>
        </div>

        <div class="metric-card card accent-blue">
          <div class="mc-header">
            <span class="mc-icon">🏆</span>
            <span class="mc-trend">{{ data.metricas.totalParticipantes }} participaciones</span>
          </div>
          <div class="mc-val">{{ data.metricas.totalQuinielas }}</div>
          <div class="mc-lbl">Quinielas creadas</div>
          <div class="mc-bar">
            <div class="mc-bar-item">
              <span class="mc-bar-val accent-green">{{ data.metricas.quinielasActivas }}</span>
              <span class="mc-bar-lbl">Activas</span>
            </div>
            <div class="mc-bar-sep"></div>
            <div class="mc-bar-item">
              <span class="mc-bar-val accent-yellow">{{ data.metricas.quinielasEsperando }}</span>
              <span class="mc-bar-lbl">Esperando</span>
            </div>
            <div class="mc-bar-sep"></div>
            <div class="mc-bar-item">
              <span class="mc-bar-val">{{ data.metricas.quinielasFinalizadas }}</span>
              <span class="mc-bar-lbl">Finalizadas</span>
            </div>
          </div>
        </div>

        <div class="metric-card card accent-yellow">
          <div class="mc-header">
            <span class="mc-icon">⚽</span>
            <span v-if="data.metricas.partidosEnVivo > 0" class="mc-trend live">
              🟢 {{ data.metricas.partidosEnVivo }} en vivo
            </span>
            <span v-else class="mc-trend">Sin partidos en vivo</span>
          </div>
          <div class="mc-val">{{ data.metricas.partidosHoy }}</div>
          <div class="mc-lbl">Partidos hoy</div>
        </div>

        <div class="metric-card card accent-purple">
          <div class="mc-header">
            <span class="mc-icon">📊</span>
            <span class="mc-trend">+{{ data.metricas.prediccionesEstaSemana.toLocaleString() }} esta semana</span>
          </div>
          <div class="mc-val">{{ data.metricas.totalPredicciones.toLocaleString() }}</div>
          <div class="mc-lbl">Predicciones totales</div>
        </div>
      </div>

      <!-- Fila 2: partidos + quinielas recientes -->
      <div class="bottom-grid">
        <div class="card">
          <div class="section-header">
            <h2 class="section-title">Partidos de hoy</h2>
            <router-link to="/admin/resultados" class="section-link">Resultados →</router-link>
          </div>
          <div v-if="!data.partidosHoy.length" class="empty-mini">No hay partidos hoy</div>
          <div v-else class="partidos-list">
            <div v-for="p in data.partidosHoy" :key="p.id" class="partido-row">
              <div class="partido-comp">{{ p.competition }}</div>
              <div class="partido-teams">
                <span class="team">{{ p.home_team }}</span>
                <span class="score" :class="{ live: p.status === 'LIVE' }" v-if="p.home_score !== null">
                  {{ p.home_score }} — {{ p.away_score }}
                </span>
                <span class="score pending" v-else>{{ formatTime(p.match_date) }}</span>
                <span class="team right">{{ p.away_team }}</span>
              </div>
              <span :class="statusBadge(p.status)">{{ statusLabel(p.status) }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-header">
            <h2 class="section-title">Últimas quinielas</h2>
          </div>
          <div v-if="!data.ultimasQuinielas.length" class="empty-mini">Sin quinielas</div>
          <div v-else class="quinielas-list">
            <div v-for="q in data.ultimasQuinielas" :key="q.id" class="quiniela-row">
              <div class="q-info">
                <div class="q-name">{{ q.name }}</div>
                <div class="q-meta">{{ q.competition }} · @{{ q.owner }}</div>
              </div>
              <span :class="statusBadge2(q.status)">{{ statusLabel2(q.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla usuarios recientes -->
      <div class="card" style="margin-top:1rem">
        <div class="section-header">
          <h2 class="section-title">Últimos usuarios registrados</h2>
          <router-link to="/admin/usuarios" class="section-link">Ver todos →</router-link>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>País</th>
                <th>Plan</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in data.ultimosUsuarios" :key="u.id">
                <td class="td-muted">{{ u.id }}</td>
                <td><strong>{{ u.username }}</strong></td>
                <td class="td-muted">{{ u.email }}</td>
                <td>{{ u.country }}</td>
                <td>
                  <span v-if="u.role === 'ADMIN'" class="badge badge-green">Admin</span>
                  <span v-else-if="u.is_premium" class="badge badge-gold">Premium</span>
                  <span v-else class="badge badge-gray">Free</span>
                </td>
                <td class="td-muted">{{ formatDate(u.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const data    = ref(null)
const loading = ref(true)

const fechaHoy = new Date().toLocaleDateString('es-HN', {
  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
})

const premiumPct = computed(() => {
  if (!data.value || !data.value.metricas.totalUsuarios) return 0
  return Math.round((data.value.metricas.usuariosPremium / data.value.metricas.totalUsuarios) * 100)
})

onMounted(async () => await loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await api.get('/admin/dashboard')
    data.value = res.data
  } finally {
    loading.value = false
  }
}

function formatTime(d) {
  if (!d) return 'vs'
  return new Date(d).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function statusLabel(s) {
  return { SCHEDULED: 'Programado', LIVE: 'En vivo', FINISHED: 'Final', POSTPONED: 'Postpuesto', CANCELLED: 'Cancelado' }[s] || s
}
function statusBadge(s) {
  return { SCHEDULED: 'badge badge-blue', LIVE: 'badge badge-green', FINISHED: 'badge badge-gray', POSTPONED: 'badge badge-yellow', CANCELLED: 'badge badge-red' }[s] || 'badge badge-gray'
}
function statusLabel2(s) {
  return { ESPERANDO: 'Esperando', ACTIVA: 'Activa', FINALIZADA: 'Finalizada' }[s] || s
}
function statusBadge2(s) {
  return { ESPERANDO: 'badge badge-blue', ACTIVA: 'badge badge-green', FINALIZADA: 'badge badge-gray' }[s] || 'badge badge-gray'
}
</script>

<style scoped>
.page-header  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title   { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.08em; }
.page-sub     { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem; text-transform: capitalize; }
.loading-state{ text-align: center; padding: 4rem; color: var(--text-muted); }

/* Metric cards */
.metrics-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1rem; margin-bottom: 1rem;
}

.metric-card {
  display: flex; flex-direction: column; gap: 0.4rem;
  border-top: 3px solid transparent;
}
.accent-green  { border-top-color: var(--accent); }
.accent-blue   { border-top-color: #3d9eff; }
.accent-yellow { border-top-color: #f5a623; }
.accent-purple { border-top-color: #a855f7; }

.mc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem; }
.mc-icon   { font-size: 1.3rem; }
.mc-trend  { font-size: 0.72rem; color: var(--text-muted); }
.mc-trend.live { color: var(--accent); font-weight: 600; }

.mc-val  { font-family: var(--font-display); font-size: 2.4rem; color: var(--text-primary); letter-spacing: 0.02em; line-height: 1; }
.mc-lbl  { font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }

.mc-bar { display: flex; gap: 0; background: var(--bg-surface); border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); }
.mc-bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 0.4rem 0.25rem; gap: 0.1rem; }
.mc-bar-sep  { width: 1px; background: var(--border); }
.mc-bar-val  { font-family: var(--font-display); font-size: 1rem; color: var(--text-primary); }
.mc-bar-lbl  { font-size: 0.6rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.mc-bar-val.accent-green { color: var(--accent); }
.mc-bar-val.accent-gold  { color: #f5a623; }
.mc-bar-val.accent-yellow{ color: #f5a623; }

/* Bottom grid */
.bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.section-title  { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
.section-link   { font-size: 0.78rem; color: var(--accent); text-decoration: none; }
.section-link:hover { opacity: 0.8; }

.empty-mini { color: var(--text-muted); font-size: 0.88rem; padding: 1rem 0; }

.partidos-list { display: flex; flex-direction: column; gap: 0.4rem; }
.partido-row   { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.75rem; background: var(--bg-surface); border-radius: var(--radius); }
.partido-comp  { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; min-width: 70px; }
.partido-teams { display: flex; align-items: center; gap: 0.5rem; flex: 1; }
.team          { flex: 1; font-size: 0.82rem; font-weight: 600; color: var(--text-primary); }
.team.right    { text-align: right; }
.score         { font-family: var(--font-display); font-size: 0.95rem; color: var(--accent); letter-spacing: 0.06em; min-width: 50px; text-align: center; }
.score.live    { color: #4ade80; animation: pulse 1.5s infinite; }
.score.pending { color: var(--text-muted); font-size: 0.8rem; font-family: var(--font-body); }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.quinielas-list { display: flex; flex-direction: column; gap: 0.4rem; }
.quiniela-row   { display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.75rem; background: var(--bg-surface); border-radius: var(--radius); }
.q-info  { flex: 1; }
.q-name  { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
.q-meta  { font-size: 0.72rem; color: var(--text-muted); margin-top: 0.1rem; }

.td-muted { color: var(--text-muted); }

.badge-gold {
  background: rgba(245,166,35,0.12); color: #f5a623;
  border: 1px solid rgba(245,166,35,0.3);
  padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700;
}

@media (max-width: 1024px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .metrics-grid { grid-template-columns: 1fr; }
  .bottom-grid  { grid-template-columns: 1fr; }
}
</style>
