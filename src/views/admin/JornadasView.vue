<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">JORNADAS</h1>
        <p class="page-sub">Gestión de jornadas por competencia</p>
      </div>
      <button class="btn btn-primary" @click="abrirModal">+ Nueva Jornada</button>
    </div>

    <!-- Filtros -->
    <div class="card mb-1">
      <div class="filter-row">
        <div class="form-group" style="margin:0;flex:1">
          <label>Competencia</label>
          <select v-model="selectedComp" @change="onCompChange">
            <option value="">Todas</option>
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
      </div>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div v-if="loading" class="loading-state">Cargando jornadas...</div>
      <div v-else-if="jornadasFiltradas.length === 0" class="empty-state">
        No hay jornadas. ¡Creá la primera!
      </div>
      <div v-else>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Jornada</th>
                <th>Competencia</th>
                <th>Temporada</th>
                <th>Torneo</th>
                <th>Fecha inicio</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="j in jornadasPaginadas" :key="j.id">
                <td><strong>{{ j.id }}</strong></td>
                <td><strong>{{ j.name }}</strong></td>
                <td>{{ j.competition?.name || '—' }}</td>
                <td>{{ j.season }}</td>
                <td>
                  <span v-if="j.torneo" class="badge badge-blue">{{ j.torneo }}</span>
                  <span v-else class="text-muted">—</span>
                </td>
                <td>{{ formatDate(j.start_date) }}</td>
                <td>
                  <span :class="j.is_finished ? 'badge badge-gray' : 'badge badge-green'">
                    {{ j.is_finished ? 'Finalizada' : 'Activa' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AppPaginator
          :total="jornadasFiltradas.length"
          :per-page="perPage"
          :current="currentPage"
          @change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Modal nueva jornada -->
    <AppModal v-model="showModal" title="NUEVA JORNADA">

        <!-- Paso 1: Competencia -->
        <div class="form-group">
          <label>Competencia</label>
          <select v-model="form.competition_id" @change="onFormCompChange" required>
            <option value="">Seleccioná una competencia</option>
            <option v-for="c in competencias" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Paso 2: Temporada -->
        <div class="form-group" v-if="form.competition_id">
          <label>Temporada</label>
          <div v-if="loadingTemporadas" class="text-muted" style="font-size:0.85rem">Cargando...</div>
          <div v-else>
            <select v-model="form.season" @change="onSeasonChange">
              <option value="">Seleccioná temporada</option>
              <option v-for="t in temporadasForm" :key="t" :value="t">{{ t }}</option>
              <option value="__nueva__">+ Nueva temporada</option>
            </select>
            <input
              v-if="form.season === '__nueva__'"
              v-model="form.season_nueva"
              placeholder="Ej: 2025-2026"
              style="margin-top:0.5rem"
            />
          </div>
        </div>

        <!-- Paso 3: Torneo -->
        <div class="form-group" v-if="form.competition_id && temporadaSeleccionada">
          <label>Torneo</label>
          <div class="torneo-grid">
            <button
              v-for="t in tiposTorneo" :key="t.id"
              type="button"
              class="torneo-btn"
              :class="{ active: form.torneo === t.id }"
              @click="form.torneo = t.id"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Paso 4: Número de jornada -->
        <div class="form-group" v-if="form.torneo">
          <label>Número de jornada</label>
          <div class="jornada-num-row">
            <input
              v-model.number="form.round_number"
              type="number" min="1"
              placeholder="Ej: 1"
              style="flex:1"
            />
            <div class="nombre-preview" v-if="nombreGenerado">
              → <strong>{{ nombreGenerado }}</strong>
            </div>
          </div>
          <div class="form-hint">El nombre se genera automáticamente</div>
        </div>

        <!-- Paso 5: Nombre custom si es "Otro" -->
        <div class="form-group" v-if="form.torneo === 'Otro'">
          <label>Nombre de la jornada</label>
          <input v-model="form.nombre_custom" placeholder="Ej: Final, Semifinal, Repechaje" />
        </div>

        <!-- Fechas -->
        <div class="form-row" v-if="form.torneo">
          <div class="form-group">
            <label>Fecha inicio</label>
            <input v-model="form.start_date" type="date" />
          </div>
          <div class="form-group">
            <label>Fecha fin</label>
            <input v-model="form.end_date" type="date" />
          </div>
        </div>

        <div v-if="formError"   class="alert alert-error">{{ formError }}</div>
        <div v-if="formSuccess" class="alert alert-success">{{ formSuccess }}</div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primary" @click="createJornada" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Crear Jornada' }}
          </button>
        </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import AppPaginator from '@/components/AppPaginator.vue'
import AppModal from '@/components/AppModal.vue'

const competencias      = ref([])
const jornadas          = ref([])
const jornadasFiltradas = ref([])
const temporadas        = ref([])
const temporadasForm    = ref([])
const selectedComp      = ref('')
const filtroTemporada   = ref('')
const filtroTorneo      = ref('')
const loading           = ref(false)
const loadingTemporadas = ref(false)
const showModal         = ref(false)
const saving            = ref(false)
const formError         = ref('')
const formSuccess       = ref('')
const currentPage       = ref(1)
const perPage           = 10

const tiposTorneo = [
  { id: 'Apertura', label: 'Apertura' },
  { id: 'Clausura', label: 'Clausura' },
  { id: 'Único',    label: 'Torneo único' },
  { id: 'Otro',     label: 'Otro' },
]

const form = ref({
  competition_id: '',
  season:         '',
  season_nueva:   '',
  torneo:         '',
  round_number:   null,
  nombre_custom:  '',
  start_date:     '',
  end_date:       '',
})

const temporadaSeleccionada = computed(() => {
  if (form.value.season === '__nueva__') return form.value.season_nueva
  return form.value.season
})

const nombreGenerado = computed(() => {
  if (!form.value.torneo || !form.value.round_number) return ''
  if (form.value.torneo === 'Único') return `Jornada ${form.value.round_number}`
  if (form.value.torneo === 'Otro')  return form.value.nombre_custom
  return `${form.value.torneo} - ${form.value.round_number}`
})

const jornadasPaginadas = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return jornadasFiltradas.value.slice(start, start + perPage)
})

