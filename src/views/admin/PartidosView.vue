<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">PARTIDOS</h1>
        <p class="page-sub">Gestión de partidos por jornada</p>
      </div>
      <button class="btn btn-primary" @click="abrirModal">+ Agregar Partidos</button>
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
            <option value="Único">Único</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div class="form-group" style="margin:0;min-width:150px">
          <label>Jornada</label>
          <select v-model="filtroJornada" @change="filtrarPorJornada" :disabled="!jornadasFiltradas.length">
            <option value="">Todas</option>
            <option v-for="j in jornadasFiltradas" :key="j.id" :value="j.id">{{ j.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div v-if="loading" class="loading-state">Cargando partidos...</div>
      <div v-else-if="partidosFiltrados.length === 0" class="empty-state">
        Seleccioná una competencia para ver sus partidos
      </div>
      <div v-else>
        <div class="card-header">
          <span class="total-badge">{{ partidosFiltrados.length }} partidos</span>
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
          :total="partidosFiltrados.length"
          :per-page="perPage"
          :current="currentPage"
          @change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Modal agregar partidos en lote -->
    <div v-if="showModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal modal-lg">
        <div class="modal-header">
          <span class="modal-title">AGREGAR PARTIDOS</span>
          <button class="modal-close" @click="cerrarModal">✕</button>
        </div>

        <div class="form-group">
          <label>Competencia</label>
          <select v-model="form.competition_id" @change="onFormCompChange">
            <option value="">Seleccioná competencia</option>
            <option v-for="c in competencias" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div class="form-group" v-if="form.competition_id">
          <label>Temporada</label>
          <select v-model="form.season" @change="onFormSeasonChange" :disabled="!temporadasForm.length">
            <option value="">Seleccioná temporada</option>
            <option v-for="t in temporadasForm" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="form-group" v-if="form.season">
          <label>Torneo</label>
          <select v-model="form.torneo" @change="onFormTorneoChange" :disabled="!torneosForm.length">
            <option value="">Seleccioná torneo</option>
            <option v-for="t in torneosForm" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <div class="form-group" v-if="form.torneo">
          <label>Jornada</label>
          <select v-model="form.matchday_id" :disabled="!jornadasForm.length">
            <option value="">Seleccioná jornada</option>
            <option v-for="j in jornadasForm" :key="j.id" :value="j.id">{{ j.name }}</option>
          </select>
        </div>

        <div v-if="form.matchday_id" class="partidos-form">
          <div class="partidos-form-header">
            <span class="section-label">Partidos</span>
            <button type="button" class="btn btn-secondary btn-sm" @click="agregarFila">
              + Agregar partido
            </button>
          </div>
          <div class="partido-fila-header">
            <span>Local</span>
            <span>Visitante</span>
            <span>Fecha y hora</span>
            <span></span>
          </div>
          <div v-for="(p, i) in listaPartidos" :key="i" class="partido-fila">
            <input v-model="p.home_team" placeholder="Equipo local" />
            <input v-model="p.away_team" placeholder="Equipo visitante" />
            <input v-model="p.match_date" type="datetime-local" />
            <button type="button" class="btn-remove" @click="removerFila(i)" :disabled="listaPartidos.length === 1">✕</button>
          </div>
        </div>

        <div v-if="formError"   class="alert alert-error">{{ formError }}</div>
        <div v-if="formSuccess" class="alert alert-success">{{ formSuccess }}</div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primary" @click="guardarPartidos" :disabled="saving">
            {{ saving ? 'Guardando...' : `Guardar ${listaPartidos.length} partido${listaPartidos.length > 1 ? 's' : ''}` }}
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
const temporadasForm    = ref([])
const torneosForm       = ref([])
const partidos          = ref([])
const partidosFiltrados = ref([])
const selectedComp      = ref('')
const filtroTemporada   = ref('')
const filtroTorneo      = ref('')
const filtroJornada     = ref('')
const loading           = ref(false)
const showModal         = ref(false)
const saving            = ref(false)
const formError         = ref('')
const formSuccess       = ref('')
const currentPage       = ref(1)
const perPage           = 15

const form = ref({
  competition_id: '',
  season:         '',
  torneo:         '',
  matchday_id:    '',
})

const listaPartidos = ref([
  { home_team: '', away_team: '', match_date: '' }
])

const partidosPaginados = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return partidosFiltrados.value.slice(start, start + perPage)
})

onMounted(async () => {
  const res = await api.get('/competitions')
  competencias.value = res.data
})

function abrirModal() {
  form.value = { competition_id: '', season: '', torneo: '', matchday_id: '' }
  listaPartidos.value  = [{ home_team: '', away_team: '', match_date: '' }]
  temporadasForm.value = []
  torneosForm.value    = []
  jornadasForm.value   = []
  formError.value      = ''
  formSuccess.value    = ''
  showModal.value      = true
}

function cerrarModal() { showModal.value = false }
function agregarFila() { listaPartidos.value.push({ home_team: '', away_team: '', match_date: '' }) }
function removerFila(i) { if (listaPartidos.value.length > 1) listaPartidos.value.splice(i, 1) }

async function onFormCompChange() {
  form.value.season = form.value.torneo = form.value.matchday_id = ''
  temporadasForm.value = torneosForm.value = jornadasForm.value = []
  if (!form.value.competition_id) return
  const res = await api.get(`/competitions/${form.value.competition_id}/temporadas`)
  temporadasForm.value = res.data
}

