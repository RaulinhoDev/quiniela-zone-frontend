<template>
  <!-- Tarjeta renderizable como imagen — NO se muestra en pantalla directamente -->
  <div ref="cardRef" class="rk-card">
    <!-- Header -->
    <div class="rk-header">
      <div class="rk-logo">QZ</div>
      <div class="rk-header-info">
        <div class="rk-quiniela-name">{{ quiniela.name }}</div>
        <div class="rk-meta">{{ quiniela.competition }} · {{ quiniela.season }}</div>
      </div>
      <div class="rk-badge">TOP 10</div>
    </div>

    <div class="rk-divider"></div>

    <!-- Ranking -->
    <div class="rk-list">
      <div
        v-for="(p, i) in top10"
        :key="p.user.id"
        class="rk-row"
        :class="{ 'rk-row--gold': i === 0, 'rk-row--silver': i === 1, 'rk-row--bronze': i === 2 }"
      >
        <div class="rk-pos">
          <span v-if="i === 0">🥇</span>
          <span v-else-if="i === 1">🥈</span>
          <span v-else-if="i === 2">🥉</span>
          <span v-else class="rk-num">{{ i + 1 }}</span>
        </div>
        <div class="rk-avatar">{{ p.user.username.charAt(0).toUpperCase() }}</div>
        <div class="rk-user">
          <span class="rk-username">{{ p.user.username }}</span>
          <span class="rk-country">{{ countryFlag(p.user.country) }}</span>
        </div>
        <div class="rk-pts-col">
          <span class="rk-pts">{{ p.total_points }}</span>
          <span class="rk-pts-label">pts</span>
        </div>
      </div>
    </div>

    <div class="rk-divider"></div>

    <!-- Footer -->
    <div class="rk-footer">
      <span class="rk-footer-text">quinielazone.com</span>
      <span class="rk-footer-date">{{ fechaHoy }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  quiniela: { type: Object, required: true },
  ranking:  { type: Array,  required: true },
})

const cardRef = ref(null)

const top10 = computed(() => props.ranking.slice(0, 10))

const fechaHoy = computed(() =>
  new Date().toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
)

function countryFlag(c) {
  const f = { HN:'🇭🇳', CR:'🇨🇷', GT:'🇬🇹', SV:'🇸🇻', NI:'🇳🇮', PA:'🇵🇦', BZ:'🇧🇿', MX:'🇲🇽', CO:'🇨🇴', AR:'🇦🇷', BR:'🇧🇷', US:'🇺🇸' }
  return f[c] || '🌎'
}

defineExpose({ cardRef })
</script>

<style scoped>
.rk-card {
  width: 480px;
  background: #0d1117;
  border: 1px solid #21262d;
  border-radius: 16px;
  padding: 28px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  color: #e6edf3;
  position: absolute;
  left: -9999px;
  top: -9999px;
}

/* Header */
.rk-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.rk-logo {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, #00e5a0, #00b37e);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 1rem; color: #0d1117;
  letter-spacing: 0.05em; flex-shrink: 0;
}
.rk-header-info { flex: 1; }
.rk-quiniela-name { font-size: 1rem; font-weight: 700; color: #e6edf3; }
.rk-meta { font-size: 0.72rem; color: #8b949e; margin-top: 2px; }
.rk-badge {
  background: rgba(0,229,160,0.1);
  border: 1px solid rgba(0,229,160,0.3);
  color: #00e5a0;
  font-size: 0.68rem; font-weight: 800;
  padding: 4px 10px; border-radius: 20px;
  letter-spacing: 0.1em;
}

.rk-divider { height: 1px; background: #21262d; margin: 0 -28px; }

/* Rows */
.rk-list { padding: 12px 0; display: flex; flex-direction: column; gap: 4px; }

.rk-row {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 12px; border-radius: 8px;
  background: transparent; transition: background 0.1s;
}
.rk-row--gold   { background: rgba(255,215,0,0.07); }
.rk-row--silver { background: rgba(192,192,192,0.06); }
.rk-row--bronze { background: rgba(205,127,50,0.06); }

.rk-pos { width: 28px; text-align: center; font-size: 1.1rem; flex-shrink: 0; }
.rk-num { font-size: 0.85rem; color: #8b949e; font-weight: 600; }

.rk-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #1f6feb, #388bfd);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.82rem; font-weight: 700; color: #fff; flex-shrink: 0;
}
.rk-row--gold   .rk-avatar { background: linear-gradient(135deg, #b8860b, #ffd700); color: #0d1117; }
.rk-row--silver .rk-avatar { background: linear-gradient(135deg, #708090, #c0c0c0); color: #0d1117; }
.rk-row--bronze .rk-avatar { background: linear-gradient(135deg, #8b4513, #cd7f32); color: #fff; }

.rk-user { flex: 1; display: flex; align-items: center; gap: 6px; min-width: 0; }
.rk-username { font-size: 0.88rem; font-weight: 600; color: #e6edf3; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rk-country { font-size: 0.9rem; }

.rk-pts-col { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; }
.rk-pts { font-size: 1.1rem; font-weight: 800; color: #00e5a0; }
.rk-pts-label { font-size: 0.65rem; color: #8b949e; }

/* Footer */
.rk-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 14px;
}
.rk-footer-text { font-size: 0.72rem; color: #00e5a0; font-weight: 600; letter-spacing: 0.04em; }
.rk-footer-date { font-size: 0.7rem; color: #8b949e; }
</style>
