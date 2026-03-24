<template>
  <div class="page">
    <h1 class="page-title">MI PERFIL</h1>

    <div class="perfil-grid">
      <!-- Info del usuario -->
      <div class="card perfil-card">
        <div class="perfil-avatar">{{ userInitial }}</div>
        <div class="perfil-name">{{ auth.user?.full_name || auth.user?.username }}</div>
        <div class="perfil-username">@{{ auth.user?.username }}</div>
        <div class="perfil-country">{{ countryFlag(auth.user?.country) }} {{ countryName(auth.user?.country) }}</div>

        <div class="divider"></div>

        <div class="perfil-stats">
          <div class="p-stat">
            <span class="p-stat-val">{{ stats.quinielas }}</span>
            <span class="p-stat-lbl">Quinielas</span>
          </div>
          <div class="p-stat p-stat--gold">
            <span class="p-stat-val">{{ trofeos.length }}</span>
            <span class="p-stat-lbl">🏆 Títulos</span>
          </div>
        </div>

        <div class="perfil-estads" v-if="estadisticas">
          <div class="pe-item">
            <span class="pe-val">{{ estadisticas.porcentaje_aciertos }}<small>%</small></span>
            <span class="pe-lbl">Aciertos</span>
          </div>
          <div class="pe-item">
            <span class="pe-val">{{ estadisticas.total_acertados }}</span>
            <span class="pe-lbl">Partidos acertados</span>
          </div>
        </div>

        <template v-if="trofeos.length">
          <div class="divider"></div>
          <div class="trofeos-section">
            <div class="trofeos-section-label">Campeonatos</div>
            <div class="trofeos-vitrina">
              <router-link
                v-for="t in trofeos.slice(0, 3)"
                :key="t.quiniela_id"
                :to="`/app/quinielas/${t.quiniela_id}`"
                class="trofeo-badge"
                :title="`${t.name} · ${t.competition} ${t.season}`"
              >
                <div class="trofeo-glow"></div>
                <div class="trofeo-emoji">🏆</div>
                <div class="trofeo-spark s1"></div>
                <div class="trofeo-spark s2"></div>
                <div class="trofeo-spark s3"></div>
                <div class="trofeo-spark s4"></div>
                <div class="trofeo-label">{{ t.season }}</div>
              </router-link>
              <button v-if="trofeos.length > 3" class="trofeo-mas" @click="verTodosTrofeos = !verTodosTrofeos">
                <span class="trofeo-mas-num">+{{ trofeos.length - 3 }}</span>
                <span class="trofeo-mas-txt">{{ verTodosTrofeos ? 'menos' : 'más' }}</span>
              </button>
            </div>
            <div v-if="verTodosTrofeos" class="trofeos-vitrina trofeos-vitrina--extra">
              <router-link
                v-for="t in trofeos.slice(3)"
                :key="t.quiniela_id"
                :to="`/app/quinielas/${t.quiniela_id}`"
                class="trofeo-badge"
                :title="`${t.name} · ${t.competition} ${t.season}`"
              >
                <div class="trofeo-glow"></div>
                <div class="trofeo-emoji">🏆</div>
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

      <!-- Editar perfil -->
      <div class="card">
        <h2 class="section-title">Editar datos</h2>

        <div class="form-group">
          <label>Nombre completo</label>
          <input v-model="editForm.full_name" placeholder="Tu nombre completo" />
        </div>
        <div class="form-group">
          <label>País</label>
          <select v-model="editForm.country">
            <option value="HN">🇭🇳 Honduras</option>
            <option value="CR">🇨🇷 Costa Rica</option>
            <option value="GT">🇬🇹 Guatemala</option>
            <option value="SV">🇸🇻 El Salvador</option>
            <option value="NI">🇳🇮 Nicaragua</option>
            <option value="PA">🇵🇦 Panamá</option>
            <option value="BZ">🇧🇿 Belice</option>
            <option value="MX">🇲🇽 México</option>
            <option value="CO">🇨🇴 Colombia</option>
            <option value="AR">🇦🇷 Argentina</option>
            <option value="BR">🇧🇷 Brasil</option>
            <option value="US">🇺🇸 USA</option>
            <option value="ES">🇪🇸 España</option>
          </select>
        </div>

        <div v-if="saveMsg" :class="`alert ${saveError ? 'alert-error' : 'alert-success'}`">{{ saveMsg }}</div>

        <button class="btn btn-primary" @click="saveProfile" :disabled="saving">
          {{ saving ? 'Guardando...' : 'Guardar cambios' }}
        </button>

        <div class="divider"></div>

        <h2 class="section-title">Cambiar contraseña</h2>
        <div class="form-group">
          <label>Contraseña actual</label>
          <input v-model="pwForm.current" type="password" placeholder="••••••••" />
        </div>
        <div class="form-group">
          <label>Nueva contraseña</label>
          <input v-model="pwForm.new" type="password" placeholder="Mínimo 8 caracteres" minlength="8" />
        </div>
        <div class="form-group">
          <label>Confirmar nueva contraseña</label>
          <input v-model="pwForm.confirm" type="password" placeholder="Repetí la nueva contraseña" />
        </div>

        <div v-if="pwMsg" :class="`alert ${pwError ? 'alert-error' : 'alert-success'}`">{{ pwMsg }}</div>

        <button class="btn btn-secondary" @click="changePassword" :disabled="savingPw">
          {{ savingPw ? 'Cambiando...' : 'Cambiar contraseña' }}
        </button>
      </div>
    </div>

    <!-- Historial de quinielas -->
    <div class="card" style="margin-top:1rem" v-if="quinielas.length">
      <h2 class="section-title">Mis quinielas</h2>
      <div class="historial-list">
        <div v-for="p in quinielas" :key="p.id" class="historial-row">
          <div class="h-info">
            <div class="h-name">{{ p.quiniela?.name }}</div>
            <div class="h-comp">{{ p.quiniela?.competition?.name }}</div>
          </div>
          <div class="h-pts">{{ p.total_points }} pts</div>
          <div class="h-rank">#{{ p.rank || '—' }}</div>
          <router-link :to="`/app/quinielas/${p.quiniela?.id}`" class="btn btn-secondary btn-sm">
            Ver →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth = useAuthStore()

