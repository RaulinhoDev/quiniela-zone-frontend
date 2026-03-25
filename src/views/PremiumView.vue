<template>
  <div class="page premium-page">

    <!-- Hero -->
    <div class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-badge">QUINIELA ZONE PREMIUM</div>
        <h1 class="hero-title">Jugá sin límites</h1>
        <p class="hero-sub">Creá todas las quinielas que quieras, invitá a más gente y llevá tu grupo al siguiente nivel.</p>
      </div>
    </div>

    <!-- Planes -->
    <div class="plans-grid">

      <!-- Free -->
      <div class="plan-card" :class="{ 'plan-active': !auth.user?.is_premium }">
        <div class="plan-current-badge" v-if="!auth.user?.is_premium">Plan actual</div>
        <div class="plan-header">
          <div class="plan-name">Free</div>
          <div class="plan-price">
            <span class="price-amount">$0</span>
            <span class="price-period">/mes</span>
          </div>
          <div class="plan-desc">Para empezar a jugar con tus amigos</div>
        </div>
        <ul class="plan-features">
          <li class="feat feat--on"><span class="feat-dot on"></span><span>1 quiniela activa como organizador</span></li>
          <li class="feat feat--on"><span class="feat-dot on"></span><span>Hasta 15 participantes</span></li>
          <li class="feat feat--on"><span class="feat-dot on"></span><span>Unirte a quinielas ilimitadas</span></li>
          <li class="feat feat--off"><span class="feat-dot off"></span><span>Sin publicidad</span></li>
          <li class="feat feat--off"><span class="feat-dot off"></span><span>Quinielas con pozo de premio</span></li>
          <li class="feat feat--off"><span class="feat-dot off"></span><span>Estadísticas avanzadas</span></li>
        </ul>
        <button class="btn btn-secondary btn-block" disabled>Plan actual</button>
      </div>

      <!-- Premium -->
      <div class="plan-card plan-premium" :class="{ 'plan-active': auth.user?.is_premium }">
        <div class="plan-glow"></div>
        <div class="plan-recommended">Recomendado</div>

        <div class="plan-header">
          <div class="plan-name premium-name">Premium</div>
          <div class="plan-price">
            <span class="price-amount price-amount--premium">$3.99</span>
            <span class="price-period">/mes</span>
          </div>
          <div class="plan-desc">Para el organizador que quiere más</div>
        </div>

        <ul class="plan-features">
          <li class="feat feat--premium"><span class="feat-dot premium"></span><span>Quinielas <strong>ilimitadas</strong></span></li>
          <li class="feat feat--premium"><span class="feat-dot premium"></span><span>Hasta <strong>50 participantes</strong></span></li>
          <li class="feat feat--premium"><span class="feat-dot premium"></span><span>Sin publicidad</span></li>
          <li class="feat feat--premium"><span class="feat-dot premium"></span><span>Quinielas con pozo de premio</span></li>
          <li class="feat feat--premium"><span class="feat-dot premium"></span><span>Estadísticas avanzadas</span></li>
          <li class="feat feat--premium"><span class="feat-dot premium"></span><span>Soporte prioritario</span></li>
        </ul>

        <div v-if="auth.user?.is_premium" class="premium-active-box">
          <div class="premium-active-msg">Suscripción activa</div>
          <button class="btn-premium btn-block" @click="goToPortal" :disabled="loading">
            {{ loading ? 'Cargando...' : 'Gestionar suscripción' }}
          </button>
        </div>
        <div v-else>
          <button class="btn-premium btn-block" @click="goToCheckout" :disabled="loading">
            <span v-if="loading" class="btn-spinner"></span>
            <span v-else>Suscribirme — $3.99/mes</span>
          </button>
          <div class="plan-trust">Pago seguro con Stripe · Cancelá cuando quieras</div>
        </div>
      </div>
    </div>

    <!-- Comparativa -->
    <div class="compare-section">
      <div class="section-label">¿Por qué Premium?</div>
      <div class="compare-grid">
        <div class="compare-item" v-for="c in comparativa" :key="c.label">
          <div class="compare-bar"></div>
          <div class="compare-label">{{ c.label }}</div>
          <div class="compare-desc">{{ c.desc }}</div>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="faq-section">
      <div class="section-label">Preguntas frecuentes</div>
      <div class="faq-list">
        <div
          class="faq-item"
          v-for="faq in faqs"
          :key="faq.q"
          @click="faq.open = !faq.open"
          :class="{ 'faq-open': faq.open }"
        >
          <div class="faq-q">
            <span>{{ faq.q }}</span>
            <span class="faq-arrow">{{ faq.open ? '−' : '+' }}</span>
          </div>
          <transition name="faq">
            <div class="faq-a" v-if="faq.open">{{ faq.a }}</div>
          </transition>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const auth    = useAuthStore()
