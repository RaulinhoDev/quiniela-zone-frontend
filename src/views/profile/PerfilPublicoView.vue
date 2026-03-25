<template>
  <div class="page" v-if="perfil">
    <router-link to="/app/dashboard" class="back-link">← Volver</router-link>

    <div class="pub-card card">
      <div class="pub-avatar">{{ initial }}</div>
      <div class="pub-name">{{ perfil.full_name || perfil.username }}</div>
      <div class="pub-username">@{{ perfil.username }}</div>
      <div class="pub-country">{{ countryFlag(perfil.country) }} {{ countryName(perfil.country) }}</div>

      <div class="divider"></div>

      <div class="perfil-estads">
        <div class="pe-item">
          <span class="pe-val">{{ perfil.porcentaje_aciertos }}<small>%</small></span>
          <span class="pe-lbl">Aciertos</span>
        </div>
        <div class="pe-item">
          <span class="pe-val">{{ perfil.total_acertados }}</span>
          <span class="pe-lbl">Partidos acertados</span>
        </div>
      </div>

      <template v-if="perfil.trofeos.length">
        <div class="divider"></div>
        <div class="trofeos-section">
          <div class="trofeos-section-label">Campeonatos</div>
          <div class="trofeos-vitrina">
            <router-link
              v-for="t in perfil.trofeos.slice(0, 3)"
              :key="t.quiniela_id"
              :to="`/app/quinielas/${t.quiniela_id}`"
              class="trofeo-badge"
              :title="`${t.name} · ${t.competition} ${t.season}`"
            >
              <div class="trofeo-glow"></div>
              <div class="trofeo-emoji"></div>
              <div class="trofeo-spark s1"></div>
              <div class="trofeo-spark s2"></div>
              <div class="trofeo-spark s3"></div>
              <div class="trofeo-spark s4"></div>
              <div class="trofeo-label">{{ t.season }}</div>
            </router-link>
            <button v-if="perfil.trofeos.length > 3" class="trofeo-mas" @click="verMas = !verMas">
              <span class="trofeo-mas-num">+{{ perfil.trofeos.length - 3 }}</span>
              <span class="trofeo-mas-txt">{{ verMas ? 'menos' : 'más' }}</span>
            </button>
          </div>
          <div v-if="verMas" class="trofeos-vitrina trofeos-vitrina--extra">
            <router-link
              v-for="t in perfil.trofeos.slice(3)"
              :key="t.quiniela_id"
              :to="`/app/quinielas/${t.quiniela_id}`"
              class="trofeo-badge"
              :title="`${t.name} · ${t.competition} ${t.season}`"
            >
              <div class="trofeo-glow"></div>
              <div class="trofeo-emoji"></div>
              <div class="trofeo-spark s1"></div>
              <div class="trofeo-spark s2"></div>
              <div class="trofeo-spark s3"></div>
              <div class="trofeo-spark s4"></div>
              <div class="trofeo-label">{{ t.season }}</div>
            </router-link>
          </div>
        </div>
      </template>
    </div>
  </div>

  <div v-else-if="error" class="empty-state page">Usuario no encontrado.</div>
  <div v-else class="empty-state page">Cargando...</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route  = useRoute()
const perfil = ref(null)
const error  = ref(false)
const verMas = ref(false)

const initial = computed(() =>
  (perfil.value?.username || 'U').charAt(0).toUpperCase()
)

onMounted(async () => {
  try {
    const res = await api.get(`/quinielas/perfil/${route.params.username}`)
    perfil.value = res.data
  } catch {
    error.value = true
  }
})

function countryFlag(c) {
  const f = { HN:'🇭🇳', CR:'🇨🇷', GT:'🇬🇹', SV:'🇸🇻', NI:'🇳🇮', PA:'🇵🇦', BZ:'🇧🇿', MX:'🇲🇽', CO:'🇨🇴', AR:'🇦🇷', BR:'🇧🇷', US:'🇺🇸', ES:'🇪🇸' }
  return f[c] || '🌎'
}
function countryName(c) {
  const n = { HN:'Honduras', CR:'Costa Rica', GT:'Guatemala', SV:'El Salvador', NI:'Nicaragua', PA:'Panamá', BZ:'Belice', MX:'México', CO:'Colombia', AR:'Argentina', BR:'Brasil', US:'USA', ES:'España' }
  return n[c] || c
}
</script>

