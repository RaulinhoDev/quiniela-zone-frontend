<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">USUARIOS</h1>
        <p class="page-sub">{{ total }} usuarios registrados</p>
      </div>
    </div>

    <!-- Lista de usuarios -->
    <div v-if="!selectedUser" class="card">
      <div class="search-row">
        <div class="form-group" style="margin:0;flex:1">
          <label>Buscar</label>
          <input
            v-model="search"
            placeholder="Email o username..."
            @input="onSearch"
          />
        </div>
        <div class="form-group" style="margin:0;min-width:160px">
          <label>Rol</label>
          <select v-model="filtroRol" @change="onFiltroRol">
            <option value="">Todos</option>
            <option value="ADMIN">Admin</option>
            <option value="USER">Usuario</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading-state">Cargando usuarios...</div>
      <div v-else-if="!usuarios.length" class="empty-state">No se encontraron usuarios</div>
      <div v-else>
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
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuarios" :key="u.id">
                <td><strong>{{ u.id }}</strong></td>
                <td><strong>{{ u.username }}</strong></td>
                <td>{{ u.email }}</td>
                <td>{{ u.country }}</td>
                <td>
                  <span :class="u.role === 'ADMIN' ? 'badge badge-green' : 'badge badge-blue'">
                    {{ u.role }}
                  </span>
                </td>
                <td>{{ formatDate(u.created_at) }}</td>
                <td>
                  <div style="display:flex;gap:0.5rem">
                    <button class="btn btn-secondary btn-sm" @click="verDetalle(u)">
                      Ver detalle
                    </button>
                    <button
                      class="btn btn-secondary btn-sm"
                      @click="toggleRol(u)"
                      :disabled="saving === u.id"
                    >
                      {{ u.role === 'ADMIN' ? '→ USER' : '→ ADMIN' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginador del servidor -->
        <div class="paginator">
          <button class="pag-btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">←</button>
          <button
            v-for="p in pageNumbers"
            :key="p"
            class="pag-btn"
            :class="{ active: p === currentPage }"
            @click="goToPage(p)"
          >
            {{ p }}
          </button>
          <button class="pag-btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">→</button>
          <span class="pag-info">{{ from }}–{{ to }} de {{ total }}</span>
        </div>
      </div>
    </div>

    <!-- Detalle de usuario -->
    <div v-else>
      <button class="btn btn-secondary btn-sm" @click="selectedUser = null" style="margin-bottom:1rem">
        ← Volver a usuarios
      </button>

      <div v-if="loadingDetalle" class="card loading-state">Cargando detalle...</div>

      <div v-else-if="detalle" class="detalle-grid">
        <div class="card">
          <h2 class="section-title">Información del usuario</h2>
          <div class="detalle-row"><span class="d-lbl">ID</span><span class="d-val">{{ detalle.user.id }}</span></div>
          <div class="detalle-row"><span class="d-lbl">Username</span><span class="d-val">{{ detalle.user.username }}</span></div>
          <div class="detalle-row"><span class="d-lbl">Email</span><span class="d-val">{{ detalle.user.email }}</span></div>
          <div class="detalle-row"><span class="d-lbl">Nombre</span><span class="d-val">{{ detalle.user.full_name || '—' }}</span></div>
          <div class="detalle-row"><span class="d-lbl">País</span><span class="d-val">{{ detalle.user.country }}</span></div>
          <div class="detalle-row">
            <span class="d-lbl">Rol</span>
            <span :class="detalle.user.role === 'ADMIN' ? 'badge badge-green' : 'badge badge-blue'">
              {{ detalle.user.role }}
            </span>
          </div>
          <div class="detalle-row"><span class="d-lbl">Registrado</span><span class="d-val">{{ formatDate(detalle.user.created_at) }}</span></div>
          <div style="margin-top:1rem">
            <button
              class="btn btn-secondary btn-sm"
              @click="toggleRol(detalle.user)"
              :disabled="saving === detalle.user.id"
            >
              {{ detalle.user.role === 'ADMIN' ? 'Cambiar a USER' : 'Cambiar a ADMIN' }}
            </button>
          </div>
        </div>

        <div class="card">
          <h2 class="section-title">Quinielas ({{ detalle.quinielas.length }})</h2>
          <div v-if="!detalle.quinielas.length" class="empty-state">Sin quinielas</div>
          <div v-else class="quinielas-detalle">
            <div v-for="q in detalle.quinielas" :key="q.id" class="q-row">
              <div class="q-info">
                <div class="q-name">{{ q.name }}</div>
                <div class="q-meta">{{ q.competition }} · unido {{ formatDate(q.joined_at) }}</div>
              </div>
              <div class="q-stats">
                <span class="q-pts">{{ q.total_points }} pts</span>
                <span class="q-rank">#{{ q.rank || '—' }}</span>
                <span :class="statusBadge(q.status)">{{ statusLabel(q.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const usuarios       = ref([])
const loading        = ref(true)
const loadingDetalle = ref(false)
const saving         = ref(null)
const search         = ref('')
const filtroRol      = ref('')
const toast          = ref('')
const selectedUser   = ref(null)
const detalle        = ref(null)
const currentPage    = ref(1)
const totalPages     = ref(1)
const total          = ref(0)
const perPage        = 15

let searchTimeout = null

const from = computed(() => total.value === 0 ? 0 : (currentPage.value - 1) * perPage + 1)
const to   = computed(() => Math.min(currentPage.value * perPage, total.value))

const pageNumbers = computed(() => {
  const pages = []
  const delta = 2
  const left  = Math.max(1, currentPage.value - delta)
  const right = Math.min(totalPages.value, currentPage.value + delta)
  for (let i = left; i <= right; i++) pages.push(i)
  return pages
})

onMounted(() => loadUsuarios())

async function loadUsuarios() {
  loading.value = true
  try {
    const res = await api.get('/users/admin/all', {
      params: {
        page:   currentPage.value,
        limit:  perPage,
        search: search.value,
        role:   filtroRol.value,
      }
    })
    usuarios.value  = res.data.data
    total.value     = res.data.total
    totalPages.value= res.data.totalPages
  } catch (e) {
    showToast('Error cargando usuarios')
  } finally {
    loading.value = false
  }
}

function onSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadUsuarios()
  }, 400) // debounce — espera 400ms antes de buscar
}

function onFiltroRol() {
  currentPage.value = 1
  loadUsuarios()
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadUsuarios()
}

async function verDetalle(user) {
  selectedUser.value   = user
  loadingDetalle.value = true
  detalle.value        = null
  try {
    const res = await api.get(`/admin/users/${user.id}`)
    detalle.value = res.data
  } catch (e) {
    showToast('Error cargando detalle')
  } finally {
    loadingDetalle.value = false
  }
}

async function toggleRol(user) {
  saving.value = user.id
  const nuevoRol = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
  try {
    await api.patch(`/users/admin/${user.id}/role`, { role: nuevoRol })
    user.role = nuevoRol
    if (detalle.value?.user?.id === user.id) detalle.value.user.role = nuevoRol
    showToast(`✓ ${user.username} ahora es ${nuevoRol}`)
  } catch (e) {
    showToast('Error al cambiar rol')
  } finally {
    saving.value = null
  }
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3000)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel(s) {
  return { ESPERANDO: 'Esperando', ACTIVA: 'Activa', FINALIZADA: 'Finalizada' }[s] || s
}
function statusBadge(s) {
  return { ESPERANDO: 'badge badge-blue', ACTIVA: 'badge badge-green', FINALIZADA: 'badge badge-gray' }[s] || 'badge badge-gray'
}
</script>

<style scoped>
.page-header  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; }
.page-title   { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.08em; }
.page-sub     { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem; }
.search-row   { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.loading-state, .empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }
.section-title{ font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem; }

.detalle-grid { display: grid; grid-template-columns: 300px 1fr; gap: 1rem; }
.detalle-row  { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
.detalle-row:last-of-type { border-bottom: none; }
.d-lbl { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.d-val { font-size: 0.88rem; color: var(--text-primary); font-weight: 500; }

.quinielas-detalle { display: flex; flex-direction: column; gap: 0.5rem; }
.q-row  { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius); }
.q-info { flex: 1; }
.q-name { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
.q-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem; }
.q-stats{ display: flex; align-items: center; gap: 0.5rem; }
.q-pts  { font-family: var(--font-display); font-size: 1rem; color: var(--accent); }
.q-rank { font-size: 0.8rem; color: var(--text-muted); }

.paginator { display: flex; align-items: center; gap: 0.35rem; padding: 1rem 0 0; justify-content: flex-end; }
.pag-btn {
  min-width: 32px; height: 32px; padding: 0 0.5rem;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-secondary);
  font-size: 0.82rem; cursor: pointer; transition: all 0.15s;
}
.pag-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.pag-btn.active { background: var(--accent); color: #0a0c10; border-color: var(--accent); font-weight: 700; }
.pag-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.pag-info { font-size: 0.78rem; color: var(--text-muted); margin-left: 0.5rem; }

.toast {
  position: fixed; bottom: 2rem; right: 2rem;
  background: var(--bg-card); border: 1px solid var(--accent);
  color: var(--accent); padding: 0.85rem 1.5rem;
  border-radius: var(--radius); font-weight: 600;
  box-shadow: var(--shadow); z-index: 999;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }
</style>