const quinielas       = ref([])
const trofeos         = ref([])
const estadisticas    = ref(null)
const verTodosTrofeos = ref(false)
const saving          = ref(false)
const savingPw  = ref(false)
const saveMsg   = ref('')
const saveError = ref(false)
const pwMsg     = ref('')
const pwError   = ref(false)

const editForm = ref({
  full_name: auth.user?.full_name || '',
  country:   auth.user?.country   || 'HN',
})

const pwForm = ref({ current: '', new: '', confirm: '' })

const userInitial = computed(() =>
  (auth.user?.username || 'U').charAt(0).toUpperCase()
)

const stats = computed(() => ({
  quinielas: quinielas.value.length,
  jornadas:  quinielas.value.reduce((s, p) => s + (p.jornadas_jugadas || 0), 0),
  exactos:   quinielas.value.reduce((s, p) => s + (p.exact_scores || 0), 0),
}))

onMounted(async () => {
  const [qRes, tRes, eRes] = await Promise.all([
    api.get('/quinielas/mis/quinielas'),
    api.get('/quinielas/mis/trofeos'),
    api.get('/quinielas/mis/estadisticas'),
  ])
  quinielas.value    = qRes.data
  trofeos.value      = tRes.data
  estadisticas.value = eRes.data
})

async function saveProfile() {
  saveMsg.value   = ''
  saveError.value = false
  saving.value    = true
  try {
    const res = await api.patch('/auth/profile', {
      full_name: editForm.value.full_name,
      country:   editForm.value.country,
    })
    // Actualizar el store y localStorage con los datos nuevos
    auth.user = { ...auth.user, ...res.data }
    localStorage.setItem('user', JSON.stringify(auth.user))
    saveMsg.value = '✓ Perfil actualizado correctamente'
    setTimeout(() => { saveMsg.value = '' }, 3000)
  } catch (e) {
    saveError.value = true
    saveMsg.value   = e.response?.data?.message || 'Error al actualizar el perfil'
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  pwMsg.value   = ''
  pwError.value = false

  if (!pwForm.value.current || !pwForm.value.new || !pwForm.value.confirm) {
    pwError.value = true
    pwMsg.value   = 'Completá todos los campos'
    return
  }
  if (pwForm.value.new !== pwForm.value.confirm) {
    pwError.value = true
    pwMsg.value   = 'Las contraseñas nuevas no coinciden'
    return
  }
  if (pwForm.value.new.length < 8) {
    pwError.value = true
    pwMsg.value   = 'La contraseña debe tener al menos 8 caracteres'
    return
  }

  savingPw.value = true
  try {
    await api.patch('/auth/change-password', {
      current_password: pwForm.value.current,
      new_password:     pwForm.value.new,
    })
    pwMsg.value  = '✓ Contraseña actualizada correctamente'
    pwForm.value = { current: '', new: '', confirm: '' }
    setTimeout(() => { pwMsg.value = '' }, 3000)
  } catch (e) {
    pwError.value = true
    pwMsg.value   = e.response?.data?.message || 'Error al cambiar la contraseña'
  } finally {
    savingPw.value = false
  }
}

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
.page-title   { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.08em; margin-bottom: 1.5rem; }
.section-title{ font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem; }

.perfil-grid { display: grid; grid-template-columns: 260px 1fr; gap: 1rem; }

.perfil-card  { display: flex; flex-direction: column; align-items: center; text-align: center; }
.perfil-avatar{
  width: 72px; height: 72px; border-radius: 50%;
  background: var(--accent-glow); border: 2px solid rgba(0,229,160,0.3);
  color: var(--accent); font-family: var(--font-display);
  font-size: 2rem; display: flex; align-items: center; justify-content: center;
  margin-bottom: 1rem;
}
.perfil-name    { font-weight: 600; font-size: 1rem; color: var(--text-primary); }
.perfil-username{ color: var(--text-muted); font-size: 0.85rem; margin: 0.2rem 0; }
.perfil-country { font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem; }

.perfil-stats {
  display: flex; gap: 0; width: 100%;
  background: var(--bg-surface); border-radius: var(--radius);
  border: 1px solid var(--border); overflow: hidden;
}
.p-stat { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 0.65rem 0.25rem; border-right: 1px solid var(--border); }
.p-stat:last-child { border-right: none; }
.p-stat-val { font-family: var(--font-display); font-size: 1.3rem; color: var(--accent); }
.p-stat-lbl { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }

/* Estadísticas globales */
.perfil-estads {
  display: flex; width: 100%; margin-top: 0.75rem;
  background: var(--bg-surface); border-radius: var(--radius);
  border: 1px solid var(--border); overflow: hidden;
}
.pe-item {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 0.6rem 0.25rem; border-right: 1px solid var(--border);
  gap: 0.15rem;
}
.pe-item:last-child { border-right: none; }
.pe-val {
  font-family: var(--font-display); font-size: 1.15rem; color: var(--accent);
  line-height: 1;
}
.pe-val small { font-family: var(--font-body); font-size: 0.7rem; color: var(--text-muted); }
.pe-lbl { font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; text-align: center; }

/* Trofeos */
.p-stat--gold .p-stat-val { color: #f5a623; }

.trofeos-section {
  width: 100%;
  border: 1px solid rgba(245,166,35,0.2);
  border-radius: var(--radius);
  padding: 0.75rem;
  background: rgba(245,166,35,0.03);
}
.trofeos-section-label {
  font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: #f5a623; margin-bottom: 0.75rem;
}
.trofeos-vitrina {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  align-items: center;
}
.trofeos-vitrina--extra {
  margin-top: 0.5rem;
  border-top: 1px solid rgba(245,166,35,0.15);
  padding-top: 0.5rem;
}

/* Badge de trofeo */
.trofeo-badge {
  position: relative; text-decoration: none;
  display: flex; flex-direction: column; align-items: center; gap: 0.35rem;
  width: 100%; padding: 1rem 0.5rem 0.6rem;
  background: radial-gradient(ellipse at 50% 30%, rgba(245,166,35,0.18), rgba(245,166,35,0.04) 70%);
  border: 1px solid rgba(245,166,35,0.35);
  border-radius: 12px;
  cursor: pointer; overflow: hidden;
  transition: transform 0.2s, border-color 0.2s;
}
.trofeo-badge:hover { transform: translateY(-3px); border-color: rgba(245,166,35,0.7); }

/* Brillo de fondo pulsante */
.trofeo-glow {
  position: absolute; inset: 0; border-radius: 12px;
  background: radial-gradient(ellipse at 50% 40%, rgba(245,166,35,0.25), transparent 70%);
  animation: trofeo-pulse 2.5s ease-in-out infinite;
  pointer-events: none;
}
@keyframes trofeo-pulse {
  0%, 100% { opacity: 0.5; }
  50%       { opacity: 1; }
}

.trofeo-emoji {
  font-size: 2.2rem; line-height: 1;
  filter: drop-shadow(0 0 6px rgba(245,166,35,0.7));
  animation: trofeo-float 3s ease-in-out infinite;
}
@keyframes trofeo-float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-3px); }
}

