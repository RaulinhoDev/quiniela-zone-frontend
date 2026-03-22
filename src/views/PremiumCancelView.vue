<template>
  <div class="auth-page">
    <div class="auth-box" style="text-align:center">
      <div class="cancel-icon">😔</div>
      <h1 class="cancel-title">Pago cancelado</h1>
      <p class="cancel-desc">No se realizó ningún cargo. Podés volver a intentarlo cuando quieras.</p>
      <router-link to="/app/premium" class="btn btn-primary btn-block" style="margin-top:1.5rem">
        Ver planes
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.auth-page    { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.auth-box     { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 2.5rem; width: 100%; max-width: 420px; }
.cancel-icon  { font-size: 4rem; margin-bottom: 1rem; }
.cancel-title { font-family: var(--font-display); font-size: 1.6rem; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
.cancel-desc  { color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; }
</style>
