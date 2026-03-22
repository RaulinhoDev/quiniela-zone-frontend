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
    <div v-if="data.quiniela.jornada_activa" class="card jornada-activa">
      <div class="ja-header">
        <div>
          <div class="ja-title">
            {{ jornadaCerrada ? '🔴' : '🟢' }}
            {{ data.quiniela.jornada_activa.matchday?.name || `Jornada ${data.quiniela.jornada_activa.round_number}` }}
            — {{ jornadaCerrada ? 'Cerrada' : 'Abierta' }}
          </div>
          <div class="ja-closes">
            {{ jornadaCerrada ? 'Cerró' : 'Cierra' }}: {{ formatDateTime(data.quiniela.jornada_activa.closes_at) }}
          </div>
        </div>

        <!-- Botón predecir — solo si la jornada sigue abierta -->
        <router-link
          v-if="!jornadaCerrada"
          :to="`/app/quinielas/${data.quiniela.id}/predecir/${data.quiniela.jornada_activa.id}`"
          :class="['btn', yaPredicé ? 'btn-secondary' : 'btn-primary']"
        >
          {{ yaPredicé ? '✓ Ya predije' : 'Predecir ahora →' }}
        </router-link>
        <span v-else-if="!yaPredicé" class="badge badge-gray">No predijiste</span>
        <span v-else class="badge badge-green">✓ Predicción enviada</span>
      </div>

      <!-- Partidos de la jornada activa con predicciones -->
      <div v-if="partidosJornada.length" class="partidos-jornada">
        <div v-for="p in partidosJornada" :key="p.match_id" class="partido-row">
          <div class="partido-equipos">
            <span class="equipo home">{{ p.home_team }}</span>
            <div class="marcadores">
              <div class="marcador-real">
                <span class="marcador-label">Real</span>
                <span class="marcador-val" :class="{ pending: !p.resultado }">
                  {{ p.resultado || 'vs' }}
                </span>
              </div>
              <div class="marcador-pred" v-if="misPredicciones[p.match_id]">
                <span class="marcador-label">Mi pred</span>
                <span class="marcador-val pred">
                  {{ misPredicciones[p.match_id].home_pred }} — {{ misPredicciones[p.match_id].away_pred }}
                </span>
              </div>
              <div class="marcador-pred" v-else>
                <span class="marcador-label">Mi pred</span>
                <span class="marcador-val pending">—</span>
              </div>
            </div>
            <span class="equipo away">{{ p.away_team }}</span>
          </div>
          <div class="partido-fecha">{{ formatDateTime(p.match_date) }}</div>
          <div v-if="p.status === 'FINISHED' && misPredicciones[p.match_id]" class="puntos-badge">
            <span :class="misPredicciones[p.match_id].points_earned > 0 ? 'badge badge-green' : 'badge badge-gray'">
              {{ misPredicciones[p.match_id].points_earned }} pts
            </span>
          </div>
        </div>
      </div>

      <!-- Aviso no predicó -->
      <div v-if="!yaPredicé && !jornadaCerrada" class="no-pred-hint">
        ⚠️ Todavía no predijiste esta jornada
      </div>

      <!-- Owner puede abrir la siguiente jornada aunque haya una activa cerrada -->
      <div v-if="isOwner && jornadaCerrada && data.quiniela.status !== 'FINALIZADA'" class="owner-next">
        <div class="on-title">👑 Las predicciones cerraron</div>
        <p class="on-desc">Cuando terminen los partidos e ingreses los resultados, podés abrir la siguiente jornada.</p>
        <button class="btn btn-primary btn-sm" @click="showAbrirModal = true">
          Abrir siguiente jornada
        </button>
      </div>
    </div>

    <!-- Panel owner — sin jornada activa -->
    <div v-if="isOwner && !data.quiniela.jornada_activa && data.quiniela.status !== 'FINALIZADA'" class="card owner-panel">
      <div class="op-title">👑 Sos el organizador</div>
      <p class="op-desc">Cuando estés listo, abrí la siguiente jornada para que los participantes puedan predecir.</p>
      <button class="btn btn-primary" @click="showAbrirModal = true">
        Abrir jornada {{ (data.quiniela.jornadas_jugadas || 0) + 1 }}
      </button>
    </div>

    <!-- Próxima jornada (solo si hay una activa y no está cerrada) -->
    <div v-if="proximaJornada && !jornadaCerrada" class="card proxima-jornada">
      <div class="pj-header">
        <div class="pj-title">📅 Próxima — {{ proximaJornada.name }}</div>
        <span class="badge badge-gray">Próximamente</span>
      </div>
      <div class="partidos-proxima">
        <div v-for="p in proximaJornada.matches" :key="p.id" class="partido-proxima">
          <span class="equipo-sm">{{ p.home_team }}</span>
          <span class="vs-sm">vs</span>
          <span class="equipo-sm">{{ p.away_team }}</span>
          <span class="fecha-sm">{{ formatDateTime(p.match_date) }}</span>
        </div>
      </div>
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
            <span v-if="i === 0" class="medal">🥇</span>
            <span v-else-if="i === 1" class="medal">🥈</span>
            <span v-else-if="i === 2" class="medal">🥉</span>
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

const data            = ref(null)
const matchdays       = ref([])
const partidosJornada = ref([])
const misPredicciones = ref({})
const proximaJornada  = ref(null)
const showAbrirModal  = ref(false)
const abriendo        = ref(false)
const abrirError      = ref('')
const toast           = ref('')
const abrirForm       = ref({ matchday_id: '', closes_at: '' })

const isOwner = computed(() =>
  data.value?.quiniela?.owner === auth.user?.username
)

