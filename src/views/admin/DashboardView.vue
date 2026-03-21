<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">DASHBOARD</h1>
        <p class="page-sub">Métricas y estado del sistema — {{ fechaHoy }}</p>
      </div>
      <button class="btn btn-secondary btn-sm" @click="loadData">🔄 Actualizar</button>
    </div>

    <div v-if="loading" class="loading-state">Cargando métricas...</div>

    <div v-else>
      <!-- Métricas principales -->
      <div class="metrics-grid">
        <div class="metric-card card">
          <div class="metric-icon">👥</div>
          <div class="metric-val">{{ data.metricas.totalUsuarios }}</div>
          <div class="metric-lbl">Usuarios totales</div>
          <div class="metric-sub">+{{ data.metricas.usuariosEstaSemana }} esta semana</div>
        </div>
        <div class="metric-card card">
          <div class="metric-icon">🏆</div>
          <div class="metric-val">{{ data.metricas.totalQuinielas }}</div>
          <div class="metric-lbl">Quinielas creadas</div>
          <div class="metric-sub">{{ data.metricas.quinielasActivas }} activas · {{ data.metricas.quinielasEsperando }} esperando</div>
        </div>
        <div class="metric-card card">
          <div class="metric-icon">⚽</div>
          <div class="metric-val">{{ data.metricas.partidosHoy }}</div>
          <div class="metric-lbl">Partidos hoy</div>
          <div class="metric-sub">
            <span v-if="data.metricas.partidosEnVivo > 0" class="live-badge">
              🟢 {{ data.metricas.partidosEnVivo }} en vivo
            </span>
            <span v-else>Ninguno en vivo</span>
          </div>
        </div>
        <div class="metric-card card">
          <div class="metric-icon">📊</div>
          <div class="metric-val">{{ data.metricas.totalPredicciones.toLocaleString() }}</div>
          <div class="metric-lbl">Predicciones totales</div>
          <div class="metric-sub">En toda la plataforma</div>
        </div>
      </div>

      <div class="bottom-grid">
        <!-- Partidos de hoy -->
        <div class="card">
          <h2 class="section-title">Partidos de hoy</h2>
          <div v-if="!data.partidosHoy.length" class="empty-mini">No hay partidos hoy</div>
          <div v-else class="partidos-list">
            <div v-for="p in data.partidosHoy" :key="p.id" class="partido-row">
              <div class="partido-comp">{{ p.competition }}</div>
              <div class="partido-teams">
                <span class="team">{{ p.home_team }}</span>
                <span class="score" v-if="p.home_score !== null">
                  {{ p.home_score }} — {{ p.away_score }}
                </span>
                <span class="score pending" v-else>vs</span>
                <span class="team">{{ p.away_team }}</span>
              </div>
              <div class="partido-time">
                <span :class="statusBadge(p.status)">{{ statusLabel(p.status) }}</span>
                <span class="match-time">{{ formatTime(p.match_date) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Últimas quinielas -->
        <div class="card">
          <h2 class="section-title">Últimas quinielas creadas</h2>
          <div v-if="!data.ultimasQuinielas.length" class="empty-mini">Sin quinielas</div>
          <div v-else class="quinielas-list">
            <div v-for="q in data.ultimasQuinielas" :key="q.id" class="quiniela-row">
              <div class="q-info">
                <div class="q-name">{{ q.name }}</div>
                <div class="q-meta">{{ q.competition }} · por {{ q.owner }}</div>
              </div>
              <span :class="statusBadge2(q.status)">{{ statusLabel2(q.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Últimos usuarios -->
      <div class="card" style="margin-top:1rem">
        <h2 class="section-title">Últimos usuarios registrados</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Email</th>
                <th>País</th>
                <th>Rol</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in data.ultimosUsuarios" :key="u.id">
                <td>{{ u.id }}</td>
                <td><strong>{{ u.username }}</strong></td>
                <td>{{ u.email }}</td>
                <td>{{ u.country }}</td>
                <td><span :class="u.role === 'ADMIN' ? 'badge badge-green' : 'badge badge-blue'">{{ u.role }}</span></td>
                <td>{{ formatDate(u.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const data    = ref(null)
const loading = ref(true)

const fechaHoy = new Date().toLocaleDateString('es-HN', {
  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
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
  if (!d) return '—'
  return new Date(d).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel(s) {
  return { SCHEDULED: 'Programado', LIVE: 'En vivo', FINISHED: 'Finalizado', POSTPONED: 'Postpuesto', CANCELLED: 'Cancelado' }[s] || s
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
.section-title{ font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem; }
.empty-mini   { color: var(--text-muted); font-size: 0.88rem; padding: 1rem 0; }

.metrics-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1rem; margin-bottom: 1rem;
}

.metric-card  { display: flex; flex-direction: column; gap: 0.3rem; }
.metric-icon  { font-size: 1.5rem; margin-bottom: 0.25rem; }
.metric-val   { font-family: var(--font-display); font-size: 2.2rem; color: var(--accent); letter-spacing: 0.03em; }
.metric-lbl   { font-weight: 600; font-size: 0.88rem; color: var(--text-primary); }
.metric-sub   { font-size: 0.78rem; color: var(--text-muted); }
.live-badge   { color: var(--accent); font-weight: 600; }

.bottom-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.partidos-list { display: flex; flex-direction: column; gap: 0.5rem; }
.partido-row   { display: flex; flex-direction: column; gap: 0.25rem; padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius); }
.partido-comp  { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.partido-teams { display: flex; align-items: center; gap: 0.75rem; }
.team          { flex: 1; font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
.team:last-child { text-align: right; }
.score         { font-family: var(--font-display); font-size: 1.1rem; color: var(--accent); letter-spacing: 0.08em; }
.score.pending { color: var(--text-muted); font-size: 0.85rem; font-family: var(--font-body); }
.partido-time  { display: flex; align-items: center; gap: 0.5rem; }
.match-time    { font-size: 0.75rem; color: var(--text-muted); margin-left: auto; }

.quinielas-list { display: flex; flex-direction: column; gap: 0.5rem; }
.quiniela-row   { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius); }
.q-name  { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
.q-meta  { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem; }
</style>
