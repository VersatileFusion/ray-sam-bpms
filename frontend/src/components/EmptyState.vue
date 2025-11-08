<template>
  <div
    class="relative isolate flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/40 bg-white/70 px-10 py-16 text-center shadow-soft backdrop-blur-xl transition-all duration-500 ease-spring hover:-translate-y-1 hover:shadow-strong"
  >
    <span
      class="pointer-events-none absolute inset-x-1/3 -top-12 h-32 rounded-full bg-gradient-to-r from-brand-400/30 via-iris-400/35 to-teal-400/30 blur-3xl"
    ></span>

    <div
      class="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-iris-500 to-teal-500 text-white shadow-glow animate-fade-in-down"
    >
      <slot name="icon">
        <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 13h6m-3-3v6m-7 5h14a2 2 0 002-2v-7l-4-4V4a2 2 0 00-2-2H8a2 2 0 00-2 2v4l-4 4v7a2 2 0 002 2z" />
        </svg>
      </slot>
    </div>

    <h3 class="relative text-2xl font-extrabold tracking-tight text-[rgb(var(--text-primary))]">
      {{ title }}
    </h3>

    <p class="relative max-w-md text-sm leading-relaxed text-[rgb(var(--text-secondary))]">
      <slot>{{ description }}</slot>
    </p>

    <div
      v-if="$slots.action"
      class="relative mt-4 flex items-center gap-3 font-medium text-brand-700"
    >
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: 'موردی یافت نشد',
  },
  description: {
    type: String,
    default: 'برای مشاهده نتایج، فیلترها را تغییر دهید یا مورد جدیدی اضافه کنید.',
  },
})
</script>