// La jornada está cerrada si closes_at ya pasó
const jornadaCerrada = computed(() => {
  const j = data.value?.quiniela?.jornada_activa
  if (!j) return false
  return new Date() > new Date(j.closes_at)
})

// El usuario predicó si tiene al menos una predicción con home_pred definido
const yaPredicé = computed(() => {
  return Object.values(misPredicciones.value).some(
    p => p.home_pred !== undefined && p.home_pred !== null
  )
})

onMounted(async () => await loadData())

async function loadData() {
  const res  = await api.get(`/quinielas/${route.params.id}/ranking`)
  data.value = res.data

  const jornadaActiva = data.value?.quiniela?.jornada_activa
  if (jornadaActiva) {
    const predRes = await api.get(`/quinielas/${route.params.id}/jornadas/${jornadaActiva.id}/mis-predicciones`)
    partidosJornada.value = predRes.data?.partidos || []

    // Mapear solo si tiene prediccion real
    misPredicciones.value = {}
    for (const p of partidosJornada.value) {
      if (p.prediccion) {
        misPredicciones.value[p.match_id] = {
          home_pred:     p.prediccion.home,
          away_pred:     p.prediccion.away,
          points_earned: p.prediccion.puntos,
        }
      }
    }
  }

  // Cargar jornadas si es owner
  if (isOwner.value) {
    const q      = await api.get(`/quinielas/${route.params.id}`)
    const compId = q.data?.competition_id
    if (compId) {
      const mRes = await api.get(`/competitions/${compId}/matchdays`)
      matchdays.value = mRes.data

      if (jornadaActiva) {
        const ordenadas = mRes.data.sort((a, b) =>
          new Date(a.start_date) - new Date(b.start_date)
        )
        const idx = ordenadas.findIndex(j => j.id === jornadaActiva.matchday_id)
        if (idx !== -1 && ordenadas[idx + 1]) {
          const sigRes = await api.get(`/competitions/matchdays/${ordenadas[idx + 1].id}`)
          proximaJornada.value = sigRes.data
        }
      }
    }
  }
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
  const f = { HN:'🇭🇳', CR:'🇨🇷', GT:'🇬🇹', SV:'🇸🇻', NI:'🇳🇮', PA:'🇵🇦', BZ:'🇧🇿', MX:'🇲🇽', CO:'🇨🇴', AR:'🇦🇷', BR:'🇧🇷', US:'🇺🇸' }
  return f[c] || '🌎'
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
.back-link { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; display: block; margin-bottom: 0.5rem; }
.back-link:hover { color: var(--text-primary); }
.q-header  { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.q-title   { font-family: var(--font-display); font-size: 1.8rem; letter-spacing: 0.03em; }
.q-meta    { color: var(--text-muted); font-size: 0.82rem; margin-top: 0.3rem; }
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

.jornada-activa { margin-bottom: 1rem; border-color: rgba(0,229,160,0.3); }
.ja-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
.ja-title  { font-weight: 600; color: var(--text-primary); }
.ja-closes { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem; }

.partidos-jornada { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
.partido-row { background: var(--bg-surface); border-radius: var(--radius); padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.4rem; }
.partido-equipos { display: flex; align-items: center; gap: 0.75rem; }
.equipo { flex: 1; font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
.equipo.away { text-align: right; }

.marcadores { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; min-width: 120px; }
.marcador-real, .marcador-pred { display: flex; align-items: center; gap: 0.4rem; }
.marcador-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; min-width: 40px; text-align: right; }
.marcador-val   { font-family: var(--font-display); font-size: 0.95rem; color: var(--accent); letter-spacing: 0.05em; }
.marcador-val.pending { color: var(--text-muted); font-family: var(--font-body); font-size: 0.85rem; }
.marcador-val.pred    { color: var(--text-secondary); }

.partido-fecha { font-size: 0.75rem; color: var(--text-muted); }
.puntos-badge  { display: flex; justify-content: flex-end; }

.no-pred-hint {
  margin-top: 0.75rem; padding: 0.6rem 1rem;
  background: rgba(255,165,2,0.08); border-radius: var(--radius);
  font-size: 0.82rem; color: var(--warning);
}

.owner-next {
  margin-top: 1rem; padding: 1rem;
  background: rgba(255,165,2,0.06); border-radius: var(--radius);
  border: 1px solid rgba(255,165,2,0.2);
}
.on-title { font-weight: 600; color: var(--warning); margin-bottom: 0.3rem; font-size: 0.9rem; }
.on-desc  { color: var(--text-secondary); font-size: 0.82rem; margin-bottom: 0.75rem; }

.proxima-jornada { margin-bottom: 1rem; border-color: rgba(255,255,255,0.05); }
.pj-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.pj-title  { font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; }

.partidos-proxima { display: flex; flex-direction: column; gap: 0.4rem; }
.partido-proxima  { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; border-bottom: 1px solid var(--border); }
.partido-proxima:last-child { border-bottom: none; }
.equipo-sm { flex: 1; font-size: 0.82rem; color: var(--text-secondary); }
.equipo-sm:last-of-type { text-align: right; }
.vs-sm     { font-size: 0.75rem; color: var(--text-muted); }
.fecha-sm  { font-size: 0.72rem; color: var(--text-muted); min-width: 90px; text-align: right; }

.owner-panel { margin-bottom: 1rem; border-color: rgba(255,165,2,0.3); }
.op-title { font-weight: 600; color: var(--warning); margin-bottom: 0.4rem; }
.op-desc  { color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 1rem; }

.ranking-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.ranking-title  { font-family: var(--font-display); font-size: 1.3rem; letter-spacing: 0.05em; }
.ranking-total  { font-size: 0.8rem; color: var(--text-muted); }
.ranking-list   { display: flex; flex-direction: column; gap: 0.35rem; }

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