async function onFormSeasonChange() {
  form.value.torneo = form.value.matchday_id = ''
  torneosForm.value = jornadasForm.value = []
  if (!form.value.season) return
  const res = await api.get(`/competitions/${form.value.competition_id}/torneos?season=${form.value.season}`)
  torneosForm.value = res.data
}

async function onFormTorneoChange() {
  form.value.matchday_id = ''
  jornadasForm.value = []
  if (!form.value.torneo) return
  const res = await api.get(`/competitions/${form.value.competition_id}/matchdays`)
  jornadasForm.value = res.data.filter(j =>
    j.season === form.value.season && j.torneo === form.value.torneo
  )
}

async function onCompChange() {
  jornadas.value = jornadasFiltradas.value = temporadas.value = partidos.value = partidosFiltrados.value = []
  filtroTemporada.value = filtroTorneo.value = filtroJornada.value = ''
  currentPage.value = 1
  if (!selectedComp.value) return
  const res = await api.get(`/competitions/${selectedComp.value}/matchdays`)
  jornadas.value = res.data
  const temps = [...new Set(jornadas.value.map(j => j.season).filter(Boolean))]
  temporadas.value = temps.sort((a, b) => b.localeCompare(a))
  filtrarJornadas()
}

async function filtrarJornadas() {
  partidos.value = partidosFiltrados.value = []
  filtroJornada.value = ''
  currentPage.value   = 1

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

  if (resultado.length) {
    loading.value = true
    try {
      const todos = await Promise.all(
        resultado.map(j => api.get(`/competitions/matchdays/${j.id}`))
      )
      partidos.value = todos.flatMap(r => r.data.matches || [])
        .sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
      partidosFiltrados.value = partidos.value
    } finally {
      loading.value = false
    }
  }
}

function filtrarPorJornada() {
  currentPage.value = 1
  if (!filtroJornada.value) {
    partidosFiltrados.value = partidos.value
    return
  }
  partidosFiltrados.value = partidos.value.filter(p =>
    p.matchday_id === Number(filtroJornada.value)
  )
}

async function guardarPartidos() {
  formError.value = formSuccess.value = ''
  if (!form.value.matchday_id) { formError.value = 'Seleccioná una jornada'; return }
  const invalidos = listaPartidos.value.filter(p => !p.home_team || !p.away_team || !p.match_date)
  if (invalidos.length) { formError.value = 'Completá todos los campos de cada partido'; return }
  saving.value = true
  try {
    await Promise.all(
      listaPartidos.value.map(p =>
        api.post('/competitions/admin/match', {
          matchday_id: form.value.matchday_id,
          home_team:   p.home_team,
          away_team:   p.away_team,
          match_date:  p.match_date,
        })
      )
    )
    formSuccess.value = `✓ ${listaPartidos.value.length} partido${listaPartidos.value.length > 1 ? 's' : ''} creado${listaPartidos.value.length > 1 ? 's' : ''}`
    setTimeout(() => cerrarModal(), 1200)
  } catch (e) {
    formError.value = e.response?.data?.message || 'Error al crear los partidos'
  } finally {
    saving.value = false
  }
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-HN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
function statusLabel(s) {
  return { SCHEDULED: 'Programado', LIVE: 'En curso', FINISHED: 'Finalizado', POSTPONED: 'Postpuesto', CANCELLED: 'Cancelado' }[s] || s
}
function statusBadge(s) {
  return { SCHEDULED: 'badge badge-blue', LIVE: 'badge badge-green', FINISHED: 'badge badge-gray', POSTPONED: 'badge badge-yellow', CANCELLED: 'badge badge-red' }[s] || 'badge badge-gray'
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title  { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.08em; }
.page-sub    { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem; }
.mb-1        { margin-bottom: 1rem; }
.filter-row  { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
.loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
.score       { font-family: var(--font-display); font-size: 1.1rem; color: var(--accent); letter-spacing: 0.05em; }
.text-muted  { color: var(--text-muted); }
.card-header { display: flex; align-items: center; justify-content: flex-end; margin-bottom: 0.75rem; }
.total-badge { font-size: 0.78rem; color: var(--text-muted); }
.modal-lg    { max-width: 700px; max-height: 90vh; overflow-y: auto; }

.partidos-form { margin-top: 1rem; }
.partidos-form-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.section-label { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }

.partido-fila-header {
  display: grid; grid-template-columns: 1fr 1fr 1.2fr 28px;
  gap: 0.5rem; padding: 0 0 0.4rem;
  font-size: 0.72rem; color: var(--text-muted);
  text-transform: uppercase; letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border); margin-bottom: 0.5rem;
}
.partido-fila {
  display: grid; grid-template-columns: 1fr 1fr 1.2fr 28px;
  gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;
}
.partido-fila input { margin: 0; }

.btn-remove {
  width: 28px; height: 28px; border-radius: var(--radius);
  border: 1px solid var(--border); background: transparent;
  color: var(--text-muted); cursor: pointer; font-size: 0.75rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.btn-remove:hover:not(:disabled) { border-color: var(--danger); color: var(--danger); }
.btn-remove:disabled { opacity: 0.3; cursor: not-allowed; }
</style>