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
          <div class="p-stat">
            <span class="p-stat-val">{{ stats.jornadas }}</span>
            <span class="p-stat-lbl">Jornadas</span>
          </div>
          <div class="p-stat">
            <span class="p-stat-val">{{ stats.exactos }}</span>
            <span class="p-stat-lbl">Exactos</span>
          </div>
        </div>
      </div>

      <!-- Editar perfil -->
      <div class="card">
        <h2 class="section-title">Editar datos</h2>

        <div class="form-group">
          <label>Nombre completo</label>
          <input v-model="editForm.full_name" :placeholder="auth.user?.full_name || 'Tu nombre'" />
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
            <option value="US">🇺🇸 USA</option>
          </select>
        </div>

        <div v-if="saveMsg" class="alert alert-success">{{ saveMsg }}</div>

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
          <input v-model="pwForm.new" type="password" placeholder="Mínimo 8 caracteres" />
        </div>
        <div v-if="pwMsg" class="alert alert-success">{{ pwMsg }}</div>
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

const quinielas = ref([])
const saving    = ref(false)
const savingPw  = ref(false)
const saveMsg   = ref('')
const pwMsg     = ref('')

const editForm = ref({
  full_name: auth.user?.full_name || '',
  country:   auth.user?.country   || 'HN',
})

const pwForm = ref({ current: '', new: '' })

const userInitial = computed(() =>
  (auth.user?.username || 'U').charAt(0).toUpperCase()
)

const stats = computed(() => ({
  quinielas: quinielas.value.length,
  jornadas:  quinielas.value.reduce((s, p) => s + (p.jornadas_jugadas || 0), 0),
  exactos:   quinielas.value.reduce((s, p) => s + (p.exact_scores || 0), 0),
}))

onMounted(async () => {
  const res = await api.get('/quinielas/mis/quinielas')
  quinielas.value = res.data
})

async function saveProfile() {
  saving.value = true
  try {
    // TODO: endpoint PATCH /users/me cuando se implemente
    saveMsg.value = '✓ Perfil actualizado'
    setTimeout(() => { saveMsg.value = '' }, 2000)
  } finally {
    saving.value = false
  }
}

async function changePassword() {
  if (!pwForm.value.current || !pwForm.value.new) return
  savingPw.value = true
  try {
    // TODO: endpoint PATCH /auth/change-password cuando se implemente
    pwMsg.value = '✓ Contraseña actualizada'
    pwForm.value = { current: '', new: '' }
    setTimeout(() => { pwMsg.value = '' }, 2000)
  } finally {
    savingPw.value = false
  }
}

function countryFlag(c) {
  const f = { HN:'🇭🇳', CR:'🇨🇷', GT:'🇬🇹', SV:'🇸🇻', NI:'🇳🇮', PA:'🇵🇦', BZ:'🇧🇿', MX:'🇲🇽', US:'🇺🇸' }
  return f[c] || '🌎'
}

function countryName(c) {
  const n = { HN:'Honduras', CR:'Costa Rica', GT:'Guatemala', SV:'El Salvador', NI:'Nicaragua', PA:'Panamá', BZ:'Belice', MX:'México', US:'USA' }
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
