<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-20 -right-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
      <div class="absolute -bottom-20 -left-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-float" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
    </div>
    
    <div class="max-w-md w-full p-8 relative z-10 animate-fade-in-up">
      <div class="glass rounded-3xl p-8 shadow-2xl">
        <div class="text-center mb-8">
          <div class="inline-block mb-4 animate-bounce">
            <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">سیستم مدیریت درخواست‌ها</h1>
          <p class="text-white opacity-90">رایسا و سامیار</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="space-y-6">
          <transition name="slide">
            <div v-if="error" class="bg-red-500 text-white px-4 py-3 rounded-xl flex items-center shadow-lg">
              <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ error }}
            </div>
          </transition>
          
          <div class="space-y-2">
            <label class="label text-white">نام کاربری</label>
            <div class="relative">
              <input
                v-model="username"
                type="text"
                class="input bg-white/90 backdrop-blur-sm pr-12"
                placeholder="نام کاربری خود را وارد کنید"
                required
                autocomplete="username"
              />
              <svg class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="label text-white">رمز عبور</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="input bg-white/90 backdrop-blur-sm pr-24"
                placeholder="رمز عبور خود را وارد کنید"
                required
                autocomplete="current-password"
              />
              <svg class="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            class="btn btn-primary w-full text-lg py-4 glow"
            :disabled="loading"
          >
            <span v-if="loading" class="mr-2">
              <span class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </span>
            <span v-else class="mr-2">🔐</span>
            ورود به سیستم
          </button>
        </form>
      </div>
      
      <div class="text-center mt-6 text-white text-sm opacity-80 animate-fade-in-down">
        <p>نسخه 1.0.0 - توسعه‌یافته توسط تیم رایسا</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  try {
    await authStore.login({
      username: username.value,
      password: password.value,
    })
    
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.message || 'نام کاربری یا رمز عبور اشتباه است'
  } finally {
    loading.value = false
  }
}
</script>