<style scoped>
.back-link { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; display: block; margin-bottom: 1.25rem; }
.back-link:hover { color: var(--text-primary); }

.pub-card {
  max-width: 340px; margin: 0 auto;
  display: flex; flex-direction: column; align-items: center; text-align: center;
}
.pub-avatar {
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--accent-glow); border: 2px solid rgba(0,229,160,0.3);
  color: var(--accent); font-family: var(--font-display);
  font-size: 2rem; display: flex; align-items: center; justify-content: center;
  margin-bottom: 1rem;
}
.pub-name    { font-weight: 600; font-size: 1rem; color: var(--text-primary); }
.pub-username{ color: var(--text-muted); font-size: 0.85rem; margin: 0.2rem 0; }
.pub-country { font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem; }

.perfil-estads {
  display: flex; width: 100%;
  background: var(--bg-surface); border-radius: var(--radius);
  border: 1px solid var(--border); overflow: hidden;
}
.pe-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 0.6rem 0.25rem; border-right: 1px solid var(--border); gap: 0.15rem;
}
.pe-item:last-child { border-right: none; }
.pe-val { font-family: var(--font-display); font-size: 1.15rem; color: var(--accent); line-height: 1; }
.pe-val small { font-family: var(--font-body); font-size: 0.7rem; color: var(--text-muted); }
.pe-lbl { font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; text-align: center; }

.trofeos-section {
  width: 100%; border: 1px solid rgba(245,166,35,0.2);
  border-radius: var(--radius); padding: 0.75rem;
  background: rgba(245,166,35,0.03);
}
.trofeos-section-label {
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: #f5a623; margin-bottom: 0.75rem;
}
.trofeos-vitrina { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.trofeos-vitrina--extra { margin-top: 0.5rem; border-top: 1px solid rgba(245,166,35,0.15); padding-top: 0.5rem; }

.trofeo-badge {
  position: relative; text-decoration: none;
  display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
  width: 100%; padding: 1rem 0.5rem 0.6rem;
  background: radial-gradient(ellipse at 50% 30%, rgba(245,166,35,0.18), rgba(245,166,35,0.04) 70%);
  border: 1px solid rgba(245,166,35,0.35); border-radius: 12px;
  overflow: hidden; transition: transform 0.2s, border-color 0.2s;
}
.trofeo-badge:hover { transform: translateY(-3px); border-color: rgba(245,166,35,0.7); }
.trofeo-glow {
  position: absolute; inset: 0; border-radius: 12px;
  background: radial-gradient(ellipse at 50% 40%, rgba(245,166,35,0.25), transparent 70%);
  animation: trofeo-pulse 2.5s ease-in-out infinite; pointer-events: none;
}
@keyframes trofeo-pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
.trofeo-emoji {
  width: 2rem; height: 2rem;
  background: linear-gradient(135deg, #f5a623, #f0c040);
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
  filter: drop-shadow(0 0 6px rgba(245,166,35,0.7)); animation: trofeo-float 3s ease-in-out infinite;
}
@keyframes trofeo-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.trofeo-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em; color: #f5a623; text-transform: uppercase; }
.trofeo-spark { position: absolute; width: 4px; height: 4px; background: #f5e642; border-radius: 50%; animation: spark-twinkle 1.8s ease-in-out infinite; }
.s1 { top: 14%; left: 18%; animation-delay: 0s;    animation-duration: 1.6s; }
.s2 { top: 20%; right: 16%; animation-delay: 0.5s; animation-duration: 2.1s; }
.s3 { top: 55%; left: 12%; animation-delay: 0.9s;  animation-duration: 1.9s; }
.s4 { top: 40%; right: 10%; animation-delay: 1.3s; animation-duration: 1.5s; }
@keyframes spark-twinkle { 0%, 100% { opacity: 0; transform: scale(0.5); } 50% { opacity: 1; transform: scale(1.4); } }
.trofeo-mas {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 100%; aspect-ratio: 1;
  background: rgba(245,166,35,0.05); border: 1px dashed rgba(245,166,35,0.3);
  border-radius: 12px; cursor: pointer; gap: 0.2rem; transition: background 0.2s;
}
.trofeo-mas:hover { background: rgba(245,166,35,0.1); }
.trofeo-mas-num { font-family: var(--font-display); font-size: 1.4rem; color: #f5a623; }
.trofeo-mas-txt { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.empty-state { text-align: center; padding: 4rem; color: var(--text-muted); }
</style>
