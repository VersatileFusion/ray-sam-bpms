<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <div class="flex-grow flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p class="text-xl text-gray-600 mb-8">صفحه مورد نظر یافت نشد</p>
        <router-link to="/" class="btn btn-primary">
          بازگشت به صفحه اصلی
        </router-link>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import Footer from '@/components/Footer.vue'
// 404 Not Found page
</script>

