<template>
  <div class="page" v-if="data">
    <!-- Header -->
    <div class="h-header">
      <div>
        <router-link :to="`/app/quinielas/${route.params.id}`" class="back-link">← Volver a la quiniela</router-link>
        <h1 class="h-title">Mi Historial</h1>
      </div>
    </div>

    <!-- Stats generales -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-val accent">{{ data.stats.porcentaje }}<span class="stat-unit">%</span></div>
        <div class="stat-label">Aciertos totales</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">{{ data.participante.total_points }}</div>
        <div class="stat-label">Puntos acumulados</div>
      </div>
      <div class="stat-card">
        <div class="stat-val green">{{ data.stats.exactos }}</div>
        <div class="stat-label">Marcadores exactos</div>
      </div>
      <div class="stat-card">
        <div class="stat-val yellow">{{ data.stats.ganador_correcto }}</div>
        <div class="stat-label">Ganador correcto</div>
      </div>
    </div>

    <!-- Jornadas -->
    <div v-for="j in data.jornadas" :key="j.jornada_id" class="card jornada-card">
      <!-- Header jornada -->
      <div class="jornada-header" @click="toggle(j.jornada_id)">
        <div class="jornada-info">
          <span class="jornada-nombre">{{ j.nombre }}</span>
          <span v-if="j.stats.porcentaje !== null" class="jornada-pct"
            :class="pctClass(j.stats.porcentaje)">
            {{ j.stats.porcentaje }}% acierto
          </span>
          <span v-else class="jornada-pct muted">Sin resultados aún</span>
        </div>
        <div class="jornada-right">
          <div class="jornada-mini-stats" v-if="j.stats.jugados > 0">
            <span class="mini-stat green">{{ j.stats.aciertos }} ✓</span>
            <span class="mini-stat muted">{{ j.stats.jugados - j.stats.aciertos }} ✗</span>
          </div>
          <span class="toggle-icon">{{ expanded.has(j.jornada_id) ? '▲' : '▼' }}</span>
        </div>
      </div>

      <!-- Partidos (colapsable) -->
      <div v-if="expanded.has(j.jornada_id)" class="partidos-list">
        <div v-for="p in j.partidos" :key="p.match_id" class="partido-item"
          :class="aciertoClass(p.acierto)">
          <div class="pi-teams">
            <span class="pi-team">{{ p.home_team }}</span>
            <div class="pi-scores">
              <div class="pi-score-block">
                <span class="pi-score-label">Real</span>
                <span class="pi-score" :class="{ pending: !p.resultado }">
                  {{ p.resultado || '—' }}
                </span>
              </div>
              <div class="pi-score-block" v-if="p.prediccion">
                <span class="pi-score-label">Mi pred</span>
                <span class="pi-score pred">{{ p.prediccion.home }}-{{ p.prediccion.away }}</span>
              </div>
              <div class="pi-score-block" v-else>
                <span class="pi-score-label">Mi pred</span>
                <span class="pi-score pending">—</span>
              </div>
            </div>
            <span class="pi-team right">{{ p.away_team }}</span>
          </div>

          <div class="pi-bottom">
            <span class="pi-fecha">{{ formatDateTime(p.match_date) }}</span>
            <div class="pi-result">
              <span v-if="p.acierto === 'exacto'"  class="badge badge-green">Exacto ✓</span>
              <span v-else-if="p.acierto === 'ganador'" class="badge badge-yellow">Ganador ✓</span>
              <span v-else-if="p.acierto === 'fallo'"   class="badge badge-red">Fallo</span>
              <span v-if="p.prediccion && p.resultado" class="pts-badge">
                +{{ p.prediccion.puntos }} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="empty-state page">Cargando historial...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route    = useRoute()
const data     = ref(null)
const expanded = ref(new Set())

onMounted(async () => {
  const res  = await api.get(`/quinielas/${route.params.id}/historial`)
  data.value = res.data
  // Expandir la última jornada con partidos por defecto
  const conPartidos = data.value.jornadas.filter(j => j.partidos.length > 0)
  if (conPartidos.length) expanded.value.add(conPartidos[conPartidos.length - 1].jornada_id)
})

