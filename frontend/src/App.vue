<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <router-view v-slot="{ Component, route }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <ToastContainer />
  </div>
</template>

<script setup>
import ToastContainer from '@/components/ToastContainer.vue'
import { useDarkMode } from '@/composables/useDarkMode'

// Initialize dark mode - this will set up reactive state
useDarkMode()
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

