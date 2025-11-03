<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <Header />
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
</script>