function toggle(id) {
  if (expanded.value.has(id)) expanded.value.delete(id)
  else expanded.value.add(id)
  expanded.value = new Set(expanded.value)
}

function pctClass(pct) {
  if (pct >= 60) return 'green'
  if (pct >= 35) return 'yellow'
  return 'red'
}

function aciertoClass(a) {
  if (a === 'exacto')  return 'item-exacto'
  if (a === 'ganador') return 'item-ganador'
  if (a === 'fallo')   return 'item-fallo'
  return ''
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-HN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.back-link { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; display: block; margin-bottom: 0.5rem; }
.back-link:hover { color: var(--text-primary); }
.h-header { margin-bottom: 1.5rem; }
.h-title  { font-family: var(--font-display); font-size: 1.8rem; letter-spacing: 0.03em; }

/* Stats */
.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem;
  margin-bottom: 1.5rem;
}
@media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

.stat-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 1rem; text-align: center;
}
.stat-val  { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.02em; }
.stat-val.accent { color: var(--accent); }
.stat-val.green  { color: #00e5a0; }
.stat-val.yellow { color: var(--warning); }
.stat-unit { font-size: 1rem; }
.stat-label { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }

/* Jornadas */
.jornada-card  { margin-bottom: 0.75rem; padding: 0; overflow: hidden; }
.jornada-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; cursor: pointer; user-select: none;
  transition: background 0.12s;
}
.jornada-header:hover { background: var(--bg-hover); }
.jornada-info  { display: flex; align-items: center; gap: 0.75rem; }
.jornada-nombre { font-weight: 600; font-size: 0.92rem; }
.jornada-pct   { font-size: 0.78rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; }
.jornada-pct.green  { color: #00e5a0; background: rgba(0,229,160,0.1); }
.jornada-pct.yellow { color: var(--warning); background: rgba(255,165,2,0.1); }
.jornada-pct.red    { color: #ff5e5e; background: rgba(255,94,94,0.1); }
.jornada-pct.muted  { color: var(--text-muted); background: transparent; }
.jornada-right { display: flex; align-items: center; gap: 1rem; }
.jornada-mini-stats { display: flex; gap: 0.5rem; }
.mini-stat { font-size: 0.78rem; font-weight: 600; }
.mini-stat.green { color: #00e5a0; }
.mini-stat.muted { color: var(--text-muted); }
.toggle-icon { color: var(--text-muted); font-size: 0.7rem; }

/* Partidos */
.partidos-list { border-top: 1px solid var(--border); }
.partido-item  {
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid var(--border);
  border-left: 3px solid transparent;
  transition: background 0.1s;
}
.partido-item:last-child { border-bottom: none; }
.item-exacto  { border-left-color: #00e5a0; background: rgba(0,229,160,0.03); }
.item-ganador { border-left-color: var(--warning); background: rgba(255,165,2,0.03); }
.item-fallo   { border-left-color: rgba(255,94,94,0.4); }

.pi-teams  { display: flex; align-items: center; gap: 0.75rem; }
.pi-team   { flex: 1; font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
.pi-team.right { text-align: right; }
.pi-scores { display: flex; gap: 1rem; align-items: center; justify-content: center; min-width: 160px; }
.pi-score-block { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
.pi-score-label { font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.pi-score       { font-family: var(--font-display); font-size: 0.95rem; color: var(--accent); letter-spacing: 0.05em; }
.pi-score.pred  { color: var(--text-secondary); }
.pi-score.pending { color: var(--text-muted); font-family: var(--font-body); font-size: 0.85rem; }

.pi-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 0.4rem; }
.pi-fecha  { font-size: 0.72rem; color: var(--text-muted); }
.pi-result { display: flex; align-items: center; gap: 0.5rem; }
.pts-badge { font-family: var(--font-display); font-size: 0.82rem; color: var(--accent); }

.empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
</style>