onMounted(async () => {
  const res = await api.get('/competitions')
  competencias.value = res.data
  await loadJornadas()
})

function abrirModal() {
  form.value = {
    competition_id: '',
    season:         '',
    season_nueva:   '',
    torneo:         '',
    round_number:   null,
    nombre_custom:  '',
    start_date:     '',
    end_date:       '',
  }
  temporadasForm.value = []
  formError.value      = ''
  formSuccess.value    = ''
  showModal.value      = true
}

function cerrarModal() {
  showModal.value = false
}

async function onFormCompChange() {
  form.value.season       = ''
  form.value.season_nueva = ''
  form.value.torneo       = ''
  form.value.round_number = null
  temporadasForm.value    = []

  if (!form.value.competition_id) return
  loadingTemporadas.value = true
  try {
    const res = await api.get(`/competitions/${form.value.competition_id}/temporadas`)
    temporadasForm.value = res.data
  } finally {
    loadingTemporadas.value = false
  }
}

function onSeasonChange() {
  form.value.torneo       = ''
  form.value.round_number = null
}

async function onCompChange() {
  filtroTemporada.value = ''
  filtroTorneo.value    = ''
  currentPage.value     = 1
  await loadJornadas()
}

async function loadJornadas() {
  loading.value = true
  try {
    if (selectedComp.value) {
      const res = await api.get(`/competitions/${selectedComp.value}/matchdays`)
      jornadas.value = res.data
    } else {
      const all = []
      for (const c of competencias.value.slice(0, 5)) {
        const res = await api.get(`/competitions/${c.id}/matchdays`)
        all.push(...res.data.map(j => ({ ...j, competition: c })))
      }
      jornadas.value = all.sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    }
    const temps = [...new Set(jornadas.value.map(j => j.season).filter(Boolean))]
    temporadas.value = temps.sort((a, b) => b.localeCompare(a))
    filtrarJornadas()
  } finally {
    loading.value = false
  }
}

