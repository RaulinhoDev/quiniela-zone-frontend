<template>
  <div class="landing">
    <!-- Hero -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-content">
          <div class="hero-badge">🏆 Ligas de América</div>
          <h1 class="hero-title">
            QUINIELA<br>
            <span class="accent">ZONE</span>
          </h1>
          <p class="hero-desc">
            Creá tu quiniela del torneo, invitá a tus amigos y competí jornada a jornada.
            Puntos automáticos, ranking en tiempo real.
          </p>
          <div class="hero-actions">
            <router-link to="/registro" class="btn btn-primary btn-lg">
              Crear mi quiniela
            </router-link>
            <router-link to="/login" class="btn btn-secondary btn-lg">
              Ya tengo cuenta
            </router-link>
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-card">
            <div class="vc-header">
              <span class="vc-name">Clausura 2025 — Grupo del trabajo</span>
              <span class="badge badge-green">Activa</span>
            </div>
            <div class="vc-ranking">
              <div v-for="(p, i) in mockRanking" :key="i" class="vc-row">
                <span class="vc-rank" :class="i === 0 ? 'gold' : i === 1 ? 'silver' : ''">
                  {{ i + 1 }}
                </span>
                <span class="vc-user">{{ p.user }}</span>
                <span class="vc-pts">{{ p.pts }} pts</span>
              </div>
            </div>
            <div class="vc-footer">
              <span>Jornada 8 de 18</span>
              <span class="badge badge-blue">5 participantes</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card" v-for="f in features" :key="f.icon">
            <div class="feature-icon">{{ f.icon }}</div>
            <div class="feature-title">{{ f.title }}</div>
            <div class="feature-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container cta-inner">
        <h2 class="cta-title">¿LISTO PARA JUGAR?</h2>
        <p class="cta-desc">Registrate gratis y creá tu primera quiniela en menos de 2 minutos</p>
        <router-link to="/registro" class="btn btn-primary btn-lg">
          Empezar ahora — es gratis
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-inner">
        <span class="footer-logo">⚽ QUINIELA ZONE</span>
        <span class="footer-copy">Fútbol, siempre.</span>
      </div>
    </footer>

    <!-- Fondo -->
    <div class="bg-glow g1"></div>
    <div class="bg-glow g2"></div>
  </div>
</template>

<script setup>
const mockRanking = [
  { user: 'carlos_hn',  pts: 47 },
  { user: 'maria_cr',   pts: 41 },
  { user: 'pedro_gt',   pts: 38 },
  { user: 'ana_sv',     pts: 32 },
  { user: 'jose_ni',    pts: 28 },
]

const features = [
  { icon: '⚽', title: 'Ligas de CA', desc: 'Liga Nacional de Honduras, Costa Rica, Guatemala y más.' },
  { icon: '🏆', title: 'Puntos automáticos', desc: 'Resultado exacto vale 3 pts, ganador correcto 1 pt. Se calculan solos.' },
  { icon: '👥', title: 'Invitá a tus amigos', desc: 'Compartí un código o link. Solo se unen antes de la primera jornada.' },
  { icon: '📊', title: 'Ranking en vivo', desc: 'La tabla se actualiza automáticamente cuando terminan los partidos.' },
  { icon: '📅', title: 'Jornada a jornada', desc: 'El organizador abre cada jornada. Predecís antes de que empiece.' },
  { icon: '💰', title: 'Con o sin dinero', desc: 'Creá quinielas gratis o con pozo. Vos definís las reglas.' },
]
</script>

<style scoped>
.landing { position: relative; overflow: hidden; }

/* Hero */
.hero { padding: 5rem 0 4rem; min-height: 90vh; display: flex; align-items: center; }
.hero-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }

.hero-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: var(--accent-glow); border: 1px solid rgba(0,229,160,0.25);
  color: var(--accent); padding: 0.4rem 1rem; border-radius: 20px;
  font-size: 0.82rem; font-weight: 600; letter-spacing: 0.05em;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3rem, 6vw, 5rem);
  line-height: 0.95;
  letter-spacing: 0.03em;
  color: var(--text-primary);
  margin-bottom: 1.25rem;
}
.hero-title .accent { color: var(--accent); }

.hero-desc {
  color: var(--text-secondary);
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 440px;
}

.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

/* Visual card */
.visual-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.vc-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1.25rem;
}
.vc-name { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }

.vc-ranking { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1.25rem; }

.vc-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.55rem 0.75rem; border-radius: var(--radius);
  background: var(--bg-surface);
}

.vc-rank {
  width: 22px; font-family: var(--font-display); font-size: 1.1rem;
  color: var(--text-muted); text-align: center;
}
.vc-rank.gold   { color: #ffd700; }
.vc-rank.silver { color: #c0c0c0; }

.vc-user { flex: 1; font-size: 0.88rem; color: var(--text-primary); }
.vc-pts  { font-weight: 600; color: var(--accent); font-size: 0.88rem; }

.vc-footer {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.78rem; color: var(--text-muted);
  padding-top: 1rem; border-top: 1px solid var(--border);
}

/* Features */
.features { padding: 4rem 0; }
.features-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
}

.feature-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 1.5rem;
  transition: border-color 0.2s, transform 0.2s;
}
.feature-card:hover { border-color: var(--border-light); transform: translateY(-2px); }

.feature-icon  { font-size: 1.75rem; margin-bottom: 0.75rem; }
.feature-title { font-weight: 600; color: var(--text-primary); margin-bottom: 0.4rem; }
.feature-desc  { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6; }

/* CTA */
.cta { padding: 5rem 0; text-align: center; }
.cta-inner { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.cta-title {
  font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.5rem);
  letter-spacing: 0.05em; color: var(--text-primary);
}
.cta-desc { color: var(--text-secondary); font-size: 1rem; margin-bottom: 0.5rem; }

/* Footer */
.footer { border-top: 1px solid var(--border); padding: 1.5rem 0; }
.footer-inner { display: flex; align-items: center; justify-content: space-between; }
.footer-logo  { font-family: var(--font-display); font-size: 1rem; letter-spacing: 0.1em; color: var(--accent); }
.footer-copy  { font-size: 0.8rem; color: var(--text-muted); }

/* Fondo */
.bg-glow {
  position: fixed; border-radius: 50%;
  filter: blur(100px); pointer-events: none; z-index: -1;
}
.g1 { width: 600px; height: 600px; background: var(--accent); opacity: 0.04; top: -200px; right: -200px; }
.g2 { width: 500px; height: 500px; background: var(--accent-2); opacity: 0.04; bottom: -100px; left: -100px; }

@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; }
  .hero-visual { display: none; }
  .features-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
  .features-grid { grid-template-columns: 1fr; }
}
</style>
