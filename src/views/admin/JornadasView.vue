<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">JORNADAS</h1>
        <p class="page-sub">Gestión de jornadas por competencia</p>
      </div>
      <button class="btn btn-primary" @click="showModal = true">+ Nueva Jornada</button>
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
                <th>Fecha inicio</th>
                <th>Estado</th>
                <th>Partidos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="j in jornadasPaginadas" :key="j.id">
                <td><strong>{{ j.id }}</strong></td>
                <td><strong>{{ j.name }}</strong></td>
                <td>{{ j.competition?.name || '—' }}</td>
                <td>{{ j.season }}</td>
                <td>{{ formatDate(j.start_date) }}</td>
                <td>
                  <span :class="j.is_finished ? 'badge badge-gray' : 'badge badge-green'">
                    {{ j.is_finished ? 'Finalizada' : 'Activa' }}
                  </span>
                </td>
                <td>{{ j.matches?.length ?? '—' }}</td>
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
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">NUEVA JORNADA</span>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="form-group">
          <label>Competencia</label>
          <select v-model="form.competition_id" required>
            <option value="">Seleccioná una competencia</option>
            <option v-for="c in competencias" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Nombre de la jornada</label>
          <input v-model="form.name" placeholder="Ej: Clausura - 1, Apertura - Final" />
        </div>
        <div class="form-group">
          <label>Temporada</label>
          <input v-model="form.season" placeholder="Ej: 2024" />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Fecha inicio</label>
            <input v-model="form.start_date" type="date" />
          </div>
          <div class="form-group">
            <label>Fecha fin</label>
            <input v-model="form.end_date" type="date" />
          </div>
        </div>
        <div v-if="formError" class="alert alert-error">{{ formError }}</div>
        <div v-if="formSuccess" class="alert alert-success">{{ formSuccess }}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="createJornada" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Crear Jornada' }}
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
const temporadas        = ref([])
const selectedComp      = ref('')
const filtroTemporada   = ref('')
const filtroTorneo      = ref('')
const loading           = ref(false)
const showModal         = ref(false)
const saving            = ref(false)
const formError         = ref('')
const formSuccess       = ref('')
const currentPage       = ref(1)
const perPage           = 10

const jornadasPaginadas = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return jornadasFiltradas.value.slice(start, start + perPage)
})

const form = ref({
  competition_id: '',
  name: '',
  season: '2024',
  start_date: '',
  end_date: ''
})

onMounted(async () => {
  const res = await api.get('/competitions')
  competencias.value = res.data
  await loadJornadas()
})

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
      !j.name.startsWith('Apertura') && !j.name.startsWith('Clausura')
    )
  } else if (filtroTorneo.value) {
    resultado = resultado.filter(j => j.name.startsWith(filtroTorneo.value))
  }

  jornadasFiltradas.value = resultado
}

async function createJornada() {
  formError.value   = ''
  formSuccess.value = ''
  if (!form.value.competition_id || !form.value.name || !form.value.season) {
    formError.value = 'Competencia, nombre y temporada son obligatorios'
    return
  }
  saving.value = true
  try {
    await api.post('/competitions/admin/matchday', form.value)
    formSuccess.value = 'Jornada creada exitosamente!'
    await loadJornadas()
    setTimeout(() => { showModal.value = false; formSuccess.value = '' }, 1500)
    form.value = { competition_id: '', name: '', season: '2024', start_date: '', end_date: '' }
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
</style>