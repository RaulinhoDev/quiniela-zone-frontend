<template>
  <div class="page">
    <router-link :to="`/app/quinielas/${route.params.id}`" class="back-link">
      ← Volver a la quiniela
    </router-link>

    <div v-if="loading" class="empty-state">Cargando partidos...</div>

    <div v-else-if="jornadaData">
      <div class="pred-header">
        <h1 class="pred-title">
          Jornada {{ jornadaData.jornada.round_number }}
        </h1>
        <div class="pred-meta">
          {{ jornadaData.jornada.matchday }}
          <span class="dot">·</span>
          Cierra: {{ formatDateTime(jornadaData.jornada.closes_at) }}
        </div>
      </div>

      <!-- Advertencia si ya cerró -->
      <div v-if="isClosed" class="alert alert-info" style="margin-bottom:1rem">
        Esta jornada ya cerró — podés ver tus predicciones pero no editarlas
      </div>

      <!-- Partidos -->
      <div class="partidos-list">
        <div v-for="p in jornadaData.partidos" :key="p.match_id" class="partido-card card">
          <div class="partido-date">{{ formatDateTime(p.match_date) }}</div>

          <div class="partido-teams">
            <div class="team-col">
              <div class="team-logo">{{ p.home_team.charAt(0) }}</div>
              <div class="team-name">{{ p.home_team }}</div>
            </div>

            <div class="score-col">
              <!-- Resultado real si terminó -->
              <div v-if="p.resultado" class="resultado-real">
                {{ p.resultado }}
              </div>
              <!-- Inputs si está abierto -->
              <div v-else-if="!isClosed" class="score-inputs">
                <input
                  v-model.number="predicciones[p.match_id].home"
                  type="number" min="0" max="20"
                  class="score-input"
                  :class="{ filled: predicciones[p.match_id].home !== '' }"
                />
                <span class="score-sep">-</span>
                <input
                  v-model.number="predicciones[p.match_id].away"
                  type="number" min="0" max="20"
                  class="score-input"
                  :class="{ filled: predicciones[p.match_id].away !== '' }"
                />
              </div>
              <!-- Predicción ya enviada -->
              <div v-else-if="p.prediccion" class="prediccion-enviada">
                {{ p.prediccion.home }}-{{ p.prediccion.away }}
              </div>
              <!-- Sin predicción y cerrado -->
              <div v-else class="sin-prediccion">—</div>

              <!-- Puntos ganados -->
              <div v-if="p.prediccion && p.resultado" class="puntos-ganados">
                <span :class="p.prediccion.puntos > 0 ? 'pts-badge pts-ok' : 'pts-badge pts-no'">
                  {{ p.prediccion.puntos > 0 ? `+${p.prediccion.puntos} pts` : '0 pts' }}
                </span>
              </div>
            </div>

            <div class="team-col right">
              <div class="team-logo">{{ p.away_team.charAt(0) }}</div>
              <div class="team-name">{{ p.away_team }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contador de predicciones completadas -->
      <div v-if="!isClosed" class="pred-footer">
        <div class="pred-counter">
          <span :class="completadas === total ? 'counter-ok' : 'counter-pending'">
            {{ completadas }}/{{ total }} partidos completados
          </span>
        </div>
        <button
          class="btn btn-primary btn-lg"
          @click="enviarPredicciones"
          :disabled="completadas !== total || enviando"
        >
          {{ enviando ? 'Enviando...' : 'Enviar predicciones' }}
        </button>
      </div>

      <!-- Resumen si ya se enviaron -->
      <div v-if="enviado" class="alert alert-success" style="margin-top:1rem">
        ✓ Predicciones enviadas. ¡Buena suerte!
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

const jornadaData = ref(null)
const predicciones= ref({})
const loading     = ref(true)
const enviando    = ref(false)
const enviado     = ref(false)
const toast       = ref('')

const isClosed = computed(() => {
  if (!jornadaData.value) return false
  return new Date() > new Date(jornadaData.value.jornada.closes_at) ||
         jornadaData.value.jornada.status !== 'ABIERTA'
})

const total = computed(() => jornadaData.value?.partidos?.length || 0)

const completadas = computed(() =>
  Object.values(predicciones.value).filter(
    p => p.home !== '' && p.away !== '' && p.home !== null && p.away !== null
  ).length
)

onMounted(async () => {
  await loadJornada()
})

async function loadJornada() {
  loading.value = true
  try {
    const res = await api.get(
      `/quinielas/${route.params.id}/jornadas/${route.params.jornadaId}/mis-predicciones`
    )
    jornadaData.value = res.data

    // Inicializar predicciones
    for (const p of res.data.partidos) {
      predicciones.value[p.match_id] = {
        home: p.prediccion?.home ?? '',
        away: p.prediccion?.away ?? '',
      }
    }

    if (res.data.partidos.some(p => p.prediccion)) {
      enviado.value = true
    }
  } finally {
    loading.value = false
  }
}

async function enviarPredicciones() {
  enviando.value = true
  try {
    const payload = {
      predicciones: Object.entries(predicciones.value).map(([match_id, p]) => ({
        match_id: parseInt(match_id),
        home_pred: p.home,
        away_pred: p.away,
      }))
    }
    await api.post(
      `/quinielas/${route.params.id}/jornadas/${route.params.jornadaId}/predicciones`,
      payload
    )
    enviado.value = true
    showToast('✓ Predicciones enviadas. ¡Buena suerte!')
    await loadJornada()
  } catch (e) {
    showToast(e.response?.data?.message || 'Error al enviar predicciones')
  } finally {
    enviando.value = false
  }
}

function showToast(msg) {
  toast.value = msg
  setTimeout(() => { toast.value = '' }, 3500)
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('es-HN', {
    weekday: 'short', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
.back-link   { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; display: block; margin-bottom: 1rem; }
.back-link:hover { color: var(--text-primary); }
.empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }

.pred-header { margin-bottom: 1.5rem; }
.pred-title  { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.05em; }
.pred-meta   { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.3rem; }
.dot         { margin: 0 0.4rem; }

.partidos-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }

.partido-card { padding: 1.25rem 1.5rem; }
.partido-date { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem; text-transform: capitalize; }

.partido-teams {
  display: grid; grid-template-columns: 1fr auto 1fr;
  align-items: center; gap: 1rem;
}

.team-col { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
.team-col.right { }
.team-logo {
  width: 42px; height: 42px; border-radius: 50%;
  background: var(--bg-hover); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 1rem; color: var(--text-primary);
}
.team-name { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); text-align: center; }

.score-col { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }

.score-inputs { display: flex; align-items: center; gap: 0.5rem; }
.score-input {
  width: 54px; text-align: center;
  font-family: var(--font-display); font-size: 1.6rem;
  padding: 0.4rem; border-radius: var(--radius); background: var(--bg-surface);
  border: 2px solid var(--border); color: var(--text-primary);
  transition: border-color 0.15s;
}
.score-input.filled { border-color: var(--accent); }
.score-input:focus  { border-color: var(--accent); outline: none; box-shadow: 0 0 0 3px var(--accent-glow); }
.score-sep { font-family: var(--font-display); font-size: 1.4rem; color: var(--text-muted); }

.resultado-real    { font-family: var(--font-display); font-size: 1.8rem; color: var(--text-primary); letter-spacing: 0.1em; }
.prediccion-enviada{ font-family: var(--font-display); font-size: 1.4rem; color: var(--accent-2); letter-spacing: 0.08em; }
.sin-prediccion    { font-size: 1.2rem; color: var(--text-muted); }

.pts-badge { font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 20px; }
.pts-ok  { background: rgba(0,229,160,0.12); color: var(--accent); }
.pts-no  { background: rgba(136,146,176,0.1); color: var(--text-muted); }

.pred-footer {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.25rem 1.5rem;
  position: sticky; bottom: 1rem;
}
.counter-ok      { color: var(--accent); font-weight: 600; }
.counter-pending { color: var(--text-muted); }
</style>
