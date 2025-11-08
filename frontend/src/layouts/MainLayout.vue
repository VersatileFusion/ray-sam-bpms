<template>
  <div class="relative min-h-screen overflow-hidden bg-aurora">
    <div class="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true">
      <div class="absolute -left-24 top-4 h-[420px] w-[420px] rounded-full bg-brand-400/25 blur-3xl"></div>
      <div class="absolute right-[-120px] top-48 h-[520px] w-[520px] rounded-full bg-iris-400/25 blur-[140px]"></div>
      <div class="absolute bottom-[-160px] left-1/3 h-[460px] w-[460px] rounded-full bg-teal-400/20 blur-[150px]"></div>
    </div>

    <div class="relative z-10 flex min-h-screen flex-col">
      <Header />

      <main class="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-10">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>

      <Footer />
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

