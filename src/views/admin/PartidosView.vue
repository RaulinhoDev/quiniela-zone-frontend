<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">PARTIDOS</h1>
        <p class="page-sub">Gestión de partidos por jornada</p>
      </div>
      <button class="btn btn-primary" @click="showModal = true">+ Nuevo Partido</button>
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
        <div class="form-group" style="margin:0;min-width:130px">
          <label>Temporada</label>
          <select v-model="filtroTemporada" @change="filtrarJornadas" :disabled="!selectedComp">
            <option value="">Todas</option>
            <option v-for="t in temporadas" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;min-width:150px">
          <label>Torneo</label>
          <select v-model="filtroTorneo" @change="filtrarJornadas" :disabled="!selectedComp">
            <option value="">Todos</option>
            <option value="Apertura">Apertura</option>
            <option value="Clausura">Clausura</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;flex:1">
          <label>Jornada</label>
          <select v-model="selectedJornada" @change="loadPartidos" :disabled="!jornadasFiltradas.length">
            <option value="">Seleccioná jornada</option>
            <option v-for="j in jornadasFiltradas" :key="j.id" :value="j.id">{{ j.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div v-if="loading" class="loading-state">Cargando partidos...</div>
      <div v-else-if="partidos.length === 0" class="empty-state">
        Seleccioná una jornada para ver sus partidos
      </div>
      <div v-else>
        <div class="card-header">
          <span class="total-badge">{{ partidos.length }} partidos</span>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Local</th>
                <th style="text-align:center">vs</th>
                <th>Visitante</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in partidosPaginados" :key="p.id">
                <td><strong>{{ p.id }}</strong></td>
                <td><strong>{{ p.home_team }}</strong></td>
                <td style="text-align:center;color:var(--text-muted)">vs</td>
                <td><strong>{{ p.away_team }}</strong></td>
                <td>{{ formatDateTime(p.match_date) }}</td>
                <td><span :class="statusBadge(p.status)">{{ statusLabel(p.status) }}</span></td>
                <td>
                  <span v-if="p.home_score !== null" class="score">
                    {{ p.home_score }} — {{ p.away_score }}
                  </span>
                  <span v-else class="text-muted">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AppPaginator
          :total="partidos.length"
          :per-page="perPage"
          :current="currentPage"
          @change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Modal nuevo partido -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">NUEVO PARTIDO</span>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="form-group">
          <label>Competencia</label>
          <select v-model="form.competition_id" @change="loadJornadasForm">
            <option value="">Seleccioná competencia</option>
            <option v-for="c in competencias" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Jornada</label>
          <select v-model="form.matchday_id" :disabled="!jornadasForm.length">
            <option value="">Seleccioná jornada</option>
            <option v-for="j in jornadasForm" :key="j.id" :value="j.id">{{ j.name }}</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Equipo local</label>
            <input v-model="form.home_team" placeholder="Ej: Olimpia" />
          </div>
          <div class="form-group">
            <label>Equipo visitante</label>
            <input v-model="form.away_team" placeholder="Ej: Motagua" />
          </div>
        </div>
        <div class="form-group">
          <label>Fecha y hora del partido</label>
          <input v-model="form.match_date" type="datetime-local" />
        </div>
        <div v-if="formError" class="alert alert-error">{{ formError }}</div>
        <div v-if="formSuccess" class="alert alert-success">{{ formSuccess }}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="createPartido" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Crear Partido' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import AppPaginator from '@/components/AppPaginator.vue'

const competencias      = ref([])
const jornadas          = ref([])
const jornadasFiltradas = ref([])
const jornadasForm      = ref([])
const temporadas        = ref([])
const partidos          = ref([])
const selectedComp      = ref('')
const selectedJornada   = ref('')
const filtroTemporada   = ref('')
const filtroTorneo      = ref('')
const loading           = ref(false)
const showModal         = ref(false)
const saving            = ref(false)
const formError         = ref('')
const formSuccess       = ref('')
const currentPage       = ref(1)
const perPage           = 15

const form = ref({
  competition_id: '',
  matchday_id: '',
  home_team: '',
  away_team: '',
  match_date: ''
})

const partidosPaginados = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return partidos.value.slice(start, start + perPage)
})

