<template>
  <div class="notfound-page">
    <div class="notfound-box">
      <div class="notfound-code">404</div>
      <h1 class="notfound-title">Página no encontrada</h1>
      <p class="notfound-desc">La dirección que buscás no existe o fue movida.</p>
      <router-link to="/" class="btn btn-primary">Volver al inicio</router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.notfound-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.notfound-box {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.notfound-code {
  font-family: var(--font-display);
  font-size: 8rem;
  line-height: 1;
  color: var(--border-light);
  letter-spacing: -0.04em;
}

.notfound-title {
  font-family: var(--font-display);
  font-size: 1.5rem;
  letter-spacing: 0.04em;
  color: var(--text-primary);
}

.notfound-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
</style>
