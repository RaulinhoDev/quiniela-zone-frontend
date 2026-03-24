<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">SYNC API-FOOTBALL</h1>
        <p class="page-sub">Importar jornadas y partidos desde API-Football</p>
      </div>
    </div>

    <!-- Formulario de sync -->
    <div class="card mb-1">
      <h2 class="section-title">Sincronizar temporada completa</h2>
      <p class="section-desc">Importa todas las jornadas y partidos de una competencia y temporada. Ejecutá esto una vez por temporada.</p>

      <div class="form-row">
        <div class="form-group">
          <label>Competencia</label>
          <select v-model="form.competition_id" @change="onCompChange">
            <option value="">Seleccioná una competencia</option>
            <option v-for="c in competencias" :key="c.id" :value="c.id" :disabled="!c.api_football_id">
              {{ c.name }} {{ !c.api_football_id ? '(manual)' : '' }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Temporada</label>
          <input v-model="form.season" placeholder="Ej: 2024" />
        </div>
      </div>

      <div v-if="selectedComp" class="comp-info">
        <span class="badge badge-blue">API ID: {{ selectedComp.api_football_id }}</span>
        <span class="badge badge-gray">{{ selectedComp.region }}</span>
      </div>

      <div v-if="syncMsg" :class="`alert ${syncError ? 'alert-error' : 'alert-success'}`">
        {{ syncMsg }}
      </div>

      <button class="btn btn-primary" @click="doSync" :disabled="syncing || !form.competition_id || !form.season">
        {{ syncing ? 'Sincronizando...' : 'Sincronizar' }}
      </button>
    </div>

    <!-- Competencias disponibles -->
    <div class="card">
      <div class="card-header">
        <h2 class="section-title" style="margin:0">Competencias con API-Football</h2>
        <span class="total-badge">{{ competenciasFiltradas.length }} de {{ competencias.length }}</span>
      </div>

      <!-- Buscador -->
      <div class="form-group" style="margin-bottom:1rem">
        <input v-model="search" placeholder="Buscar por nombre de liga..." @input="onSearch" />
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Región</th>
              <th>API ID</th>
              <th>Tipo</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in competenciasPaginadas" :key="c.id">
              <td>{{ c.id }}</td>
              <td><strong>{{ c.name }}</strong></td>
              <td><span class="badge badge-gray">{{ c.region }}</span></td>
              <td>{{ c.api_football_id || '—' }}</td>
              <td>
                <span :class="c.is_manual ? 'badge badge-yellow' : 'badge badge-green'">
                  {{ c.is_manual ? 'Manual' : 'API' }}
                </span>
              </td>
              <td>
                <button
                  v-if="c.api_football_id"
                  class="btn btn-secondary btn-sm"
                  @click="quickSync(c)"
                >
                  Sync rápido
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPaginator
        :total="competenciasFiltradas.length"
        :per-page="perPage"
        :current="currentPage"
        @change="currentPage = $event"
      />
    </div>

    <!-- Modal de sync rápido -->
    <AppModal v-model="showQuickModal" title="SYNC RÁPIDO">
        <p style="color:var(--text-secondary);margin-bottom:1rem">
          Sincronizar <strong style="color:var(--text-primary)">{{ quickComp?.name }}</strong>
        </p>
        <div class="form-group">
          <label>Temporada</label>
          <input v-model="quickSeason" placeholder="Ej: 2024" />
        </div>
        <div v-if="syncMsg" :class="`alert ${syncError ? 'alert-error' : 'alert-success'}`">
          {{ syncMsg }}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showQuickModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="doQuickSync" :disabled="syncing">
            {{ syncing ? 'Sincronizando...' : 'Sincronizar' }}
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

const competencias        = ref([])
const competenciasFiltradas = ref([])
const selectedComp        = ref(null)
const syncing             = ref(false)
const syncMsg             = ref('')
const syncError           = ref(false)
const showQuickModal      = ref(false)
const quickComp           = ref(null)
const quickSeason         = ref('2024')
const currentPage         = ref(1)
const perPage             = 10
const search              = ref('')

const form = ref({ competition_id: '', season: '2024' })

const competenciasPaginadas = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return competenciasFiltradas.value.slice(start, start + perPage)
})

onMounted(async () => {
  const res = await api.get('/competitions')
  competencias.value          = res.data
  competenciasFiltradas.value = res.data
})

function onSearch() {
  currentPage.value = 1
  if (!search.value) {
    competenciasFiltradas.value = competencias.value
    return
  }
  competenciasFiltradas.value = competencias.value.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
  )
}

function onCompChange() {
  selectedComp.value = competencias.value.find(c => c.id === form.value.competition_id) || null
  syncMsg.value = ''
}

async function doSync() {
  syncing.value   = true
  syncMsg.value   = ''
  syncError.value = false
  try {
    await api.post('/competitions/admin/sync', {
      competition_api_id: selectedComp.value.api_football_id,
      season: form.value.season
    })
    syncMsg.value = `✓ Sync completado para ${selectedComp.value.name} temporada ${form.value.season}. Revisá la terminal del servidor.`
  } catch (e) {
    syncError.value = true
    syncMsg.value   = e.response?.data?.message || 'Error al sincronizar'
  } finally {
    syncing.value = false
  }
}

function quickSync(comp) {
  quickComp.value      = comp
  syncMsg.value        = ''
  syncError.value      = false
  showQuickModal.value = true
}

async function doQuickSync() {
  syncing.value   = true
  syncMsg.value   = ''
  syncError.value = false
  try {
    await api.post('/competitions/admin/sync', {
      competition_api_id: quickComp.value.api_football_id,
      season: quickSeason.value
    })
    syncMsg.value = `✓ Sync completado para ${quickComp.value.name}`
  } catch (e) {
    syncError.value = true
    syncMsg.value   = e.response?.data?.message || 'Error al sincronizar'
  } finally {
    syncing.value = false
  }
}
</script>

<style scoped>
.page-header  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title   { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.08em; }
.page-sub     { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem; }
.mb-1         { margin-bottom: 1rem; }
.section-title{ font-size: 1rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.4rem; }
.section-desc { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.25rem; }
.form-row     { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.comp-info    { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.card-header  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.total-badge  { font-size: 0.78rem; color: var(--text-muted); }
</style>