const loading = ref(false)

async function goToCheckout() {
  loading.value = true
  try {
    const res = await api.post('/stripe/checkout')
    window.location.href = res.data.url
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function goToPortal() {
  loading.value = true
  try {
    const res = await api.post('/stripe/portal')
    window.location.href = res.data.url
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const comparativa = [
  { label: 'Más quinielas',      desc: 'Creá tantas como quieras, sin restricciones.' },
  { label: 'Más participantes',  desc: 'Invitá hasta 50 personas por quiniela.' },
  { label: 'Pozo de premio',     desc: 'Armá quinielas con entrada y premio para el ganador.' },
  { label: 'Estadísticas',       desc: 'Analizá tu rendimiento con métricas detalladas.' },
]

const faqs = ref([
  {
    q: '¿Puedo cancelar cuando quiera?',
    a: 'Sí, podés cancelar tu suscripción en cualquier momento desde el portal de cliente. Seguís teniendo Premium hasta que termine el período pagado.',
    open: false,
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos todas las tarjetas de crédito y débito principales — Visa, Mastercard, American Express — procesadas de forma segura por Stripe.',
    open: false,
  },
  {
    q: '¿Qué pasa con mis quinielas si cancelo?',
    a: 'Tus quinielas existentes se mantienen. Solo no podrás crear nuevas quinielas adicionales si superás el límite del plan Free.',
    open: false,
  },
  {
    q: '¿Hay prueba gratuita?',
    a: 'Por ahora no tenemos período de prueba, pero el plan Free ya te permite probar la plataforma sin costo.',
    open: false,
  },
])
</script>

<style scoped>
.premium-page { padding-bottom: 4rem; }

/* ── Hero ─────────────────────────────────────────── */
.hero {
  position: relative; text-align: center;
  padding: 4rem 1rem 3.5rem; overflow: hidden; margin-bottom: 2.5rem;
}
.hero-glow {
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse at 50% 0%, rgba(0,229,160,0.1) 0%, transparent 65%);
}
.hero-content { position: relative; }
.hero-badge {
  display: inline-block;
  border: 1px solid rgba(0,229,160,0.35); color: var(--accent);
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em;
  padding: 0.3rem 1.1rem; border-radius: 999px; margin-bottom: 1.5rem;
  text-transform: uppercase;
}
.hero-title {
  font-family: var(--font-display); font-size: 3.2rem;
  letter-spacing: 0.05em; color: var(--text-primary);
  margin-bottom: 0.9rem; line-height: 1.05;
}
.hero-sub {
  color: var(--text-muted); font-size: 1rem;
  max-width: 460px; margin: 0 auto; line-height: 1.65;
}

/* ── Plans ────────────────────────────────────────── */
.plans-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1.25rem; max-width: 720px; margin: 0 auto 3.5rem;
}

.plan-card {
  position: relative; display: flex; flex-direction: column; gap: 1.5rem;
  padding: 2rem; background: var(--bg-card);
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  overflow: hidden; transition: transform 0.2s;
}
.plan-card:hover { transform: translateY(-2px); }

.plan-premium {
  border-color: rgba(0,229,160,0.4);
  background: linear-gradient(150deg, rgba(0,229,160,0.05) 0%, var(--bg-card) 45%);
}
.plan-glow {
  position: absolute; top: -60px; right: -60px;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(0,229,160,0.12), transparent 70%);
  pointer-events: none;
}

.plan-current-badge, .plan-recommended {
  position: absolute; top: 0; right: 1.5rem;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.08em;
  text-transform: uppercase; padding: 0.25rem 0.7rem;
  border-radius: 0 0 8px 8px;
}
.plan-current-badge {
  background: var(--bg-surface); border: 1px solid var(--border);
  border-top: none; color: var(--text-muted);
}
.plan-recommended {
  background: var(--accent); color: #000;
}

.plan-header { display: flex; flex-direction: column; gap: 0.35rem; }
.plan-name   { font-family: var(--font-display); font-size: 1.6rem; letter-spacing: 0.04em; color: var(--text-primary); }
.premium-name { color: var(--accent); }
.plan-price  { display: flex; align-items: baseline; gap: 0.2rem; margin-top: 0.2rem; }
.price-amount { font-family: var(--font-display); font-size: 3rem; line-height: 1; color: var(--text-primary); }
.price-amount--premium { color: var(--accent); }
.price-period { color: var(--text-muted); font-size: 0.9rem; }
.plan-desc   { color: var(--text-muted); font-size: 0.85rem; }

/* Features */
.plan-features {
  list-style: none; padding: 0; margin: 0; flex: 1;
  display: flex; flex-direction: column; gap: 0.65rem;
  border-top: 1px solid var(--border); padding-top: 1.25rem;
}
.feat {
  display: flex; align-items: center; gap: 0.7rem; font-size: 0.88rem;
}
.feat-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.feat-dot.on      { background: var(--text-muted); }
.feat-dot.off     { background: var(--border); }
.feat-dot.premium { background: var(--accent); box-shadow: 0 0 5px rgba(0,229,160,0.5); }

.feat--on     { color: var(--text-secondary); }
.feat--off    { color: var(--text-muted); opacity: 0.45; }
.feat--premium { color: var(--text-primary); }
.feat--premium strong { color: var(--accent); font-weight: 600; }

/* CTA */
.btn-premium {
  width: 100%; padding: 0.9rem 1rem;
  background: linear-gradient(135deg, #00e5a0, #00b87a);
  color: #000; font-weight: 700; font-size: 0.92rem;
  border: none; border-radius: var(--radius); cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  transition: opacity 0.15s, transform 0.15s; letter-spacing: 0.02em;
}
.btn-premium:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
.btn-premium:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }

.btn-spinner {
  width: 15px; height: 15px; border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.25); border-top-color: #000;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.plan-trust {
  text-align: center; font-size: 0.71rem;
  color: var(--text-muted); margin-top: 0.8rem; letter-spacing: 0.01em;
}

