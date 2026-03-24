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
        <router-link :to="`/app/quinielas/${data.quiniela.id}/historial`" class="btn btn-secondary btn-sm">
          Mi historial
        </router-link>
        <div class="invite-actions">
          <div class="invite-code" @click="copyCode" title="Copiar código de invitación">
            <span class="code-label">Código</span>
            <span class="code-val">{{ data.quiniela.invite_code }}</span>
            <span class="code-copy">📋</span>
          </div>
          <button class="btn btn-secondary btn-sm invite-link-btn" @click="copyLink" title="Copiar link de invitación">
            🔗 Copiar link
          </button>
        </div>
      </div>
    </div>

    <!-- Estado ESPERANDO -->
    <div v-if="data.quiniela.status === 'ESPERANDO'" class="card esperando-card">
      <!-- Info de la quiniela -->
      <div class="eq-info-grid">
        <div class="eq-info-item">
          <span class="eq-info-label">Liga</span>
          <span class="eq-info-val">{{ data.quiniela.competition }}</span>
        </div>
        <div class="eq-info-item">
          <span class="eq-info-label">Temporada</span>
          <span class="eq-info-val">{{ data.quiniela.season }}</span>
        </div>
        <div class="eq-info-item">
          <span class="eq-info-label">Puntos por exacto</span>
          <span class="eq-info-val accent">{{ data.quiniela.scoring_rule?.exact_score_pts ?? 3 }} pts</span>
        </div>
        <div class="eq-info-item">
          <span class="eq-info-label">Puntos por ganador</span>
          <span class="eq-info-val accent">{{ data.quiniela.scoring_rule?.correct_winner_pts ?? 1 }} pts</span>
        </div>
        <div class="eq-info-item">
          <span class="eq-info-label">Participantes</span>
          <span class="eq-info-val">{{ data.total_participantes }}</span>
        </div>
        <div class="eq-info-item">
          <span class="eq-info-label">Organizador</span>
          <span class="eq-info-val">{{ data.quiniela.owner }}</span>
        </div>
      </div>

      <!-- Owner: botón abrir -->
      <div v-if="isOwner" class="eq-owner-section">
        <div class="eq-owner-title">👑 Sos el organizador</div>
        <p class="eq-owner-desc">Cuando todos estén listos, abrí la quiniela para que empiecen las predicciones. La jornada 1 se abrirá automáticamente.</p>
        <button class="btn btn-primary" @click="abrirQuiniela" :disabled="abriendo">
          {{ abriendo ? 'Abriendo...' : '🚀 Abrir quiniela' }}
        </button>
      </div>

      <!-- Participante: cartel de espera -->
      <div v-else class="eq-espera">
        <div class="eq-espera-icon">⏳</div>
        <div class="eq-espera-title">Esperando al organizador</div>
        <p class="eq-espera-desc">{{ data.quiniela.owner }} aún no abrió la quiniela. Te avisaremos cuando empiece.</p>
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

      <!-- Predicciones de todos + puntos por jornada (solo si hay partidos terminados) -->
      <div v-if="partidosTerminados.length" class="engagement-section">
        <div class="eng-tabs">
          <button :class="['eng-tab', { active: engTab === 'preds' }]" @click="engTab = 'preds'">
            Ver predicciones de todos
          </button>
          <button :class="['eng-tab', { active: engTab === 'puntos' }]" @click="engTab = 'puntos'; cargarPuntosJornada()">
            Puntos esta jornada
          </button>
        </div>

        <!-- Tab: predicciones de todos -->
        <div v-if="engTab === 'preds'">
          <div v-if="cargandoPreds" class="eng-loading">Cargando...</div>
          <div v-else-if="todasPreds.length" class="preds-table-wrap">
            <div v-for="partido in todasPreds" :key="partido.match_id" class="pred-partido">
              <div class="pred-partido-header">
                <span class="pred-equipo">{{ partido.home_team }}</span>
                <span class="pred-resultado">{{ partido.resultado }}</span>
                <span class="pred-equipo right">{{ partido.away_team }}</span>
              </div>
              <div class="pred-rows">
                <div v-for="p in partido.predicciones" :key="p.user_id"
                  class="pred-row"
                  :class="{
                    'pred-row--me':     p.user_id === auth.user?.id,
                    'pred-row--exacto': p.puntos > 0 && p.prediccion === partido.resultado,
                    'pred-row--puntos': p.puntos > 0 && p.prediccion !== partido.resultado,
                  }">
                  <router-link
                    :to="p.user_id === auth.user?.id ? '/app/perfil' : `/app/usuarios/${p.username}`"
                    class="pred-username pred-username-link"
                  >{{ p.username }}</router-link>
                  <span class="pred-val">{{ p.prediccion || '—' }}</span>
                  <span class="pred-pts" :class="p.puntos > 0 ? 'pts-ok' : 'pts-zero'">
                    +{{ p.puntos }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab: puntos esta jornada -->
        <div v-if="engTab === 'puntos'">
          <div v-if="cargandoPuntos" class="eng-loading">Cargando...</div>
          <div v-else-if="puntosJornada.length" class="puntos-list">
            <div v-for="(p, i) in puntosJornada" :key="p.user_id"
              class="puntos-row"
              :class="{ 'puntos-row--me': p.user_id === auth.user?.id }">
              <span class="pj-pos">{{ i + 1 }}</span>
              <span class="pj-username">{{ p.username }}</span>
              <span class="pj-pts">{{ p.puntos_jornada }} pts</span>
              <span v-if="p.user_id !== auth.user?.id" class="pj-diff"
                :class="p.diff_conmigo > 0 ? 'diff-mas' : p.diff_conmigo < 0 ? 'diff-menos' : 'diff-igual'">
                {{ p.diff_conmigo > 0 ? `+${p.diff_conmigo} sobre vos` : p.diff_conmigo < 0 ? `${p.diff_conmigo} bajo vos` : 'Empate' }}
              </span>
              <span v-else class="pj-diff diff-igual">vos</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Aviso jornada cerrada esperando resultados -->
      <div v-if="isOwner && jornadaCerrada" class="owner-next">
        <div class="on-title">⏳ Predicciones cerradas</div>
        <p class="on-desc">Cuando terminen todos los partidos, la siguiente jornada se abrirá automáticamente.</p>
      </div>
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
        <div class="ranking-header-right">
          <span class="ranking-total">{{ data.total_participantes }} participantes</span>
          <button class="btn btn-secondary btn-sm" @click="compartirTabla" :disabled="compartiendo">
            {{ compartiendo ? 'Generando...' : '↑ Compartir tabla' }}
          </button>
        </div>
      </div>
      <TransitionGroup name="rank" tag="div" class="ranking-list">
        <div
          v-for="(p, i) in data.ranking" :key="p.user.id"
          class="ranking-row"
          :class="{
            'my-row':       p.user.id === auth.user?.id,
            'row-moved-up': rankMovement.get(p.user.id)?.diff > 0,
            'row-moved-down': rankMovement.get(p.user.id)?.diff < 0,
          }"
          style="cursor:pointer"
          @click="router.push(p.user.id == auth.user?.id ? '/app/perfil' : `/app/usuarios/${p.user.username}`)"
        >
          <div class="rr-rank">
            <span v-if="p.rank === 1" class="medal">🥇</span>
            <span v-else-if="p.rank === 2" class="medal">🥈</span>
            <span v-else-if="p.rank === 3" class="medal">🥉</span>
            <span v-else class="rank-num">{{ p.rank }}</span>
          </div>
          <div class="rr-user">
            <span class="rr-username">
              {{ p.user.username }}
              <span v-if="p.user.id == auth.user?.id" class="you-badge">vos</span>
            </span>
            <span class="rr-country">{{ countryFlag(p.user.country) }}</span>
          </div>
          <div class="rr-stats">
            <span class="rr-pts">{{ p.total_points }} <small>pts</small></span>
            <span class="rr-detail">{{ p.exact_scores }}✓ {{ p.correct_winners }}△</span>
          </div>
          <!-- Flecha de movimiento -->
          <div class="rr-movement" v-if="rankMovement.get(p.user.id)">
            <span v-if="rankMovement.get(p.user.id).diff > 0" class="move-up">
              ▲ {{ rankMovement.get(p.user.id).diff }}
            </span>
            <span v-else-if="rankMovement.get(p.user.id).diff < 0" class="move-down">
              ▼ {{ Math.abs(rankMovement.get(p.user.id).diff) }}
            </span>
            <span v-else class="move-same">—</span>
          </div>
        </div>
      </TransitionGroup>

      <!-- Paginación de ranking -->
      <div v-if="data.pagination && data.pagination.total_pages > 1" class="ranking-pagination">
        <button
          class="btn btn-secondary btn-sm"
          :disabled="rankingPage <= 1"
          @click="cambiarPaginaRanking(rankingPage - 1)"
        >← Anterior</button>
        <span class="pagination-info">
          {{ rankingPage }} / {{ data.pagination.total_pages }}
        </span>
        <button
          class="btn btn-secondary btn-sm"
          :disabled="rankingPage >= data.pagination.total_pages"
          @click="cambiarPaginaRanking(rankingPage + 1)"
        >Siguiente →</button>
      </div>
    </div>


    <!-- Tarjeta oculta para captura de imagen -->
    <RankingCard
      v-if="data"
      ref="rankingCardRef"
      :quiniela="data.quiniela"
      :ranking="data.ranking"
    />

    <transition name="toast">
      <div v-if="toast" class="toast">{{ toast }}</div>
    </transition>
  </div>

  <div v-else class="empty-state page">Cargando quiniela...</div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import html2canvas from 'html2canvas'
