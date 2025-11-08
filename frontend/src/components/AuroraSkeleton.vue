<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-white/30 bg-white/50 shadow-soft backdrop-blur-xl"
    :class="containerClass"
  >
    <div class="pointer-events-none absolute inset-0 opacity-80" :class="[patternClass, 'animate-fade-in-down']"></div>
    <div class="relative grid gap-3 p-6" :class="gridClass">
      <div
        v-for="block in blocks"
        :key="block"
        class="h-4 w-full rounded-full bg-gradient-to-r from-smoke-100 via-white to-smoke-100/70"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  lines: {
    type: Number,
    default: 4,
  },
  tone: {
    type: String,
    default: 'brand',
    validator: (value) => ['brand', 'iris', 'teal'].includes(value),
  },
  compact: {
    type: Boolean,
    default: false,
  },
})

const blocks = computed(() => Array.from({ length: props.lines }, (_, index) => index))

const containerClass = computed(() => (props.compact ? 'min-h-[128px]' : 'min-h-[160px]'))
const gridClass = computed(() => (props.compact ? 'gap-2.5' : 'gap-3.5'))
const patternClass = computed(() => {
  if (props.tone === 'iris') {
    return 'bg-gradient-to-tr from-iris-200/30 via-white/30 to-iris-300/40'
  }
  if (props.tone === 'teal') {
    return 'bg-gradient-to-tr from-teal-200/25 via-white/30 to-teal-300/35'
  }
  return 'bg-gradient-to-tr from-brand-200/25 via-white/30 to-brand-300/40'
})
</script>

