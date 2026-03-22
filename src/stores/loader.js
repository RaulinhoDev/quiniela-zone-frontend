import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLoaderStore = defineStore('loader', () => {
  const active   = ref(false)
  const requests = ref(0)

  function show() {
    requests.value++
    active.value = true
  }

  function hide() {
    requests.value = Math.max(0, requests.value - 1)
    if (requests.value === 0) {
      // Pequeño delay para evitar parpadeos en requests rápidos
      setTimeout(() => {
        if (requests.value === 0) active.value = false
      }, 200)
    }
  }

  return { active, show, hide }
})