onMounted(async () => {
  const res = await api.get('/competitions')
  competencias.value = res.data
})

async function onCompChange() {
  jornadas.value          = []
  jornadasFiltradas.value = []
  temporadas.value        = []
  selectedJornada.value   = ''
  filtroTemporada.value   = ''
  filtroTorneo.value      = ''
  partidos.value          = []
  currentPage.value       = 1
  if (!selectedComp.value) return
  const res = await api.get(`/competitions/${selectedComp.value}/matchdays`)
  jornadas.value = res.data
  const temps = [...new Set(jornadas.value.map(j => j.season).filter(Boolean))]
  temporadas.value = temps.sort((a, b) => b.localeCompare(a))
  filtrarJornadas()
}

function filtrarJornadas() {
  selectedJornada.value = ''
  partidos.value        = []
  currentPage.value     = 1
  let resultado = jornadas.value
  if (filtroTemporada.value) {
    resultado = resultado.filter(j => j.season === filtroTemporada.value)
  }
  if (filtroTorneo.value === 'Otro') {
    resultado = resultado.filter(j =>
      !j.name.startsWith('Apertura') && !j.name.startsWith('Clausura')
    )
  } else if (filtroTorneo.value) {
    resultado = resultado.filter(j => j.name.startsWith(filtroTorneo.value))
  }
  jornadasFiltradas.value = resultado
}

async function loadJornadasForm() {
  jornadasForm.value     = []
  form.value.matchday_id = ''
  if (!form.value.competition_id) return
  const res = await api.get(`/competitions/${form.value.competition_id}/matchdays`)
  jornadasForm.value = res.data
}

async function loadPartidos() {
  if (!selectedJornada.value) { partidos.value = []; return }
  loading.value     = true
  currentPage.value = 1
  try {
    const res = await api.get(`/competitions/matchdays/${selectedJornada.value}`)
    partidos.value = res.data.matches || []
  } finally {
    loading.value = false
  }
}

async function createPartido() {
  formError.value   = ''
  formSuccess.value = ''
  if (!form.value.matchday_id || !form.value.home_team || !form.value.away_team || !form.value.match_date) {
    formError.value = 'Todos los campos son obligatorios'
    return
  }
  saving.value = true
  try {
    await api.post('/competitions/admin/match', {
      matchday_id: form.value.matchday_id,
      home_team:   form.value.home_team,
      away_team:   form.value.away_team,
      match_date:  form.value.match_date
    })
    formSuccess.value = 'Partido creado!'
    await loadPartidos()
    setTimeout(() => { showModal.value = false; formSuccess.value = '' }, 1500)
    form.value = { competition_id: '', matchday_id: '', home_team: '', away_team: '', match_date: '' }
  } catch (e) {
    formError.value = e.response?.data?.message || 'Error al crear el partido'
  } finally {
    saving.value = false
  }
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-HN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function statusLabel(s) {
  const map = { SCHEDULED: 'Programado', LIVE: 'En curso', FINISHED: 'Finalizado', POSTPONED: 'Postpuesto', CANCELLED: 'Cancelado' }
  return map[s] || s
}

function statusBadge(s) {
  const map = { SCHEDULED: 'badge badge-blue', LIVE: 'badge badge-green', FINISHED: 'badge badge-gray', POSTPONED: 'badge badge-yellow', CANCELLED: 'badge badge-red' }
  return map[s] || 'badge badge-gray'
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title  { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.08em; }
.page-sub    { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem; }
.mb-1        { margin-bottom: 1rem; }
.filter-row  { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
.form-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
.score       { font-family: var(--font-display); font-size: 1.1rem; color: var(--accent); letter-spacing: 0.05em; }
.text-muted  { color: var(--text-muted); }
.card-header { display: flex; align-items: center; justify-content: flex-end; margin-bottom: 0.75rem; }
.total-badge { font-size: 0.78rem; color: var(--text-muted); }
</style>