import RankingCard from '@/components/RankingCard.vue'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

const data            = ref(null)
const partidosJornada = ref([])
const misPredicciones = ref({})
const proximaJornada  = ref(null)
const toast           = ref('')

const isOwner        = computed(() => data.value?.quiniela?.owner === auth.user?.username)

// Engagement
const engTab         = ref('preds')
const todasPreds     = ref([])
const puntosJornada  = ref([])
const cargandoPreds  = ref(false)
const cargandoPuntos = ref(false)
const partidosTerminados = computed(() =>
  partidosJornada.value.filter(p => p.resultado !== null)
)
const rankingPage    = ref(1)
const rankingCardRef = ref(null)
const compartiendo   = ref(false)
const abriendo       = ref(false)
const previousRanks  = ref(new Map())   // userId → posición inicial
const rankMovement   = ref(new Map())   // userId → { diff }
let   sseConnection  = null
let   initialLoadDone = false

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

onMounted(async () => {
  await loadData()
  startSse()
})

onUnmounted(() => {
  if (sseConnection) sseConnection.close()
})

function startSse() {
  const id = route.params.id
  sseConnection = new EventSource(`/api/v1/events/quinielas/${id}`)
  sseConnection.onmessage = async (e) => {
    try {
      const event = JSON.parse(e.data)
      if (event.type === 'resultado') {
        const miPosAntes = data.value?.ranking?.findIndex(p => p.user.id === auth.user?.id) ?? -1
        showToast(`⚽ ${event.homeTeam} ${event.homeScore}-${event.awayScore} ${event.awayTeam}`)
        await loadData()
        // Recargar predicciones de todos si el tab está visible
        const jornadaActiva = data.value?.quiniela?.jornada_activa
        if (jornadaActiva && todasPreds.value.length) cargarTodasPreds()

        // Alerta d) — alguien me superó
        const miPosAhora = data.value?.ranking?.findIndex(p => p.user.id === auth.user?.id) ?? -1
        if (miPosAntes !== -1 && miPosAhora > miPosAntes) {
          const nuevoLider = data.value.ranking[miPosAhora - 1]
          if (nuevoLider) showToast(`⚠️ ¡${nuevoLider.user.username} te superó en el ranking!`)
        }
      }
    } catch {}
  }
  sseConnection.onerror = () => {
    // Reconexión automática manejada por el navegador
  }
}