.premium-active-box { display: flex; flex-direction: column; gap: 0.75rem; }
.premium-active-msg {
  text-align: center; font-size: 0.82rem; font-weight: 600;
  color: var(--accent); padding: 0.6rem;
  background: rgba(0,229,160,0.06); border-radius: var(--radius);
  border: 1px solid rgba(0,229,160,0.25); letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* ── Comparativa ──────────────────────────────────── */
.compare-section {
  max-width: 720px; margin: 0 auto 3.5rem;
  display: flex; flex-direction: column; align-items: center; gap: 1.75rem;
}
.section-label {
  font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--text-muted);
  border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;
  width: 100%; text-align: center;
}
.compare-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1rem; width: 100%;
}
.compare-item {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.5rem 1.25rem;
  display: flex; flex-direction: column; gap: 0.5rem;
  transition: border-color 0.2s;
}
.compare-item:hover { border-color: rgba(0,229,160,0.3); }
.compare-bar {
  width: 24px; height: 3px; border-radius: 2px;
  background: var(--accent); margin-bottom: 0.25rem;
}
.compare-label { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
.compare-desc  { font-size: 0.78rem; color: var(--text-muted); line-height: 1.5; }

/* ── FAQ ──────────────────────────────────────────── */
.faq-section {
  max-width: 720px; margin: 0 auto;
  display: flex; flex-direction: column; align-items: center; gap: 1.75rem;
}
.faq-list  { width: 100%; }
.faq-item  { padding: 1.1rem 0; border-bottom: 1px solid var(--border); cursor: pointer; }
.faq-item:last-child { border-bottom: none; }
.faq-q {
  display: flex; justify-content: space-between; align-items: center;
  font-weight: 500; font-size: 0.9rem; color: var(--text-primary);
  transition: color 0.15s;
}
.faq-open .faq-q { color: var(--accent); }
.faq-arrow {
  font-size: 1.1rem; color: var(--text-muted);
  flex-shrink: 0; margin-left: 1rem; line-height: 1;
}
.faq-a {
  color: var(--text-muted); font-size: 0.87rem;
  margin-top: 0.8rem; line-height: 1.7;
}
.faq-enter-active, .faq-leave-active { transition: opacity 0.18s, transform 0.18s; }
.faq-enter-from, .faq-leave-to { opacity: 0; transform: translateY(-4px); }

/* ── Responsive ───────────────────────────────────── */
@media (max-width: 640px) {
  .hero-title   { font-size: 2.2rem; }
  .plans-grid   { grid-template-columns: 1fr; }
  .compare-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 400px) {
  .compare-grid { grid-template-columns: 1fr; }
}
</style>
