<template>
  <div class="page">
    <!-- Header -->
    <div class="dash-header">
      <div>
        <h1 class="dash-title">Hola, {{ auth.user?.full_name || auth.user?.username }}</h1>
        <p class="dash-sub">Tus quinielas activas</p>
      </div>
      <div class="dash-actions">
        <router-link to="/app/explorar" class="btn btn-secondary">Explorar públicas</router-link>
        <button class="btn btn-secondary" @click="showJoinModal = true">Unirse con código</button>
        <div class="crear-btn-wrapper" :title="!puedeCrear ? 'Plan gratuito: máximo 1 quiniela. Actualizá a Premium.' : ''">
          <button class="btn btn-primary" @click="abrirModalCrear" :disabled="!puedeCrear">
            + Nueva quiniela
          </button>
        </div>
      </div>
    </div>

    <!-- Banner plan gratuito -->
    <div v-if="!auth.isPremium && !auth.user?.is_premium && limites" class="free-banner">
      <div class="free-banner-text">
        <strong>Plan gratuito</strong> —
        {{ limites.quinielas.creadas }}/{{ limites.quinielas.limite }} quiniela{{ limites.quinielas.limite !== 1 ? 's' : '' }} creada{{ limites.quinielas.limite !== 1 ? 's' : '' }} ·
        máx {{ limites.participantes.limite_por_quiniela }} participantes por quiniela
      </div>
      <router-link to="/app/premium" class="btn btn-primary btn-sm">Actualizar a Premium</router-link>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="empty-state">Cargando...</div>

    <template v-else>
      <!-- Tabs de filtro -->
      <div v-if="quinielas.length" class="tabs">
        <button
          v-for="t in tabs" :key="t.key"
          class="tab-btn"
          :class="{ active: filtro === t.key }"
          @click="filtro = t.key"
        >
          {{ t.label }}
          <span class="tab-count">{{ t.count }}</span>
        </button>
      </div>

      <!-- Sin quinielas (primera vez) -->
      <div v-if="!quinielas.length" class="empty-box">
        <div class="empty-icon"></div>
        <h2 class="empty-title">Todavía no tenés quinielas</h2>
        <p class="empty-desc">Creá la tuya o unite a una con el código que te mandaron</p>
        <div style="display:flex;gap:1rem;justify-content:center;margin-top:1.5rem">
          <button class="btn btn-secondary" @click="showJoinModal = true">Unirse con código</button>
          <button class="btn btn-primary" @click="abrirModalCrear">Crear quiniela</button>
        </div>
      </div>

      <!-- Sin resultados en el filtro activo -->
      <div v-else-if="!quinielasFiltradas.length" class="empty-filter">
        No tenés quinielas {{ tabs.find(t => t.key === filtro)?.label?.toLowerCase() }}
      </div>

      <!-- Lista de quinielas -->
      <div v-else class="quinielas-grid">
        <div
          v-for="p in quinielasFiltradas" :key="p.id"
          class="q-card card"
          :class="`q-card--${(p.quiniela?.status || '').toLowerCase()}`"
          @click="irAQuiniela(p.quiniela?.id)"
        >
          <!-- Cabecera -->
          <div class="q-card-top">
            <div class="q-info">
              <div class="q-name">{{ p.quiniela?.name }}</div>
              <div class="q-comp">
                {{ p.quiniela?.competition?.name }}
                <span v-if="p.quiniela?.owner?.username === auth.user?.username" class="q-org-badge">Organizador</span>
              </div>
            </div>
            <span :class="statusBadge(p.quiniela?.status)">{{ statusLabel(p.quiniela?.status) }}</span>
          </div>

          <!-- Stats -->
          <div class="q-stats">
            <div class="q-stat">
              <span class="q-stat-val accent">{{ p.total_points }}</span>
              <span class="q-stat-lbl">Puntos</span>
            </div>
            <div class="q-stat">
              <span class="q-stat-val">
                {{ p.rank || '—' }}
              </span>
              <span class="q-stat-lbl">Posición</span>
            </div>
            <div class="q-stat">
              <span class="q-stat-val">{{ p.exact_scores ?? 0 }}</span>
              <span class="q-stat-lbl">Exactos</span>
            </div>
            <div class="q-stat">
              <span class="q-stat-val">{{ p.correct_winners ?? 0 }}</span>
              <span class="q-stat-lbl">Ganadores</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="q-card-footer">
            <span class="q-jornadas">{{ p.jornadas_jugadas }} jornada{{ p.jornadas_jugadas !== 1 ? 's' : '' }} jugada{{ p.jornadas_jugadas !== 1 ? 's' : '' }}</span>
            <span class="q-code">{{ p.quiniela?.invite_code }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal crear quiniela -->
    <AppModal v-model="showCreateModal" title="NUEVA QUINIELA" size="lg" maxWidth="560px">

        <!-- Paso 1: Nombre -->
        <div class="form-group">
          <label>Nombre de la quiniela</label>
          <input v-model="createForm.name" placeholder="Ej: Clausura 2025 — Grupo del trabajo" />
        </div>

        <!-- Paso 2: Confederación -->
        <div class="form-group">
          <label>Confederación</label>
          <div class="conf-grid">
            <button
              v-for="conf in confederaciones"
              :key="conf.id"
              class="conf-btn"
              :class="{ active: createForm.confederacion === conf.id }"
              @click="onConfChange(conf.id)"
              type="button"
            >
              <span class="conf-emoji">{{ conf.emoji }}</span>
              <span class="conf-label">{{ conf.label }}</span>
            </button>
          </div>
        </div>

        <!-- Paso 3: Competencia -->
        <div class="form-group" v-if="createForm.confederacion">
          <label>Competencia</label>
          <select v-model="createForm.competition_id" @change="onCompChange">
            <option value="">Seleccioná una competencia</option>
            <option v-for="c in competenciasFiltradas" :key="c.id" :value="c.id">
              {{ c.name }}
            </option>
          </select>
        </div>

        <!-- Paso 4: Temporada -->
        <div class="form-group" v-if="createForm.competition_id && temporadas.length">
          <label>Temporada</label>
          <select v-model="createForm.season" @change="onSeasonChange">
            <option value="">Seleccioná temporada</option>
            <option v-for="t in temporadas" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>

        <!-- Paso 5: Torneo (Apertura/Clausura) -->
        <div class="form-group" v-if="createForm.season && torneos.length > 1">
          <label>Torneo</label>
          <div class="torneo-grid">
            <button
              v-for="t in torneos"
              :key="t.id"
              class="torneo-btn"
              :class="{ active: createForm.torneo === t.id }"
              @click="createForm.torneo = t.id"
              type="button"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Descripción -->
        <div class="form-group">
          <label>Descripción <span class="optional">opcional</span></label>
          <input v-model="createForm.description" placeholder="Ej: La quiniela del grupo del trabajo" />
        </div>

        <!-- Visibilidad: pública / privada -->
        <div class="visibility-row">
          <div class="visibility-opts">
            <button
              type="button"
              class="vis-btn"
              :class="{ active: !createForm.is_public }"
              @click="createForm.is_public = false"
            >
              <span class="vis-icon vis-icon--lock"></span>
              <span class="vis-label">Privada</span>
              <span class="vis-desc">Solo con código o link</span>
            </button>
            <button
              type="button"
              class="vis-btn"
              :class="{ active: createForm.is_public, disabled: !auth.user?.is_premium }"
              @click="createForm.is_public = auth.user?.is_premium ? true : false"
              :title="!auth.user?.is_premium ? 'Solo disponible en Premium' : ''"
            >
              <span class="vis-icon vis-icon--globe"></span>
              <span class="vis-label">
                Pública
                <span v-if="!auth.user?.is_premium" class="vis-premium-tag">Premium</span>
              </span>
              <span class="vis-desc">Aparece en el directorio</span>
            </button>
          </div>
        </div>

        <!-- Quiniela de pago -->
        <div class="paid-row">
          <label class="toggle-label">
            <input type="checkbox" v-model="createForm.is_paid" />
            <span>Quiniela de pago</span>
          </label>
          <div v-if="createForm.is_paid" class="form-group" style="margin:0;flex:1">
            <input v-model.number="createForm.entry_fee" type="number" min="1" placeholder="Monto en USD" />
          </div>
        </div>

        <!-- Reglas de puntuación -->
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
          <button class="btn btn-secondary" @click="cerrarModalCrear">Cancelar</button>
          <button class="btn btn-primary" @click="createQuiniela" :disabled="creating">
            {{ creating ? 'Creando...' : 'Crear Quiniela' }}
          </button>
        </div>
    </AppModal>

    <!-- Modal unirse -->
    <AppModal v-model="showJoinModal" title="UNIRSE A QUINIELA">
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
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import AppModal from '@/components/AppModal.vue'
import {
  CONFEDERACIONES,
  filtrarPorConfederacion,
  extraerTemporadas,
  extraerTorneos,
} from '@/utils/confederaciones'

const router = useRouter()
const auth   = useAuthStore()

const quinielas       = ref([])
const competencias    = ref([])
const matchdays       = ref([]) // jornadas de la competencia seleccionada
const temporadas      = ref([])
const torneos         = ref([])
const limites         = ref(null)
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

const filtro = ref('todas')

const puedeCrear = computed(() => {
  if (auth.isPremium) return true
  if (!limites.value) return true // aún cargando, no bloquear
  return limites.value.quinielas.creadas < limites.value.quinielas.limite
})

const tabs = computed(() => [
  { key: 'todas',      label: 'Todas',      count: quinielas.value.length },
  { key: 'activa',     label: 'Activas',    count: quinielas.value.filter(p => p.quiniela?.status === 'ACTIVA').length },
  { key: 'esperando',  label: 'Esperando',  count: quinielas.value.filter(p => p.quiniela?.status === 'ESPERANDO').length },
  { key: 'finalizada', label: 'Finalizadas',count: quinielas.value.filter(p => p.quiniela?.status === 'FINALIZADA').length },
].filter(t => t.key === 'todas' || t.count > 0))

const quinielasFiltradas = computed(() => {
  if (filtro.value === 'todas') return quinielas.value
  return quinielas.value.filter(p => (p.quiniela?.status || '').toLowerCase() === filtro.value)
})

const confederaciones = CONFEDERACIONES

const createForm = ref({
  name:           '',
  confederacion:  '',
  competition_id: '',
  season:         '',
  torneo:         '',
  description:    '',
  is_public:      false,
  is_paid:        false,
  entry_fee:      0,
  scoring: { exact_score_pts: 3, correct_winner_pts: 1 }
})

const competenciasFiltradas = computed(() =>
  filtrarPorConfederacion(competencias.value, createForm.value.confederacion)
)

onMounted(async () => {
  try {
    const [misRes, compRes, limitesRes] = await Promise.all([
      api.get('/quinielas/mis/quinielas'),
      api.get('/competitions'),
      api.get('/quinielas/mis/limites'),
    ])
    quinielas.value    = misRes.data
    competencias.value = compRes.data
    limites.value      = limitesRes.data
  } finally {
    loading.value = false
  }
})

function abrirModalCrear() {
  createForm.value = {
    name: '', confederacion: '', competition_id: '',
    season: '', torneo: '', description: '',
    is_public: false, is_paid: false, entry_fee: 0,
    scoring: { exact_score_pts: 3, correct_winner_pts: 1 }
  }
  matchdays.value  = []
  temporadas.value = []
  torneos.value    = []
  createError.value   = ''
  createSuccess.value = ''
  showCreateModal.value = true
}

function cerrarModalCrear() {
  showCreateModal.value = false
}

function onConfChange(confId) {
  createForm.value.confederacion  = confId
  createForm.value.competition_id = ''
  createForm.value.season         = ''
  createForm.value.torneo         = ''
  matchdays.value  = []
  temporadas.value = []
  torneos.value    = []
}

async function onCompChange() {
  createForm.value.season = ''
  createForm.value.torneo = ''
  temporadas.value = []
  torneos.value    = []
  if (!createForm.value.competition_id) return

  const res = await api.get(`/competitions/${createForm.value.competition_id}/matchdays`)
  matchdays.value  = res.data
  temporadas.value = extraerTemporadas(res.data)

  // Preseleccionar la temporada más reciente
  if (temporadas.value.length) {
    createForm.value.season = temporadas.value[0]
    onSeasonChange()
  }
}

function onSeasonChange() {
  createForm.value.torneo = ''
  torneos.value = extraerTorneos(matchdays.value, createForm.value.season)

  // Si solo hay un torneo, preseleccionarlo
  if (torneos.value.length === 1) {
    createForm.value.torneo = torneos.value[0].id
  }
}

async function createQuiniela() {
  createError.value   = ''
  createSuccess.value = ''

  if (!createForm.value.name) {
    createError.value = 'El nombre es obligatorio'; return
  }
  if (!createForm.value.competition_id) {
    createError.value = 'Seleccioná una competencia'; return
  }
  if (!createForm.value.season) {
    createError.value = 'Seleccioná una temporada'; return
  }
  if (!createForm.value.torneo) {
    createError.value = 'Seleccioná un torneo'; return
  }

  creating.value = true
  try {
    const payload = {
      name:           createForm.value.name,
      competition_id: createForm.value.competition_id,
      season:         createForm.value.season,
      torneo:         createForm.value.torneo,
      description:    createForm.value.description,
      is_public:      createForm.value.is_public,
      is_paid:        createForm.value.is_paid,
      entry_fee:      createForm.value.entry_fee,
      scoring:        createForm.value.scoring,
    }

    const res = await api.post('/quinielas', payload)
    createSuccess.value = `✓ Quiniela creada. Código: ${res.data.invite_code}`
    const [misRes, limitesRes] = await Promise.all([
      api.get('/quinielas/mis/quinielas'),
      api.get('/quinielas/mis/limites'),
    ])
    quinielas.value = misRes.data
    limites.value   = limitesRes.data
    setTimeout(() => {
      cerrarModalCrear()
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
.empty-icon  {
  width: 48px; height: 48px; border-radius: 50%;
  border: 2px dashed var(--border-light);
  margin: 0 auto 1rem;
}
.empty-title { font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem; }
.empty-desc  { color: var(--text-muted); font-size: 0.9rem; }

/* ── Tabs ──────────────────────────────────────────────────── */
.tabs { display: flex; gap: 0.35rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
.tab-btn {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.4rem 1rem; border-radius: 20px;
  border: 1px solid var(--border); background: transparent;
  color: var(--text-secondary); font-family: var(--font-body);
  font-size: 0.82rem; font-weight: 500; cursor: pointer;
  transition: all 0.15s;
}
.tab-btn:hover { border-color: var(--border-light); color: var(--text-primary); }
.tab-btn.active { background: var(--accent-glow); border-color: rgba(0,229,160,0.4); color: var(--accent); }
.tab-count {
  background: var(--bg-surface); border-radius: 10px;
  padding: 0.05rem 0.45rem; font-size: 0.72rem; color: var(--text-muted);
}
.tab-btn.active .tab-count { background: rgba(0,229,160,0.15); color: var(--accent); }

.empty-filter { text-align: center; padding: 3rem; color: var(--text-muted); font-size: 0.9rem; }

/* ── Cards ─────────────────────────────────────────────────── */
.quinielas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1rem; }

.q-card {
  cursor: pointer; transition: border-color 0.15s, transform 0.15s;
  display: flex; flex-direction: column; gap: 1rem;
  border-left: 3px solid transparent;
}
.q-card:hover { border-color: var(--border-light); transform: translateY(-2px); }
.q-card--activa    { border-left-color: var(--accent); }
.q-card--esperando { border-left-color: var(--accent-2); }
.q-card--finalizada{ border-left-color: var(--border-light); }

.q-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.q-info { flex: 1; min-width: 0; }
.q-name { font-weight: 600; color: var(--text-primary); font-size: 0.95rem; line-height: 1.3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.q-comp { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem; display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.q-org-badge { font-size: 0.7rem; color: #f5a623; }

.q-stats {
  display: flex; background: var(--bg-surface);
  border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border);
}
.q-stat { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 0.6rem 0.25rem; border-right: 1px solid var(--border); }
.q-stat:last-child { border-right: none; }
.q-stat-val { font-family: var(--font-display); font-size: 1.2rem; color: var(--text-primary); line-height: 1; }
.q-stat-val.accent { color: var(--accent); }
.q-stat-lbl { font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-top: 0.15rem; }

.q-card-footer { display: flex; align-items: center; justify-content: space-between; }
.q-jornadas { font-size: 0.75rem; color: var(--text-muted); }
.q-code { font-family: var(--font-display); font-size: 0.88rem; color: var(--accent-2); letter-spacing: 0.08em; }


/* Confederaciones */
.conf-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;
}
.conf-btn {
  display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
  padding: 0.75rem 0.5rem; border-radius: var(--radius);
  border: 1px solid var(--border); background: var(--bg-surface);
  cursor: pointer; transition: all 0.15s; color: var(--text-secondary);
  font-family: var(--font-body);
}
.conf-btn:hover { border-color: var(--border-light); color: var(--text-primary); }
.conf-btn.active { border-color: var(--accent); background: var(--accent-glow); color: var(--accent); }
.conf-emoji { font-size: 1.4rem; }
.conf-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.04em; }

/* Torneos */
.torneo-grid { display: flex; gap: 0.5rem; }
.torneo-btn {
  flex: 1; padding: 0.6rem; border-radius: var(--radius);
  border: 1px solid var(--border); background: var(--bg-surface);
  cursor: pointer; transition: all 0.15s; color: var(--text-secondary);
  font-family: var(--font-body); font-size: 0.9rem; font-weight: 500;
}
.torneo-btn:hover { border-color: var(--border-light); color: var(--text-primary); }
.torneo-btn.active { border-color: var(--accent); background: var(--accent-glow); color: var(--accent); }

.optional { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; text-transform: none; letter-spacing: 0; margin-left: 0.3rem; }

/* Visibilidad */
.visibility-row { margin-bottom: 1rem; }
.visibility-opts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
.vis-btn {
  display: flex; flex-direction: column; align-items: flex-start;
  gap: 0.15rem; padding: 0.75rem 1rem;
  border: 1px solid var(--border); border-radius: var(--radius);
  background: var(--bg-surface); cursor: pointer; text-align: left;
  transition: all 0.15s;
}
.vis-btn:hover:not(.disabled) { border-color: var(--accent); }
.vis-btn.active { border-color: var(--accent); background: var(--accent-glow); }
.vis-btn.disabled { opacity: 0.5; cursor: not-allowed; }
.vis-icon { display: block; width: 16px; height: 16px; margin-bottom: 0.3rem; }
.vis-icon--lock {
  border: 2px solid var(--text-secondary); border-radius: 3px; position: relative;
}
.vis-icon--lock::before {
  content: ''; position: absolute; top: -6px; left: 2px;
  width: 8px; height: 7px;
  border: 2px solid var(--text-secondary); border-bottom: none; border-radius: 4px 4px 0 0;
}
.vis-icon--globe {
  border: 2px solid var(--text-secondary); border-radius: 50%;
}
.vis-icon--globe::after {
  content: ''; display: block; width: 8px; height: 2px;
  background: var(--text-secondary); margin: 5px auto 0;
}
.vis-btn.active .vis-icon--lock,
.vis-btn.active .vis-icon--globe,
.vis-btn.active .vis-icon--lock::before { border-color: var(--accent); }
.vis-btn.active .vis-icon--globe::after { background: var(--accent); }
.vis-label { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem; }
.vis-desc  { font-size: 0.75rem; color: var(--text-muted); }
.vis-premium-tag {
  font-size: 0.62rem; font-weight: 700; padding: 0.1rem 0.35rem;
  background: var(--accent-glow); color: var(--accent);
  border-radius: 3px; text-transform: uppercase; letter-spacing: 0.04em;
}

.paid-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.toggle-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; white-space: nowrap; }
.scoring-section { background: var(--bg-surface); border-radius: var(--radius); padding: 1rem; margin-bottom: 1rem; }
.scoring-title { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.75rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.free-banner {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; flex-wrap: wrap;
  background: rgba(255,165,2,0.07); border: 1px solid rgba(255,165,2,0.25);
  border-radius: var(--radius); padding: 0.75rem 1.25rem; margin-bottom: 1.5rem;
  font-size: 0.88rem; color: var(--text-secondary);
}
.free-banner strong { color: var(--warning); }
.crear-btn-wrapper button:disabled { opacity: 0.45; cursor: not-allowed; }
.btn-sm { padding: 0.35rem 0.85rem; font-size: 0.8rem; }

@media (max-width: 540px) {
  .dash-header  { flex-direction: column; }
  .dash-actions { width: 100%; }
  .dash-actions .btn { flex: 1; }
  .conf-grid { grid-template-columns: repeat(2, 1fr); }
  .form-row  { grid-template-columns: 1fr; }
}
</style>
