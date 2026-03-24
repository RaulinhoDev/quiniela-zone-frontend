<template>
  <div class="landing">

    <!-- Navbar -->
    <nav class="nav" :class="{ scrolled: scrolled }">
      <div class="container nav-inner">
        <span class="nav-logo">⚽ QUINIELA ZONE</span>
        <div class="nav-links">
          <a href="#como" class="nav-link" @click.prevent="scrollTo('como')">Cómo funciona</a>
          <a href="#ligas" class="nav-link" @click.prevent="scrollTo('ligas')">Ligas</a>
        </div>
        <div class="nav-actions">
          <router-link to="/login" class="btn btn-secondary btn-sm">Iniciar sesión</router-link>
          <router-link to="/registro" class="btn btn-primary btn-sm">Registrarse gratis</router-link>
        </div>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-content">
          <div class="hero-badge">🏆 Ligas de América Central y Europa</div>
          <h1 class="hero-title">
            PREDECÍ.<br>
            COMPETÍ.<br>
            <span class="accent">GANÁ.</span>
          </h1>
          <p class="hero-desc">
            Creá tu quiniela del torneo, invitá a tus amigos y competí jornada a jornada.
            Puntos automáticos, ranking en tiempo real.
          </p>
          <div class="hero-actions">
            <router-link to="/registro" class="btn btn-primary btn-lg">
              Crear mi quiniela — gratis
            </router-link>
            <router-link to="/login" class="btn btn-secondary btn-lg">
              Ya tengo cuenta
            </router-link>
          </div>
          <div class="hero-stats">
            <div class="hs-item">
              <span class="hs-val">500+</span>
              <span class="hs-lbl">Usuarios</span>
            </div>
            <div class="hs-sep"></div>
            <div class="hs-item">
              <span class="hs-val">80+</span>
              <span class="hs-lbl">Quinielas</span>
            </div>
            <div class="hs-sep"></div>
            <div class="hs-item">
              <span class="hs-val">10k+</span>
              <span class="hs-lbl">Predicciones</span>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="visual-card">
            <div class="vc-header">
              <span class="vc-name">Clausura 2025 — Grupo del trabajo</span>
              <span class="badge badge-green">Activa</span>
            </div>

            <!-- Partido en vivo -->
            <div class="vc-live-match">
              <div class="vlm-label">
                <span class="vlm-dot"></span>
                EN VIVO · 67'
              </div>
              <div class="vlm-teams">
                <span class="vlm-team">Olimpia</span>
                <span class="vlm-score">2 — 1</span>
                <span class="vlm-team right">Motagua</span>
              </div>
            </div>

            <div class="vc-ranking">
              <div v-for="(p, i) in mockRanking" :key="i" class="vc-row" :class="{ 'vc-row-me': i === 2 }">
                <span class="vc-rank" :class="i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''">
                  {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1 }}
                </span>
                <span class="vc-user">{{ p.user }}</span>
                <span class="vc-pred">{{ p.pred }}</span>
                <span class="vc-pts">{{ p.pts }}<small>pts</small></span>
              </div>
            </div>

            <div class="vc-footer">
              <span>Jornada 8 de 18</span>
              <span class="badge badge-blue">5 participantes</span>
            </div>
          </div>

          <!-- Decoración flotante -->
          <div class="v-badge v-badge-1">⚽ Gol de Olimpia!</div>
          <div class="v-badge v-badge-2">🏆 +3 pts exacto</div>
        </div>
      </div>
    </section>

    <!-- Cómo funciona -->
    <section class="how" id="como">
      <div class="container">
        <div class="section-label">Cómo funciona</div>
        <h2 class="section-heading">Tres pasos para empezar</h2>
        <div class="steps-grid">
          <div class="step-card" v-for="(s, i) in steps" :key="i">
            <div class="step-num">0{{ i + 1 }}</div>
            <div class="step-icon">{{ s.icon }}</div>
            <div class="step-title">{{ s.title }}</div>
            <div class="step-desc">{{ s.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Ligas -->
    <section class="leagues" id="ligas">
      <div class="container">
        <div class="section-label">Competiciones disponibles</div>
        <h2 class="section-heading">Jugá con las ligas que seguís</h2>
        <div class="leagues-grid">
          <div class="league-item" v-for="l in leagues" :key="l.name">
            <span class="league-flag">{{ l.flag }}</span>
            <div>
              <div class="league-name">{{ l.name }}</div>
              <div class="league-country">{{ l.country }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="container">
        <div class="section-label">Por qué Quiniela Zone</div>
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
        <div class="cta-glow"></div>
        <h2 class="cta-title">¿LISTO PARA JUGAR?</h2>
        <p class="cta-desc">Registrate gratis y creá tu primera quiniela en menos de 2 minutos</p>
        <router-link to="/registro" class="btn btn-primary btn-lg">
          Empezar ahora — es gratis
        </router-link>
        <p class="cta-note">Sin tarjeta de crédito. Sin descargas.</p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container footer-inner">
        <span class="footer-logo">⚽ QUINIELA ZONE</span>
        <div class="footer-links">
          <router-link to="/login" class="footer-link">Iniciar sesión</router-link>
          <router-link to="/registro" class="footer-link">Registrarse</router-link>
        </div>
        <span class="footer-copy">Fútbol, siempre. 🇭🇳</span>
      </div>
    </footer>

    <div class="bg-glow g1"></div>
    <div class="bg-glow g2"></div>
    <div class="bg-glow g3"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 30
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const mockRanking = [
  { user: 'carlos_hn', pred: '2-1 ✓', pts: 47 },
  { user: 'maria_cr',  pred: '2-1 ✓', pts: 41 },
  { user: 'pedro_gt',  pred: '1-1',   pts: 38 },
  { user: 'ana_sv',    pred: '3-2',   pts: 32 },
  { user: 'jose_ni',   pred: '2-0',   pts: 28 },
]

const steps = [
  {
    icon: '🏆',
    title: 'Creá tu quiniela',
    desc: 'Elegí la competición, ponele nombre y configurá las reglas. En menos de un minuto.',
  },
  {
    icon: '📩',
    title: 'Invitá a tus amigos',
    desc: 'Compartí el código único o el link directo. Los participantes se unen antes de la primera jornada.',
  },
  {
    icon: '⚽',
    title: 'Predecí y competí',
    desc: 'Ingresá tus predicciones antes de cada jornada. Los puntos se calculan solos cuando terminan los partidos.',
  },
]

const leagues = [
  { flag: '🇭🇳', name: 'Liga Nacional', country: 'Honduras' },
  { flag: '🇨🇷', name: 'Primera División', country: 'Costa Rica' },
  { flag: '🇬🇹', name: 'Liga Nacional', country: 'Guatemala' },
  { flag: '🇸🇻', name: 'Primera División', country: 'El Salvador' },
  { flag: '🌍', name: 'UEFA Champions League', country: 'Europa' },
  { flag: '🌎', name: 'Copa Oro', country: 'CONCACAF' },
]

const features = [
  { icon: '📊', title: 'Puntos automáticos', desc: 'Exacto vale 3 pts, ganador correcto 1 pt. Sin calcular nada a mano.' },
  { icon: '🔴', title: 'Resultados en vivo', desc: 'Marcadores en tiempo real vía Server-Sent Events. El ranking se mueve mientras juegan los partidos.' },
  { icon: '🔒', title: 'Predicciones bloqueadas', desc: 'No podés cambiar tu predicción una vez que el partido comienza. Sin trampa.' },
  { icon: '📅', title: 'Jornada a jornada', desc: 'El organizador abre cada jornada cuando quiere. Predecís hasta que empiece el primer partido.' },
  { icon: '👑', title: 'Premium sin límites', desc: 'Quinielas ilimitadas, hasta 50 participantes. Upgrade cuando quieras.' },
  { icon: '🔗', title: 'Invitación por link', desc: 'Compartí un link directo o código. Tus amigos se unen en un click desde el celular.' },
]
</script>

<style scoped>
.landing { position: relative; overflow-x: hidden; }

/* ── Navbar ─────────────────────────────────────────────────── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  padding: 1rem 0;
  transition: background 0.3s, backdrop-filter 0.3s, border-color 0.3s;
  border-bottom: 1px solid transparent;
}
.nav.scrolled {
  background: rgba(10,12,16,0.85);
  backdrop-filter: blur(12px);
  border-bottom-color: var(--border);
}
.nav-inner {
  display: flex; align-items: center; gap: 2rem;
}
.nav-logo {
  font-family: var(--font-display); font-size: 1.15rem;
  letter-spacing: 0.1em; color: var(--accent); white-space: nowrap;
}
.nav-links { display: flex; gap: 1.5rem; flex: 1; }
.nav-link {
  font-size: 0.85rem; color: var(--text-secondary); text-decoration: none;
  transition: color 0.15s;
}
.nav-link:hover { color: var(--text-primary); }
.nav-actions { display: flex; gap: 0.75rem; }

/* ── Hero ───────────────────────────────────────────────────── */
.hero {
  padding: 7rem 0 5rem;
  min-height: 100vh;
  display: flex; align-items: center;
}
.hero-inner {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 4rem; align-items: center;
}

.hero-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: var(--accent-glow); border: 1px solid rgba(0,229,160,0.25);
  color: var(--accent); padding: 0.4rem 1rem; border-radius: 20px;
  font-size: 0.8rem; font-weight: 600; letter-spacing: 0.04em;
  margin-bottom: 1.75rem;
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(3.2rem, 6vw, 5.5rem);
  line-height: 0.92;
  letter-spacing: 0.02em;
  color: var(--text-primary);
  margin-bottom: 1.5rem;
}
.hero-title .accent { color: var(--accent); }

.hero-desc {
  color: var(--text-secondary);
  font-size: 1.05rem; line-height: 1.75;
  margin-bottom: 2.25rem;
  max-width: 430px;
}

.hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2.5rem; }

.hero-stats {
  display: flex; align-items: center; gap: 1.5rem;
}
.hs-item { display: flex; flex-direction: column; gap: 0.1rem; }
.hs-val { font-family: var(--font-display); font-size: 1.6rem; color: var(--text-primary); line-height: 1; }
.hs-lbl { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
.hs-sep { width: 1px; height: 32px; background: var(--border); }

/* ── Visual Card ────────────────────────────────────────────── */
.hero-visual { position: relative; }

.visual-card {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
}

.vc-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.vc-name { font-weight: 600; font-size: 0.88rem; color: var(--text-primary); }

.vc-live-match {
  background: var(--bg-surface);
  border: 1px solid rgba(0,229,160,0.2);
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}
.vlm-label {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.65rem; font-weight: 700; letter-spacing: 0.06em;
  color: var(--accent); text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.vlm-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--accent);
  animation: pulse-dot 1.2s infinite;
}
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.vlm-teams {
  display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
}
.vlm-team { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); flex: 1; }
.vlm-team.right { text-align: right; }
.vlm-score {
  font-family: var(--font-display); font-size: 1.2rem; color: var(--accent);
  letter-spacing: 0.08em; text-align: center; min-width: 60px;
}

