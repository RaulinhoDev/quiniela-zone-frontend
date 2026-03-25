<template>
  <div class="page">
    <div class="explorar-header">
      <div>
        <h1 class="page-title">EXPLORAR QUINIELAS</h1>
        <p class="explorar-sub">Quinielas públicas abiertas — unite a la que más te guste</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filtros-bar">
      <button
        class="filtro-btn"
        :class="{ active: filtroComp === null }"
        @click="setFiltro(null)"
      >Todas</button>
      <button
        v-for="c in competencias"
        :key="c.id"
        class="filtro-btn"
        :class="{ active: filtroComp === c.id }"
        @click="setFiltro(c.id)"
      >{{ c.name }}</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty-state">Cargando quinielas...</div>

    <!-- Sin resultados -->
    <div v-else-if="!quinielas.length" class="empty-box">
      <div class="empty-icon"></div>
      <h2 class="empty-title">No hay quinielas públicas</h2>
      <p class="empty-desc">
        Aún no hay quinielas públicas activas
        {{ filtroComp ? 'para esta liga' : '' }}.
        <span v-if="auth.user?.is_premium">
          ¡Creá la primera desde tu dashboard!
        </span>
        <router-link v-else to="/app/premium" class="empty-link">
          Con Premium podés crear quinielas públicas.
        </router-link>
      </p>
    </div>

    <!-- Grid de quinielas -->
    <div v-else class="quinielas-grid">
      <div
        v-for="q in quinielas"
        :key="q.id"
        class="q-card card"
        @click="unirseOVer(q)"
      >
        <div class="q-card-top">
          <div class="q-info">
            <div class="q-name">{{ q.name }}</div>
            <div class="q-comp">{{ q.competition?.name }}</div>
          </div>
          <span :class="statusBadge(q.status)">{{ statusLabel(q.status) }}</span>
        </div>

        <div class="q-card-meta">
          <div class="q-meta-item">
            <span class="q-meta-val">{{ q.total_participantes }}</span>
            <span class="q-meta-lbl">participantes</span>
          </div>
          <div class="q-meta-item">
            <span class="q-meta-val">{{ q.season }}</span>
            <span class="q-meta-lbl">temporada</span>
          </div>
          <div class="q-meta-item">
            <span class="q-meta-val">@{{ q.owner?.username }}</span>
            <span class="q-meta-lbl">organizador</span>
          </div>
        </div>

        <div class="q-card-footer">
          <button
            class="btn btn-primary btn-sm"
            @click.stop="unirseAQuiniela(q)"
            :disabled="uniendose === q.id"
          >
            {{ uniendose === q.id ? 'Uniéndose...' : 'Unirse' }}
          </button>
          <router-link
            :to="`/q/${q.id}`"
            class="btn btn-secondary btn-sm"
            @click.stop
          >Ver ranking</router-link>
        </div>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="pagination.total_pages > 1" class="pagination">
      <button
        class="btn btn-secondary btn-sm"
        :disabled="page <= 1"
        @click="cambiarPagina(page - 1)"
      >← Anterior</button>
      <span class="pagination-info">{{ page }} / {{ pagination.total_pages }}</span>
      <button
        class="btn btn-secondary btn-sm"
        :disabled="page >= pagination.total_pages"
        @click="cambiarPagina(page + 1)"
      >Siguiente →</button>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const auth   = useAuthStore()

const quinielas    = ref([])
const competencias = ref([])
const loading      = ref(true)
const filtroComp   = ref(null)
const uniendose    = ref(null)
const toast        = ref('')
const page         = ref(1)
const pagination   = ref({ total: 0, total_pages: 1 })

onMounted(async () => {
  const [compRes] = await Promise.all([
    api.get('/competitions'),
    cargarQuinielas(),
  ])
  competencias.value = compRes.data
})

async function cargarQuinielas() {
  loading.value = true
  try {
    const params = { page: page.value, limit: 20 }
    if (filtroComp.value) params.competition_id = filtroComp.value
    const res = await api.get('/quinielas/publicas/explorar', { params })
    quinielas.value  = res.data.quinielas
    pagination.value = res.data.pagination
  } finally {
    loading.value = false
  }
}

