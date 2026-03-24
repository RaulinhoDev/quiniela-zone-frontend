<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="modal-overlay"
        @mousedown.self="$emit('update:modelValue', false)"
      >
        <div class="modal" :class="size === 'lg' ? 'modal-lg' : ''" :style="maxWidth ? { maxWidth } : {}">
          <div class="modal-header">
            <span class="modal-title">{{ title }}</span>
            <button class="modal-close" @click="$emit('update:modelValue', false)">✕</button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title:      { type: String, default: '' },
  size:       { type: String, default: 'sm' },   // 'sm' | 'lg'
  maxWidth:   { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>
