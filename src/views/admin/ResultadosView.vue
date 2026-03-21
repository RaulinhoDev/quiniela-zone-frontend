<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">RESULTADOS</h1>
        <p class="page-sub">Ingresar resultados de partidos finalizados</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card mb-1">
      <div class="filter-row">
        <div class="form-group" style="margin:0;flex:1">
          <label>Competencia</label>
          <select v-model="selectedComp" @change="onCompChange">
            <option value="">Seleccioná competencia</option>
            <option v-for="c in competencias" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;flex:1">
          <label>Jornada</label>
          <select v-model="selectedJornada" @change="loadPartidos" :disabled="!jornadas.length">
            <option value="">Seleccioná jornada</option>
            <option v-for="j in jornadas" :key="j.id" :value="j.id">{{ j.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Partidos pendientes de resultado -->
    <div class="card">
      <div v-if="loading" class="loading-state">Cargando partidos...</div>
      <div v-else-if="partidos.length === 0" class="empty-state">
        Seleccioná una jornada para ver sus partidos
      </div>
      <div v-else>
        <div
          v-for="p in partidos"
          :key="p.id"
          class="match-row"
          :class="{ 'match-done': p.status === 'FINISHED' }"
        >
          <div class="match-info">
            <span class="match-date">{{ formatDateTime(p.match_date) }}</span>
            <span :class="statusBadge(p.status)">{{ statusLabel(p.status) }}</span>
          </div>

          <div class="match-teams">
            <span class="team home">{{ p.home_team }}</span>

            <!-- Resultado ya ingresado -->
            <div v-if="p.status === 'FINISHED'" class="score-display">
              {{ p.home_score }} — {{ p.away_score }}
            </div>

            <!-- Formulario para ingresar resultado -->
            <div v-else class="score-form">
              <input
                v-model.number="resultados[p.id].home"
                type="number" min="0" max="20"
                class="score-input"
                placeholder="0"
              />
              <span class="score-sep">—</span>
              <input
                v-model.number="resultados[p.id].away"
                type="number" min="0" max="20"
                class="score-input"
                placeholder="0"
              />
            </div>

            <span class="team away">{{ p.away_team }}</span>
          </div>

          <div class="match-actions">
            <button
              v-if="p.status !== 'FINISHED'"
              class="btn btn-primary btn-sm"
              @click="guardarResultado(p)"
              :disabled="saving === p.id"
            >
              {{ saving === p.id ? 'Guardando...' : 'Guardar' }}
            </button>
            <span v-else class="saved-label">✓ Guardado</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de éxito -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const competencias    = ref([])
const jornadas        = ref([])
const partidos        = ref([])
const resultados      = ref({})
const selectedComp    = ref('')
const selectedJornada = ref('')
const loading         = ref(false)
const saving          = ref(null)
const toast           = ref('')

onMounted(async () => {
  const res = await api.get('/competitions')
  competencias.value = res.data
})

async function onCompChange() {
  jornadas.value = []
  selectedJornada.value = ''
  partidos.value = []
  if (!selectedComp.value) return
  const res = await api.get(`/competitions/${selectedComp.value}/matchdays`)
  jornadas.value = res.data
}

async function loadPartidos() {
  if (!selectedJornada.value) { partidos.value = []; return }
  loading.value = true
  try {
    const res = await api.get(`/competitions/matchdays/${selectedJornada.value}`)
    partidos.value = res.data.matches || []
    // Inicializar formulario de resultados
    resultados.value = {}
    for (const p of partidos.value) {
      resultados.value[p.id] = { home: '', away: '' }
    }
  } finally {
    loading.value = false
  }
}

async function guardarResultado(partido) {
  const r = resultados.value[partido.id]
  if (r.home === '' || r.away === '') {
    showToast('Ingresá ambos valores')
    return
  }
  saving.value = partido.id
  try {
    await api.post(`/competitions/admin/match/${partido.id}/result`, {
      home_score: r.home,
      away_score: r.away
    })
    // Actualizar localmente
    const idx = partidos.value.findIndex(p => p.id === partido.id)
    if (idx !== -1) {
      partidos.value[idx].status     = 'FINISHED'
      partidos.value[idx].home_score = r.home
      partidos.value[idx].away_score = r.away
    }
    showToast(`✓ ${partido.home_team} ${r.home} — ${r.away} ${partido.away_team}`)
  } catch (e) {
    showToast('Error al guardar resultado')
  } finally {
    saving.value = null
  }
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-HN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function statusLabel(s) {
  const map = { SCHEDULED: 'Programado', LIVE: 'En curso', FINISHED: 'Finalizado', POSTPONED: 'Postpuesto' }
  return map[s] || s
}

function statusBadge(s) {
  const map = { SCHEDULED: 'badge badge-blue', LIVE: 'badge badge-green', FINISHED: 'badge badge-gray', POSTPONED: 'badge badge-yellow' }
  return map[s] || 'badge badge-gray'
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title  { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.08em; }
.page-sub    { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem; }
.mb-1        { margin-bottom: 1rem; }
.filter-row  { display: flex; gap: 1rem; }
.loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }

.match-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--border);
}
.match-row:last-child { border-bottom: none; }
.match-done { opacity: 0.6; }

.match-info  { display: flex; flex-direction: column; gap: 0.3rem; min-width: 140px; }
.match-date  { font-size: 0.8rem; color: var(--text-muted); }

.match-teams {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.team { font-weight: 600; color: var(--text-primary); min-width: 120px; }
.team.home { text-align: right; }
.team.away { text-align: left; }

.score-display {
  font-family: var(--font-display);
  font-size: 1.6rem;
  color: var(--accent);
  letter-spacing: 0.08em;
  min-width: 80px;
  text-align: center;
}

.score-form {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-input {
  width: 52px;
  text-align: center;
  font-family: var(--font-display);
  font-size: 1.4rem;
  padding: 0.3rem;
}

.score-sep { color: var(--text-muted); font-size: 1.2rem; }

.match-actions { min-width: 110px; text-align: right; }
.saved-label { color: var(--accent); font-size: 0.85rem; font-weight: 600; }

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 0.85rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 600;
  box-shadow: var(--shadow);
  z-index: 999;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>