async function loadData() {
  const res  = await api.get(`/quinielas/${route.params.id}/ranking`, {
    params: { page: rankingPage.value, limit: 20 }
  })

  const newRanking = res.data.ranking || []

  if (!initialLoadDone) {
    // Primera carga: guardar posiciones base, sin mostrar flechas
    previousRanks.value = new Map(newRanking.map((p, i) => [p.user.id, i]))
    rankMovement.value  = new Map()
    initialLoadDone     = true
  } else {
    // Carga por SSE: calcular movimientos
    const movements = new Map()
    newRanking.forEach((p, newPos) => {
      const oldPos = previousRanks.value.get(p.user.id)
      if (oldPos !== undefined) {
        movements.set(p.user.id, { diff: oldPos - newPos }) // positivo = subió
      }
    })
    rankMovement.value = movements

    // Limpiar flechas después de 5 segundos
    setTimeout(() => { rankMovement.value = new Map() }, 5000)
  }

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

    // Si hay partidos terminados, cargar predicciones de todos
    const hayTerminados = predRes.data?.partidos?.some(p => p.resultado !== null)
    if (hayTerminados) cargarTodasPreds()
  }

}

async function cargarTodasPreds() {
  const jornadaId = data.value?.quiniela?.jornada_activa?.id
  if (!jornadaId) return
  cargandoPreds.value = true
  try {
    const res = await api.get(`/quinielas/${route.params.id}/jornadas/${jornadaId}/todas-predicciones`)
    todasPreds.value = res.data.partidos || []
  } finally {
    cargandoPreds.value = false
  }
}

