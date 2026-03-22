<template>
  <div class="page">
    <div class="premium-header">
      <h1 class="page-title">PLANES</h1>
      <p class="page-sub">Elegí el plan que mejor se adapta a vos</p>
    </div>

    <!-- Planes -->
    <div class="plans-grid">
      <!-- Free -->
      <div class="plan-card card" :class="{ current: !auth.user?.is_premium }">
        <div class="plan-badge" v-if="!auth.user?.is_premium">Plan actual</div>
        <div class="plan-name">Free</div>
        <div class="plan-price">
          <span class="plan-amount">$0</span>
          <span class="plan-period">/mes</span>
        </div>
        <div class="plan-desc">Para empezar a jugar con tus amigos</div>
        <ul class="plan-features">
          <li class="feature">✓ 1 quiniela activa como organizador</li>
          <li class="feature">✓ Hasta 15 participantes</li>
          <li class="feature">✓ Podés unirte a quinielas ilimitadas</li>
          <li class="feature muted">✗ Publicidad</li>
          <li class="feature muted">✗ Quinielas de pago con pozo</li>
          <li class="feature muted">✗ Estadísticas avanzadas</li>
        </ul>
        <button class="btn btn-secondary btn-block" disabled>
          Plan actual
        </button>
      </div>

      <!-- Premium -->
      <div class="plan-card card premium" :class="{ current: auth.user?.is_premium }">
        <div class="plan-badge premium-badge">⭐ Recomendado</div>
        <div class="plan-name">Premium</div>
        <div class="plan-price">
          <span class="plan-amount">$2.99</span>
          <span class="plan-period">/mes</span>
        </div>
        <div class="plan-desc">Para el organizador serio que quiere más</div>
        <ul class="plan-features">
          <li class="feature">✓ Quinielas ilimitadas</li>
          <li class="feature">✓ Participantes ilimitados</li>
          <li class="feature">✓ Sin publicidad</li>
          <li class="feature">✓ Quinielas de pago con pozo</li>
          <li class="feature">✓ Estadísticas avanzadas</li>
          <li class="feature">✓ Soporte prioritario</li>
        </ul>

        <div v-if="auth.user?.is_premium">
          <div class="alert alert-success" style="margin-bottom:1rem">
            ✓ Ya sos Premium
          </div>
          <button class="btn btn-secondary btn-block" @click="goToPortal" :disabled="loading">
            {{ loading ? 'Cargando...' : 'Gestionar suscripción' }}
          </button>
        </div>
        <div v-else>
          <button class="btn btn-primary btn-block" @click="goToCheckout" :disabled="loading">
            {{ loading ? 'Cargando...' : 'Suscribirme ahora' }}
          </button>
        </div>
      </div>
    </div>

    <!-- FAQ -->
    <div class="card faq-card" style="margin-top:1.5rem">
      <h2 class="section-title">Preguntas frecuentes</h2>
      <div class="faq-list">
        <div class="faq-item" v-for="faq in faqs" :key="faq.q" @click="faq.open = !faq.open">
          <div class="faq-q">
            {{ faq.q }}
            <span class="faq-arrow">{{ faq.open ? '▲' : '▼' }}</span>
          </div>
          <div class="faq-a" v-if="faq.open">{{ faq.a }}</div>
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
    window.open(res.data.url, '_blank')
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
.premium-header { text-align: center; margin-bottom: 2rem; }
.page-title     { font-family: var(--font-display); font-size: 2rem; letter-spacing: 0.08em; }
.page-sub       { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.3rem; }
.section-title  { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 1rem; }

.plans-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1rem; max-width: 700px; margin: 0 auto;
}

.plan-card {
  position: relative; display: flex;
  flex-direction: column; gap: 0.75rem; padding: 2rem;
}
.plan-card.premium { border-color: var(--accent); }
.plan-card.current { border-color: var(--accent); }

.plan-badge {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--bg-surface); border: 1px solid var(--border);
  color: var(--text-muted); font-size: 0.72rem; font-weight: 600;
  padding: 0.2rem 0.75rem; border-radius: 999px; white-space: nowrap;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.premium-badge {
  background: var(--accent-glow); border-color: var(--accent);
  color: var(--accent);
}

.plan-name   { font-family: var(--font-display); font-size: 1.4rem; letter-spacing: 0.05em; }
.plan-price  { display: flex; align-items: baseline; gap: 0.2rem; }
.plan-amount { font-family: var(--font-display); font-size: 2.5rem; color: var(--accent); }
.plan-period { color: var(--text-muted); font-size: 0.85rem; }
.plan-desc   { color: var(--text-muted); font-size: 0.85rem; }

.plan-features { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
.feature       { font-size: 0.88rem; color: var(--text-secondary); }
.feature.muted { color: var(--text-muted); }

.faq-card  { max-width: 700px; margin: 0 auto; }
.faq-list  { display: flex; flex-direction: column; gap: 0; }
.faq-item  { padding: 1rem 0; border-bottom: 1px solid var(--border); cursor: pointer; }
.faq-item:last-child { border-bottom: none; }
.faq-q     { display: flex; justify-content: space-between; font-weight: 500; font-size: 0.9rem; color: var(--text-primary); }
.faq-arrow { color: var(--text-muted); font-size: 0.7rem; }
.faq-a     { color: var(--text-muted); font-size: 0.85rem; margin-top: 0.75rem; line-height: 1.6; }

@media (max-width: 600px) {
  .plans-grid { grid-template-columns: 1fr; }
}
</style>
