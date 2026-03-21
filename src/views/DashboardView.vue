<template>
  <div class="page">
    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">Hola, {{ auth.user?.username }} 👋</h1>
        <p class="dash-sub">Tus quinielas activas</p>
      </div>
      <div class="dash-actions">
        <button class="btn btn-secondary" @click="showJoinModal = true">
          Unirse con código
        </button>
        <button class="btn btn-primary" @click="showCreateModal = true">
          + Nueva quiniela
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty-state">Cargando...</div>

    <!-- Sin quinielas -->
    <div v-else-if="!quinielas.length" class="empty-box">
      <div class="empty-icon">⚽</div>
      <h2 class="empty-title">Todavía no tenés quinielas</h2>
      <p class="empty-desc">Creá la tuya o unite a una con el código que te mandaron</p>
      <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem">
        <button class="btn btn-secondary" @click="showJoinModal = true">Unirse con código</button>
        <button class="btn btn-primary" @click="showCreateModal = true">Crear quiniela</button>
      </div>
    </div>

    <!-- Lista de quinielas -->
    <div v-else class="quinielas-grid">
      <div
        v-for="p in quinielas" :key="p.id"
        class="q-card card"
        @click="irAQuiniela(p.quiniela?.id)"
      >
        <div class="q-card-top">
          <div>
            <div class="q-name">{{ p.quiniela?.name }}</div>
            <div class="q-comp">{{ p.quiniela?.competition?.name }}</div>
          </div>
          <span :class="statusBadge(p.quiniela?.status)">
            {{ statusLabel(p.quiniela?.status) }}
          </span>
        </div>

        <div class="q-stats">
          <div class="q-stat">
            <span class="q-stat-val">{{ p.total_points }}</span>
            <span class="q-stat-lbl">Mis puntos</span>
          </div>
          <div class="q-stat">
            <span class="q-stat-val">{{ p.rank || '—' }}</span>
            <span class="q-stat-lbl">Mi posición</span>
          </div>
          <div class="q-stat">
            <span class="q-stat-val">{{ p.jornadas_jugadas }}</span>
            <span class="q-stat-lbl">Jornadas</span>
          </div>
        </div>

        <div class="q-card-footer">
          <span class="q-owner">
            {{ p.quiniela?.owner?.username === auth.user?.username ? '👑 Organizador' : `Org: ${p.quiniela?.owner?.username}` }}
          </span>
          <span class="q-code">{{ p.quiniela?.invite_code }}</span>
        </div>
      </div>
    </div>

    <!-- Modal crear quiniela -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">NUEVA QUINIELA</span>
          <button class="modal-close" @click="showCreateModal = false">✕</button>
        </div>

        <div class="form-group">
          <label>Nombre de la quiniela</label>
          <input v-model="createForm.name" placeholder="Ej: Clausura 2025 — Grupo del trabajo" />
        </div>
        <div class="form-group">
          <label>Competencia</label>
          <select v-model="createForm.competition_id">
            <option value="">Seleccioná competencia</option>
            <option v-for="c in competencias" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Temporada</label>
          <input v-model="createForm.season" placeholder="Ej: 2024" />
        </div>
        <div class="form-group">
          <label>Descripción (opcional)</label>
          <input v-model="createForm.description" placeholder="Ej: La quiniela del grupo del trabajo" />
        </div>

        <div class="paid-row">
          <label class="toggle-label">
            <input type="checkbox" v-model="createForm.is_paid" />
            <span>Quiniela de pago</span>
          </label>
          <div v-if="createForm.is_paid" class="form-group" style="margin:0;flex:1">
            <input v-model.number="createForm.entry_fee" type="number" min="1" placeholder="Monto en USD" />
          </div>
        </div>

        <div class="scoring-section">
          <div class="scoring-title">Reglas de puntuación</div>
          <div class="form-row">
            <div class="form-group">
              <label>Resultado exacto</label>
              <input v-model.number="createForm.scoring.exact_score_pts" type="number" min="1" />
            </div>
            <div class="form-group">
              <label>Ganador correcto</label>
              <input v-model.number="createForm.scoring.correct_winner_pts" type="number" min="0" />
            </div>
          </div>
        </div>

        <div v-if="createError" class="alert alert-error">{{ createError }}</div>
        <div v-if="createSuccess" class="alert alert-success">{{ createSuccess }}</div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="createQuiniela" :disabled="creating">
            {{ creating ? 'Creando...' : 'Crear Quiniela' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal unirse -->
    <div v-if="showJoinModal" class="modal-overlay" @click.self="showJoinModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">UNIRSE A QUINIELA</span>
          <button class="modal-close" @click="showJoinModal = false">✕</button>
        </div>
        <p style="color:var(--text-secondary);margin-bottom:1.5rem;font-size:0.9rem">
          Ingresá el código que te compartió el organizador
        </p>
        <div class="form-group">
          <label>Código de invitación</label>
          <input
            v-model="joinCode"
            placeholder="Ej: ABC123"
            style="text-transform:uppercase;letter-spacing:0.1em;font-size:1.2rem;text-align:center"
            maxlength="6"
          />
        </div>
        <div v-if="joinError" class="alert alert-error">{{ joinError }}</div>
        <div v-if="joinSuccess" class="alert alert-success">{{ joinSuccess }}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showJoinModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="joinQuiniela" :disabled="joining">
            {{ joining ? 'Uniéndose...' : 'Unirse' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const router = useRouter()
const auth   = useAuthStore()

const quinielas       = ref([])
const competencias    = ref([])
const loading         = ref(true)
const showCreateModal = ref(false)
const showJoinModal   = ref(false)
const creating        = ref(false)
const joining         = ref(false)
const joinCode        = ref('')
const joinError       = ref('')
const joinSuccess     = ref('')
const createError     = ref('')
const createSuccess   = ref('')

const createForm = ref({
  name: '', competition_id: '', season: '2024',
  description: '', is_paid: false, entry_fee: 0,
  scoring: { exact_score_pts: 3, correct_winner_pts: 1 }
})

onMounted(async () => {
  try {
    const [misRes, compRes] = await Promise.all([
      api.get('/quinielas/mis/quinielas'),
      api.get('/competitions'),
    ])
    quinielas.value    = misRes.data
    competencias.value = compRes.data
  } finally {
    loading.value = false
  }
})

async function createQuiniela() {
  createError.value   = ''
  createSuccess.value = ''
  if (!createForm.value.name || !createForm.value.competition_id || !createForm.value.season) {
    createError.value = 'Nombre, competencia y temporada son obligatorios'
    return
  }
  creating.value = true
  try {
    const res = await api.post('/quinielas', createForm.value)
    createSuccess.value = `✓ Quiniela creada. Código: ${res.data.invite_code}`
    const misRes = await api.get('/quinielas/mis/quinielas')
    quinielas.value = misRes.data
    setTimeout(() => {
      showCreateModal.value = false
      createSuccess.value   = ''
      router.push(`/app/quinielas/${res.data.id}`)
    }, 1500)
  } catch (e) {
    createError.value = e.response?.data?.message || 'Error al crear la quiniela'
  } finally {
    creating.value = false
  }
}

async function joinQuiniela() {
  joinError.value   = ''
  joinSuccess.value = ''
  if (!joinCode.value) { joinError.value = 'Ingresá el código'; return }
  joining.value = true
  try {
    await api.post('/quinielas/unirse/codigo', { invite_code: joinCode.value })
    joinSuccess.value = '✓ Te uniste a la quiniela'
    const misRes = await api.get('/quinielas/mis/quinielas')
    quinielas.value = misRes.data
    setTimeout(() => { showJoinModal.value = false; joinSuccess.value = '' }, 1500)
  } catch (e) {
    joinError.value = e.response?.data?.message || 'Código inválido o quiniela ya iniciada'
  } finally {
    joining.value = false
  }
}

function irAQuiniela(id) {
  if (id) router.push(`/app/quinielas/${id}`)
}

function statusLabel(s) {
  return { ESPERANDO: 'Esperando', ACTIVA: 'Activa', FINALIZADA: 'Finalizada' }[s] || s
}
function statusBadge(s) {
  return { ESPERANDO: 'badge badge-blue', ACTIVA: 'badge badge-green', FINALIZADA: 'badge badge-gray' }[s] || 'badge badge-gray'
}
</script>

<style scoped>
.dash-header  { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
.dash-title   { font-family: var(--font-display); font-size: 1.8rem; letter-spacing: 0.04em; }
.dash-sub     { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.2rem; }
.dash-actions { display: flex; gap: 0.75rem; }
.empty-state  { text-align: center; padding: 4rem; color: var(--text-muted); }

.empty-box {
  text-align: center; padding: 4rem 2rem;
  background: var(--bg-card); border: 1px dashed var(--border-light);
  border-radius: var(--radius-lg);
}
.empty-icon  { font-size: 3rem; margin-bottom: 1rem; }
.empty-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; }
.empty-desc  { color: var(--text-muted); font-size: 0.9rem; }

.quinielas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }

.q-card {
  cursor: pointer; transition: border-color 0.15s, transform 0.15s;
  display: flex; flex-direction: column; gap: 1rem;
}
.q-card:hover { border-color: var(--border-light); transform: translateY(-2px); }

.q-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.q-name  { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; line-height: 1.3; }
.q-comp  { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem; }

.q-stats {
  display: flex; background: var(--bg-surface);
  border-radius: var(--radius); overflow: hidden;
  border: 1px solid var(--border);
}
.q-stat {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 0.65rem 0.25rem; border-right: 1px solid var(--border);
}
.q-stat:last-child { border-right: none; }
.q-stat-val { font-family: var(--font-display); font-size: 1.3rem; color: var(--accent); }
.q-stat-lbl { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.1rem; }

.q-card-footer { display: flex; align-items: center; justify-content: space-between; }
.q-owner { font-size: 0.78rem; color: var(--text-muted); }
.q-code  { font-family: var(--font-display); font-size: 0.9rem; color: var(--accent-2); letter-spacing: 0.08em; }

.paid-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.toggle-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; white-space: nowrap; }
.scoring-section { background: var(--bg-surface); border-radius: var(--radius); padding: 1rem; margin-bottom: 1rem; }
.scoring-title   { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
</style>