.trofeo-label {
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.04em;
  color: #f5a623; text-transform: uppercase;
}

/* Destellos */
.trofeo-spark {
  position: absolute; width: 4px; height: 4px;
  background: #f5e642; border-radius: 50%;
  animation: spark-twinkle 1.8s ease-in-out infinite;
}
.s1 { top: 14%; left: 18%; animation-delay: 0s;    animation-duration: 1.6s; }
.s2 { top: 20%; right: 16%; animation-delay: 0.5s; animation-duration: 2.1s; }
.s3 { top: 55%; left: 12%; animation-delay: 0.9s;  animation-duration: 1.9s; }
.s4 { top: 40%; right: 10%; animation-delay: 1.3s; animation-duration: 1.5s; }

@keyframes spark-twinkle {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50%       { opacity: 1; transform: scale(1.4); }
}

/* Botón +más */
.trofeo-mas {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  width: 100%; aspect-ratio: 1;
  background: rgba(245,166,35,0.05); border: 1px dashed rgba(245,166,35,0.3);
  border-radius: 12px; cursor: pointer; gap: 0.2rem;
  transition: background 0.2s;
}
.trofeo-mas:hover { background: rgba(245,166,35,0.1); }
.trofeo-mas-num { font-family: var(--font-display); font-size: 1.4rem; color: #f5a623; }
.trofeo-mas-txt { font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.historial-list { display: flex; flex-direction: column; gap: 0.5rem; }
.historial-row  { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--bg-surface); border-radius: var(--radius); }
.h-info  { flex: 1; }
.h-name  { font-weight: 500; font-size: 0.9rem; color: var(--text-primary); }
.h-comp  { font-size: 0.75rem; color: var(--text-muted); }
.h-pts   { font-family: var(--font-display); font-size: 1.1rem; color: var(--accent); min-width: 60px; text-align: center; }
.h-rank  { font-size: 0.85rem; color: var(--text-secondary); min-width: 30px; text-align: center; }

@media (max-width: 640px) {
  .perfil-grid { grid-template-columns: 1fr; }
}
</style>