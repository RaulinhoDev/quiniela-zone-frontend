<template>
  <div class="page" v-if="data">
    <!-- Header -->
    <div class="q-header">
      <div class="q-header-left">
        <router-link to="/app/dashboard" class="back-link">← Mis quinielas</router-link>
        <h1 class="q-title">{{ data.quiniela.name }}</h1>
        <div class="q-meta">
          {{ data.quiniela.competition }} · {{ data.quiniela.season }} ·
          {{ data.quiniela.jornadas_jugadas }} jornadas jugadas
        </div>
      </div>
      <div class="q-header-right">
        <span :class="statusBadge(data.quiniela.status)">{{ statusLabel(data.quiniela.status) }}</span>
        <div class="invite-code" @click="copyCode" title="Copiar código">
          <span class="code-label">Código</span>
          <span class="code-val">{{ data.quiniela.invite_code }}</span>
          <span class="code-copy">📋</span>
        </div>
      </div>
    </div>

    <!-- Jornada activa -->
    <div v-if="data.quiniela.jornada_activa" class="jornada-activa card">
      <div class="ja-header">
        <div>
          <div class="ja-title">🟢 Jornada {{ data.quiniela.jornada_activa.round_number }} — Abierta</div>
          <div class="ja-closes">
            Cierra: {{ formatDateTime(data.quiniela.jornada_activa.closes_at) }}
          </div>
        </div>
        <router-link
          :to="`/app/quinielas/${data.quiniela.id}/predecir/${data.quiniela.jornada_activa.id}`"
          class="btn btn-primary"
        >
          {{ yaPredicé ? '✓ Ver mis predicciones' : 'Predecir ahora →' }}
        </router-link>
      </div>
    </div>

    <!-- Abrir jornada (solo owner) -->
    <div v-else-if="isOwner && data.quiniela.status !== 'FINALIZADA'" class="card owner-panel">
      <div class="op-title">👑 Sos el organizador</div>
      <p class="op-desc">Cuando estés listo, abrí la siguiente jornada para que los participantes puedan predecir.</p>
      <button class="btn btn-primary" @click="showAbrirModal = true">
        Abrir jornada {{ (data.quiniela.jornadas_jugadas || 0) + 1 }}
      </button>
    </div>

    <!-- Ranking -->
    <div class="card ranking-card">
      <div class="ranking-header">
        <h2 class="ranking-title">Ranking acumulado</h2>
        <span class="ranking-total">{{ data.total_participantes }} participantes</span>
      </div>

      <div class="ranking-list">
        <div
          v-for="(p, i) in data.ranking" :key="p.user.id"
          class="ranking-row"
          :class="{ 'my-row': p.user.id === auth.user?.id }"
        >
          <div class="rr-rank">
            <span v-if="i === 0" class="medal gold">🥇</span>
            <span v-else-if="i === 1" class="medal silver">🥈</span>
            <span v-else-if="i === 2" class="medal bronze">🥉</span>
            <span v-else class="rank-num">{{ i + 1 }}</span>
          </div>

          <div class="rr-user">
            <span class="rr-username">
              {{ p.user.username }}
              <span v-if="p.user.id === auth.user?.id" class="you-badge">vos</span>
            </span>
            <span class="rr-country">{{ countryFlag(p.user.country) }}</span>
          </div>

          <div class="rr-stats">
            <span class="rr-pts">{{ p.total_points }} <small>pts</small></span>
            <span class="rr-detail">{{ p.exact_scores }}✓ {{ p.correct_winners }}△</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal abrir jornada -->
    <div v-if="showAbrirModal" class="modal-overlay" @click.self="showAbrirModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">ABRIR JORNADA</span>
          <button class="modal-close" @click="showAbrirModal = false">✕</button>
        </div>
        <div class="form-group">
          <label>Jornada a abrir</label>
          <select v-model="abrirForm.matchday_id">
            <option value="">Seleccioná jornada</option>
            <option v-for="j in matchdays" :key="j.id" :value="j.id">
              {{ j.name }} — {{ formatDate(j.start_date) }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Fecha límite para predecir</label>
          <input v-model="abrirForm.closes_at" type="datetime-local" />
        </div>
        <div v-if="abrirError" class="alert alert-error">{{ abrirError }}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAbrirModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="abrirJornada" :disabled="abriendo">
            {{ abriendo ? 'Abriendo...' : 'Abrir jornada' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>

  <div v-else class="empty-state page">Cargando quiniela...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const route = useRoute()
const auth  = useAuthStore()

const data          = ref(null)
const matchdays     = ref([])
const showAbrirModal= ref(false)
const abriendo      = ref(false)
const abrirError    = ref('')
const toast         = ref('')
const abrirForm     = ref({ matchday_id: '', closes_at: '' })

const isOwner = computed(() =>
  data.value?.quiniela?.owner === auth.user?.username
)

const yaPredicé = computed(() => false) // TODO: verificar predicciones

onMounted(async () => {
  await loadData()
})

async function loadData() {
  const res = await api.get(`/quinielas/${route.params.id}/ranking`)
  data.value = res.data

  // Cargar jornadas disponibles si es owner
  if (isOwner.value) {
    const compId = await getCompetitionId()
    if (compId) {
      const mRes = await api.get(`/competitions/${compId}/matchdays`)
      matchdays.value = mRes.data
    }
  }
}

async function getCompetitionId() {
  const q = await api.get(`/quinielas/${route.params.id}`)
  return q.data?.competition_id
}

async function abrirJornada() {
  abrirError.value = ''
  if (!abrirForm.value.matchday_id || !abrirForm.value.closes_at) {
    abrirError.value = 'Seleccioná la jornada y la fecha límite'
    return
  }
  abriendo.value = true
  try {
    await api.post(`/quinielas/${route.params.id}/jornadas`, abrirForm.value)
    showToast('✓ Jornada abierta')
    showAbrirModal.value = false
    await loadData()
  } catch (e) {
    abrirError.value = e.response?.data?.message || 'Error al abrir jornada'
  } finally {
    abriendo.value = false
  }
}

async function copyCode() {
  await navigator.clipboard.writeText(data.value?.quiniela?.invite_code)
  showToast('Código copiado al portapapeles')
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
function countryFlag(c) {
  const flags = { HN:'🇭🇳', CR:'🇨🇷', GT:'🇬🇹', SV:'🇸🇻', NI:'🇳🇮', PA:'🇵🇦', BZ:'🇧🇿', MX:'🇲🇽', US:'🇺🇸' }
  return flags[c] || '🌎'
}
function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-HN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
}
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-HN', { day:'2-digit', month:'short' })
}
</script>

<style scoped>
.back-link  { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; display: block; margin-bottom: 0.5rem; }
.back-link:hover { color: var(--text-primary); }
.q-header   { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.q-title    { font-family: var(--font-display); font-size: 1.8rem; letter-spacing: 0.03em; }
.q-meta     { color: var(--text-muted); font-size: 0.82rem; margin-top: 0.3rem; }
.q-header-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; }

.invite-code {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 0.5rem 0.9rem;
  cursor: pointer; transition: border-color 0.15s;
}
.invite-code:hover { border-color: var(--accent); }
.code-label { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; }
.code-val   { font-family: var(--font-display); font-size: 1rem; color: var(--accent); letter-spacing: 0.1em; }
.code-copy  { font-size: 0.85rem; }

.jornada-activa { margin-bottom: 1rem; border-color: rgba(0,229,160,0.3); }
.ja-header  { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.ja-title   { font-weight: 600; color: var(--text-primary); }
.ja-closes  { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }

.owner-panel { margin-bottom: 1rem; border-color: rgba(255,165,2,0.3); }
.op-title { font-weight: 600; color: var(--warning); margin-bottom: 0.4rem; }
.op-desc  { color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 1rem; }

.ranking-card { }
.ranking-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.ranking-title  { font-family: var(--font-display); font-size: 1.3rem; letter-spacing: 0.05em; }
.ranking-total  { font-size: 0.8rem; color: var(--text-muted); }

.ranking-list { display: flex; flex-direction: column; gap: 0.35rem; }

.ranking-row {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.75rem 1rem; border-radius: var(--radius);
  background: var(--bg-surface); transition: background 0.12s;
}
.ranking-row:hover { background: var(--bg-hover); }
.ranking-row.my-row { background: var(--accent-glow); border: 1px solid rgba(0,229,160,0.2); }

.rr-rank  { width: 32px; text-align: center; flex-shrink: 0; }
.medal    { font-size: 1.2rem; }
.rank-num { font-family: var(--font-display); font-size: 1.1rem; color: var(--text-muted); }

.rr-user  { flex: 1; display: flex; align-items: center; gap: 0.5rem; }
.rr-username { font-weight: 500; color: var(--text-primary); font-size: 0.92rem; }
.you-badge {
  background: var(--accent-glow); color: var(--accent);
  font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.4rem;
  border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;
}
.rr-country { font-size: 1rem; }

.rr-stats { display: flex; flex-direction: column; align-items: flex-end; }
.rr-pts   { font-family: var(--font-display); font-size: 1.2rem; color: var(--accent); }
.rr-pts small { font-family: var(--font-body); font-size: 0.7rem; color: var(--text-muted); }
.rr-detail{ font-size: 0.72rem; color: var(--text-muted); }

.empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
</style>