.vc-ranking { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }

.vc-row {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.45rem 0.65rem; border-radius: var(--radius);
  background: var(--bg-surface);
}
.vc-row-me { background: var(--accent-glow); border: 1px solid rgba(0,229,160,0.2); }

.vc-rank {
  width: 24px; font-size: 1rem; text-align: center;
  color: var(--text-muted);
}
.vc-rank.gold   { color: #ffd700; }
.vc-rank.silver { color: #c0c0c0; }
.vc-rank.bronze { color: #cd7f32; }

.vc-user { flex: 1; font-size: 0.85rem; color: var(--text-primary); }
.vc-pred { font-size: 0.75rem; color: var(--text-muted); min-width: 50px; text-align: center; }
.vc-pts  {
  font-family: var(--font-display); font-size: 1rem; color: var(--accent); min-width: 48px; text-align: right;
}
.vc-pts small { font-family: var(--font-body); font-size: 0.65rem; color: var(--text-muted); margin-left: 2px; }

.vc-footer {
  display: flex; align-items: center; justify-content: space-between;
  font-size: 0.78rem; color: var(--text-muted);
  padding-top: 0.75rem; border-top: 1px solid var(--border);
}

/* Badges flotantes */
.v-badge {
  position: absolute;
  background: var(--bg-card); border: 1px solid var(--border-light);
  padding: 0.5rem 0.85rem; border-radius: 20px;
  font-size: 0.8rem; font-weight: 600; color: var(--text-primary);
  box-shadow: var(--shadow-sm); white-space: nowrap;
}
.v-badge-1 {
  bottom: -1rem; left: -2rem;
  border-color: rgba(0,229,160,0.3); color: var(--accent);
  animation: float1 3s ease-in-out infinite;
}
.v-badge-2 {
  top: 1rem; right: -2rem;
  border-color: rgba(245,166,35,0.3); color: #f5a623;
  animation: float2 3.5s ease-in-out infinite;
}
@keyframes float1 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes float2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

/* ── Secciones comunes ──────────────────────────────────────── */
.section-label {
  font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--accent); margin-bottom: 0.5rem;
}
.section-heading {
  font-family: var(--font-display); font-size: clamp(1.8rem, 3.5vw, 2.5rem);
  letter-spacing: 0.03em; color: var(--text-primary); margin-bottom: 2.5rem;
}

/* ── Cómo funciona ──────────────────────────────────────────── */
.how { padding: 5rem 0; }

.steps-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
}
.step-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 2rem 1.5rem;
  position: relative; transition: border-color 0.2s, transform 0.2s;
}
.step-card:hover { border-color: var(--border-light); transform: translateY(-3px); }