function filtrarJornadas() {
  currentPage.value = 1
  let resultado = jornadas.value

  if (filtroTemporada.value) {
    resultado = resultado.filter(j => j.season === filtroTemporada.value)
  }
  if (filtroTorneo.value === 'Otro') {
    resultado = resultado.filter(j =>
      !j.name.startsWith('Apertura') && !j.name.startsWith('Clausura') && !j.name.startsWith('Jornada')
    )
  } else if (filtroTorneo.value === 'Único') {
    resultado = resultado.filter(j => j.name.startsWith('Jornada'))
  } else if (filtroTorneo.value) {
    resultado = resultado.filter(j => j.name.startsWith(filtroTorneo.value))
  }

  jornadasFiltradas.value = resultado
}

async function createJornada() {
  formError.value   = ''
  formSuccess.value = ''

  const season = temporadaSeleccionada.value
  if (!form.value.competition_id) { formError.value = 'Seleccioná una competencia'; return }
  if (!season)                    { formError.value = 'Ingresá la temporada'; return }
  if (!form.value.torneo)         { formError.value = 'Seleccioná el torneo'; return }
  if (!form.value.round_number)   { formError.value = 'Ingresá el número de jornada'; return }

  const nombre = form.value.torneo === 'Otro'
    ? form.value.nombre_custom
    : nombreGenerado.value

  if (!nombre) { formError.value = 'El nombre es obligatorio'; return }

  saving.value = true
  try {
    await api.post('/competitions/admin/matchday', {
      competition_id: form.value.competition_id,
      name:           nombre,
      season,
      torneo:         form.value.torneo,
      round_number:   form.value.round_number,
      start_date:     form.value.start_date || null,
      end_date:       form.value.end_date   || null,
    })

    formSuccess.value = `✓ "${nombre}" creada`

    // Actualizar lista de temporadas del form
    if (!temporadasForm.value.includes(season)) {
      temporadasForm.value = [season, ...temporadasForm.value]
    }
    // Si era nueva, cambiar a selector normal
    if (form.value.season === '__nueva__') {
      form.value.season       = season
      form.value.season_nueva = ''
    }

    await loadJornadas()

    setTimeout(() => {
      // Resetear solo número, fechas y nombre custom
      form.value.round_number  = null
      form.value.start_date    = ''
      form.value.end_date      = ''
      form.value.nombre_custom = ''
      formSuccess.value        = ''
      showModal.value          = false
    }, 1200)
  } catch (e) {
    formError.value = e.response?.data?.message || 'Error al crear la jornada'
  } finally {
    saving.value = false
  }
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title  { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.08em; color: var(--text-primary); }
.page-sub    { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem; }
.mb-1        { margin-bottom: 1rem; }
.filter-row  { display: flex; gap: 1rem; align-items: flex-end; }
.form-row    { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
.text-muted  { color: var(--text-muted); }

.torneo-grid { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.torneo-btn {
  flex: 1; min-width: 80px; padding: 0.6rem 0.5rem;
  border-radius: var(--radius); border: 1px solid var(--border);
  background: var(--bg-surface); cursor: pointer;
  color: var(--text-secondary); font-family: var(--font-body);
  font-size: 0.85rem; font-weight: 500; transition: all 0.15s;
}
.torneo-btn:hover  { border-color: var(--border-light); color: var(--text-primary); }
.torneo-btn.active { border-color: var(--accent); background: var(--accent-glow); color: var(--accent); }

.jornada-num-row { display: flex; align-items: center; gap: 0.75rem; }
.nombre-preview  { font-size: 0.88rem; color: var(--text-secondary); white-space: nowrap; }
.form-hint       { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem; }
</style>