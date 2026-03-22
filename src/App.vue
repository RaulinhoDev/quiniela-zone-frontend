<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
</script>

<style>
/* Transición entre páginas */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Personalizar barra NProgress */
#nprogress .bar {
  background: #00e5a0 !important;
  height: 2.5px !important;
}
#nprogress .peg {
  box-shadow: 0 0 8px #00e5a0, 0 0 4px #00e5a0 !important;
}
</style>