function setFiltro(compId) {
  filtroComp.value = compId
  page.value = 1
  cargarQuinielas()
}

function cambiarPagina(p) {
  page.value = p
  cargarQuinielas()
}

async function unirseAQuiniela(q) {
  uniendose.value = q.id
  try {
    await api.post(`/quinielas/${q.id}/unirse`)
    showToast('Te uniste a la quiniela')
    setTimeout(() => router.push(`/app/quinielas/${q.id}`), 800)
  } catch (e) {
    const msg = e?.response?.data?.message || ''
    if (msg.toLowerCase().includes('ya sos participante')) {
      router.push(`/app/quinielas/${q.id}`)
    } else {
      showToast(msg || 'No se pudo unir a la quiniela')
    }
  } finally {
    uniendose.value = null
  }
}

function unirseOVer(q) {
  // click en la card sin botones específicos — navegar a la quiniela si ya participa
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

function statusLabel(s) {
  return { ESPERANDO: 'Esperando', ACTIVA: 'Activa', FINALIZADA: 'Finalizada' }[s] || s
}
function statusBadge(s) {
  return { ESPERANDO: 'badge badge-blue', ACTIVA: 'badge badge-green', FINALIZADA: 'badge badge-gray' }[s] || 'badge badge-gray'
}
</script>

<style scoped>
.explorar-header { margin-bottom: 1.5rem; }
.explorar-sub    { color: var(--text-muted); font-size: 0.88rem; margin-top: 0.25rem; }

/* Filtros */
.filtros-bar {
  display: flex; flex-wrap: wrap; gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.filtro-btn {
  padding: 0.4rem 0.9rem; border-radius: var(--radius);
  border: 1px solid var(--border); background: var(--bg-surface);
  color: var(--text-secondary); cursor: pointer; font-size: 0.82rem;
  font-weight: 500; transition: all 0.15s;
}
.filtro-btn:hover { border-color: var(--accent); color: var(--text-primary); }
.filtro-btn.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }

/* Grid de quinielas — reutiliza el mismo diseño que DashboardView */
.quinielas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }

.q-card {
  cursor: pointer; transition: border-color 0.15s, transform 0.15s;
  display: flex; flex-direction: column; gap: 0.75rem;
}
.q-card:hover { border-color: rgba(0,229,160,0.3); transform: translateY(-2px); }

.q-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
.q-info      { flex: 1; min-width: 0; }
.q-name      { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.q-comp      { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem; }

.q-card-meta { display: flex; gap: 1rem; }
.q-meta-item { display: flex; flex-direction: column; gap: 0.1rem; }
.q-meta-val  { font-family: var(--font-display); font-size: 0.9rem; color: var(--text-primary); }
.q-meta-lbl  { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.03em; }

.q-card-footer { display: flex; gap: 0.5rem; margin-top: auto; }

/* Paginación */
.pagination { display: flex; align-items: center; justify-content: center; gap: 1rem; padding-top: 1rem; }
.pagination-info { font-size: 0.85rem; color: var(--text-muted); }

/* Empty */
.empty-box  { text-align: center; padding: 3rem 1rem; }
.empty-icon { width: 48px; height: 48px; border-radius: 50%; border: 2px dashed var(--border); margin: 0 auto 1rem; }
.empty-title{ font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
.empty-desc { color: var(--text-muted); font-size: 0.88rem; line-height: 1.6; }
.empty-link { color: var(--accent); text-decoration: none; }
.empty-link:hover { text-decoration: underline; }

/* Toast */
.toast { position: fixed; bottom: 2rem; right: 2rem; background: var(--bg-card); border: 1px solid var(--accent); color: var(--accent); padding: 0.85rem 1.5rem; border-radius: var(--radius); font-weight: 600; box-shadow: var(--shadow); z-index: 999; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

@media (max-width: 540px) {
  .filtros-bar { gap: 0.35rem; }
  .filtro-btn  { font-size: 0.78rem; padding: 0.35rem 0.7rem; }
  .quinielas-grid { grid-template-columns: 1fr; }
}
</style>
