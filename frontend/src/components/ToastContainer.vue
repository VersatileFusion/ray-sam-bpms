<template>
  <div class="fixed inset-x-4 top-4 z-[9999] flex flex-col gap-3 sm:inset-x-auto sm:right-6">
    <TransitionGroup
      name="toast"
      tag="div"
      class="flex flex-col gap-3"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="getToastClasses(toast.type)"
        class="flex min-w-[300px] max-w-md items-start gap-3 rounded-3xl p-4 text-right shadow-soft backdrop-blur-xl animate-fade-in-down"
        role="alert"
      >
        <div
          :class="getIconClasses(toast.type)"
          class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl shadow-inner"
        >
          <!-- Success Icon -->
          <svg v-if="toast.type === 'success'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <!-- Error Icon -->
          <svg v-else-if="toast.type === 'error'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <!-- Warning Icon -->
          <svg v-else-if="toast.type === 'warning'" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <!-- Info Icon -->
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex flex-1 flex-col gap-1">
          <p class="text-sm font-semibold text-[rgb(var(--text-primary))]">
            {{ toast.message }}
          </p>
          <p v-if="toast.description" class="text-xs text-[rgb(var(--text-secondary))]">
            {{ toast.description }}
          </p>
        </div>
        <button
          @click="removeToast(toast.id)"
          class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-smoke-400 transition-colors hover:bg-white/60 hover:text-smoke-600"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const TOAST_STYLES = {
  success: {
    container: 'border border-success-200/70 bg-success-50/80 text-success-800',
    icon: 'bg-success-100/80 text-success-600',
  },
  error: {
    container: 'border border-danger-200/70 bg-danger-50/80 text-danger-800',
    icon: 'bg-danger-100/80 text-danger-600',
  },
  warning: {
    container: 'border border-warning-200/70 bg-warning-50/80 text-warning-800',
    icon: 'bg-warning-100/80 text-warning-600',
  },
  info: {
    container: 'border border-brand-200/70 bg-brand-50/80 text-brand-800',
    icon: 'bg-brand-100/80 text-brand-600',
  },
}

const getToastClasses = (type) => TOAST_STYLES[type]?.container || TOAST_STYLES.info.container

const getIconClasses = (type) => TOAST_STYLES[type]?.icon || TOAST_STYLES.info.icon
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
</style>