async function cargarPuntosJornada() {
  const jornadaId = data.value?.quiniela?.jornada_activa?.id
  if (!jornadaId || puntosJornada.value.length) return
  cargandoPuntos.value = true
  try {
    const res = await api.get(`/quinielas/${route.params.id}/jornadas/${jornadaId}/puntos`)
    puntosJornada.value = res.data
  } finally {
    cargandoPuntos.value = false
  }
}

async function cambiarPaginaRanking(page) {
  rankingPage.value = page
  const res = await api.get(`/quinielas/${route.params.id}/ranking`, {
    params: { page, limit: 20 }
  })
  data.value = { ...data.value, ranking: res.data.ranking, pagination: res.data.pagination }
}

async function compartirTabla() {
  compartiendo.value = true
  try {
    const el = rankingCardRef.value?.cardRef
    if (!el) return

    const canvas = await html2canvas(el, {
      backgroundColor: '#0d1117',
      scale: 2,
      useCORS: true,
      logging: false,
    })

    const nombreArchivo = `ranking-${data.value.quiniela.name.replace(/\s+/g, '-').toLowerCase()}.png`

    // Móvil con Web Share API
    if (navigator.share && navigator.canShare) {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], nombreArchivo, { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Ranking — ${data.value.quiniela.name}`,
            text:  '¡Mirá el ranking de nuestra quiniela! 🏆',
            files: [file],
          })
        } else {
          descargarImagen(canvas, nombreArchivo)
        }
      }, 'image/png')
    } else {
      // Desktop: descargar
      descargarImagen(canvas, nombreArchivo)
    }
  } catch (e) {
    showToast('Error al generar la imagen')
  } finally {
    compartiendo.value = false
  }
}

function descargarImagen(canvas, nombre) {
  const a    = document.createElement('a')
  a.href     = canvas.toDataURL('image/png')
  a.download = nombre
  a.click()
}

async function abrirQuiniela() {
  abriendo.value = true
  try {
    await api.post(`/quinielas/${route.params.id}/abrir`)
    showToast('🚀 ¡Quiniela abierta! La jornada 1 ya está disponible.')
    await loadData()
  } catch (e) {
    showToast(e?.response?.data?.message || 'Error al abrir la quiniela')
  } finally {
    abriendo.value = false
  }
}

async function copyCode() {
  await navigator.clipboard.writeText(data.value?.quiniela?.invite_code)
  showToast('✓ Código copiado')
}

async function copyLink() {
  const id = route.params.id
  const link = `${window.location.origin}/q/${id}`
  if (navigator.share) {
    try {
      await navigator.share({
        title: data.value?.quiniela?.name,
        text:  '¡Únete a mi quiniela en Quiniela Zone!',
        url:   link,
      })
      return
    } catch {}
  }
  await navigator.clipboard.writeText(link)
  showToast('✓ Link copiado — compartilo con tus amigos')
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

.invite-actions { display: flex; align-items: center; gap: 0.5rem; }
.invite-link-btn { white-space: nowrap; }

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

/* Engagement section */
.engagement-section { margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem; }
.eng-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.eng-tab {
  padding: 0.4rem 0.9rem; border-radius: var(--radius); border: 1px solid var(--border);
  background: transparent; color: var(--text-muted); cursor: pointer; font-size: 0.82rem;
  transition: all 0.15s;
}
.eng-tab.active { background: var(--accent-glow); border-color: var(--accent); color: var(--accent); }
.eng-loading { text-align: center; padding: 1.5rem; color: var(--text-muted); font-size: 0.85rem; }

/* Predicciones de todos */
.pred-partido { margin-bottom: 1rem; }
.pred-partido-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.4rem 0.75rem; background: var(--bg-surface);
  border-radius: var(--radius) var(--radius) 0 0;
  font-size: 0.82rem;
}
.pred-equipo       { flex: 1; font-weight: 600; }
.pred-equipo.right { text-align: right; }
.pred-resultado    { font-family: var(--font-display); color: var(--accent); padding: 0 0.75rem; }
.pred-rows { border: 1px solid var(--border); border-top: none; border-radius: 0 0 var(--radius) var(--radius); overflow: hidden; }
.pred-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.45rem 0.75rem; border-bottom: 1px solid var(--border);
  font-size: 0.82rem; transition: background 0.1s;
}
.pred-row:last-child { border-bottom: none; }
.pred-row--me      { background: var(--accent-glow); }
.pred-row--exacto  { border-left: 3px solid #00e5a0; }
.pred-row--puntos  { border-left: 3px solid var(--warning); }
.pred-username { flex: 1; color: var(--text-secondary); }
.pred-username-link { flex: 1; color: var(--text-secondary); text-decoration: none; }
.pred-username-link:hover { color: var(--accent); }
.pred-val      { font-family: var(--font-display); font-size: 0.9rem; min-width: 40px; text-align: center; }
.pred-pts      { min-width: 32px; text-align: right; font-size: 0.78rem; font-weight: 700; }
.pts-ok   { color: #00e5a0; }
.pts-zero { color: var(--text-muted); }

/* Puntos por jornada */
.puntos-list { display: flex; flex-direction: column; gap: 0.3rem; }
.puntos-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.5rem 0.75rem; border-radius: var(--radius);
  background: var(--bg-surface); font-size: 0.85rem;
}
.puntos-row--me { background: var(--accent-glow); border: 1px solid rgba(0,229,160,0.2); }
.pj-pos      { width: 20px; color: var(--text-muted); font-size: 0.78rem; text-align: center; }
.pj-username { flex: 1; font-weight: 500; }
.pj-pts      { font-family: var(--font-display); color: var(--accent); font-size: 0.95rem; }
.pj-diff     { font-size: 0.72rem; font-weight: 700; min-width: 90px; text-align: right; }
.diff-mas    { color: #ff5e5e; }
.diff-menos  { color: #00e5a0; }
.diff-igual  { color: var(--text-muted); }

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


.ranking-header       { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.ranking-header-right { display: flex; align-items: center; gap: 0.75rem; }
.ranking-title        { font-family: var(--font-display); font-size: 1.3rem; letter-spacing: 0.05em; }
.ranking-total        { font-size: 0.8rem; color: var(--text-muted); }
.ranking-list   { display: flex; flex-direction: column; gap: 0.35rem; }

.ranking-row {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.75rem 1rem; border-radius: var(--radius);
  background: var(--bg-surface); transition: background 0.4s, transform 0.4s;
}
.ranking-row:hover { background: var(--bg-hover); }
.ranking-row.my-row { background: var(--accent-glow); border: 1px solid rgba(0,229,160,0.2); }
.ranking-row.row-moved-up   { background: rgba(0,229,160,0.08); }
.ranking-row.row-moved-down { background: rgba(255,94,94,0.06); }

/* Animación TransitionGroup */
.rank-move        { transition: transform 0.5s ease; }
.rank-enter-active { transition: all 0.4s ease; }
.rank-leave-active { transition: all 0.3s ease; }
.rank-enter-from  { opacity: 0; transform: translateY(-8px); }
.rank-leave-to    { opacity: 0; transform: translateY(8px); }

/* Flechas */
.rr-movement { min-width: 36px; text-align: right; font-size: 0.72rem; font-weight: 700; }
.move-up     { color: #00e5a0; }
.move-down   { color: #ff5e5e; }
.move-same   { color: var(--text-muted); }

.rr-rank  { width: 32px; text-align: center; flex-shrink: 0; }
.medal    { font-size: 1.2rem; }
.rank-num { font-family: var(--font-display); font-size: 1.1rem; color: var(--text-muted); }
.rr-user  { flex: 1; display: flex; align-items: center; gap: 0.5rem; }
.rr-username { font-weight: 500; color: var(--text-primary); font-size: 0.92rem; }
.rr-username-link { font-weight: 500; color: var(--text-primary); font-size: 0.92rem; text-decoration: none; }
.rr-username-link:hover { color: var(--accent); }
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

.ranking-pagination {
  display: flex; align-items: center; justify-content: center;
  gap: 1rem; margin-top: 1rem; padding-top: 1rem;
  border-top: 1px solid var(--border);
}
.pagination-info { font-size: 0.85rem; color: var(--text-muted); }
.btn-sm { padding: 0.35rem 0.85rem; font-size: 0.82rem; }

.toast {
  position: fixed; bottom: 2rem; right: 2rem;
  background: var(--bg-card); border: 1px solid var(--accent);
  color: var(--accent); padding: 0.85rem 1.5rem;
  border-radius: var(--radius); font-weight: 600;
  box-shadow: var(--shadow); z-index: 999;
}
.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* Estado ESPERANDO */
.esperando-card { margin-bottom: 1.5rem; }

.eq-info-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem; margin-bottom: 1.5rem;
}
.eq-info-item {
  display: flex; flex-direction: column; gap: 0.2rem;
  background: var(--bg-surface); border-radius: var(--radius);
  padding: 0.75rem 1rem;
}
.eq-info-label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.eq-info-val   { font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
.eq-info-val.accent { color: var(--accent); font-family: var(--font-display); }

.eq-owner-section {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.75rem; padding: 1.5rem; text-align: center;
  border-top: 1px solid var(--border);
}
.eq-owner-title { font-weight: 700; font-size: 1rem; color: var(--text-primary); }
.eq-owner-desc  { font-size: 0.84rem; color: var(--text-secondary); max-width: 380px; }

.eq-espera {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 2rem; text-align: center;
  border-top: 1px solid var(--border);
}
.eq-espera-icon  { font-size: 2rem; }
.eq-espera-title { font-weight: 700; font-size: 1.05rem; color: var(--text-primary); }
.eq-espera-desc  { font-size: 0.84rem; color: var(--text-muted); max-width: 320px; }
</style>