.step-num {
  font-family: var(--font-display); font-size: 3.5rem; line-height: 1;
  color: var(--border-light); position: absolute; top: 1rem; right: 1.25rem;
  letter-spacing: -0.02em;
}
.step-icon  { font-size: 2rem; margin-bottom: 1rem; }
.step-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; }
.step-desc  { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.65; }

/* ── Ligas ──────────────────────────────────────────────────── */
.leagues { padding: 4rem 0; }
.leagues-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;
}
.league-item {
  display: flex; align-items: center; gap: 0.85rem;
  padding: 1rem 1.25rem;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); transition: border-color 0.2s;
}
.league-item:hover { border-color: var(--border-light); }
.league-flag  { font-size: 1.75rem; }
.league-name  { font-size: 0.88rem; font-weight: 600; color: var(--text-primary); }
.league-country { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.1rem; }

/* ── Features ───────────────────────────────────────────────── */
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

/* ── CTA ────────────────────────────────────────────────────── */
.cta { padding: 6rem 0; text-align: center; }
.cta-inner {
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  position: relative;
}
.cta-glow {
  position: absolute; width: 500px; height: 300px;
  background: radial-gradient(ellipse, rgba(0,229,160,0.12) 0%, transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  pointer-events: none;
}
.cta-title {
  font-family: var(--font-display); font-size: clamp(2.2rem, 5vw, 4rem);
  letter-spacing: 0.05em; color: var(--text-primary);
}
.cta-desc { color: var(--text-secondary); font-size: 1rem; max-width: 400px; }
.cta-note { font-size: 0.8rem; color: var(--text-muted); margin-top: -0.25rem; }

/* ── Footer ─────────────────────────────────────────────────── */
.footer { border-top: 1px solid var(--border); padding: 1.75rem 0; }
.footer-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
}
.footer-logo { font-family: var(--font-display); font-size: 1rem; letter-spacing: 0.1em; color: var(--accent); }
.footer-links { display: flex; gap: 1.5rem; }
.footer-link { font-size: 0.82rem; color: var(--text-muted); text-decoration: none; }
.footer-link:hover { color: var(--text-primary); }
.footer-copy { font-size: 0.8rem; color: var(--text-muted); }

/* ── Fondo ──────────────────────────────────────────────────── */
.bg-glow {
  position: fixed; border-radius: 50%;
  filter: blur(100px); pointer-events: none; z-index: -1;
}
.g1 { width: 700px; height: 700px; background: var(--accent);   opacity: 0.04; top: -300px;  right: -200px; }
.g2 { width: 500px; height: 500px; background: var(--accent-2); opacity: 0.04; bottom: -100px; left: -100px; }
.g3 { width: 400px; height: 400px; background: var(--accent);   opacity: 0.03; top: 60%;    left: 40%; }

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .steps-grid   { grid-template-columns: 1fr; }
  .leagues-grid { grid-template-columns: repeat(2, 1fr); }
  .features-grid{ grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .nav-links    { display: none; }
  .hero         { padding: 6rem 0 4rem; min-height: auto; }
  .hero-inner   { grid-template-columns: 1fr; }
  .hero-visual  { display: none; }
  .hero-title   { font-size: 3rem; }
}
@media (max-width: 540px) {
  .leagues-grid { grid-template-columns: 1fr; }
  .features-grid{ grid-template-columns: 1fr; }
  .footer-links { display: none; }
}
</style>
