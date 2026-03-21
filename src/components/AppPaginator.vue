<template>
  <div v-if="totalPages > 1" class="paginator">
    <button class="pag-btn" @click="$emit('change', current - 1)" :disabled="current === 1">
      ←
    </button>

    <button
      v-for="page in pages"
      :key="page"
      class="pag-btn"
      :class="{ active: page === current }"
      @click="$emit('change', page)"
    >
      {{ page }}
    </button>

    <button class="pag-btn" @click="$emit('change', current + 1)" :disabled="current === totalPages">
      →
    </button>

    <span class="pag-info">{{ from }}–{{ to }} de {{ total }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total:    { type: Number, required: true },
  perPage:  { type: Number, default: 15 },
  current:  { type: Number, default: 1 },
})

defineEmits(['change'])

const totalPages = computed(() => Math.ceil(props.total / props.perPage))
const from       = computed(() => (props.current - 1) * props.perPage + 1)
const to         = computed(() => Math.min(props.current * props.perPage, props.total))

const pages = computed(() => {
  const p = []
  const delta = 2
  const left  = Math.max(1, props.current - delta)
  const right = Math.min(totalPages.value, props.current + delta)
  for (let i = left; i <= right; i++) p.push(i)
  return p
})
</script>

<style scoped>
.paginator {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 1rem 0 0; justify-content: flex-end;
}
.pag-btn {
  min-width: 32px; height: 32px; padding: 0 0.5rem;
  background: var(--bg-surface); border: 1px solid var(--border);
  border-radius: var(--radius); color: var(--text-secondary);
  font-size: 0.82rem; cursor: pointer; transition: all 0.15s;
}
.pag-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
.pag-btn.active { background: var(--accent); color: #0a0c10; border-color: var(--accent); font-weight: 700; }
.pag-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.pag-info { font-size: 0.78rem; color: var(--text-muted); margin-left: 0.5rem; }
</style>