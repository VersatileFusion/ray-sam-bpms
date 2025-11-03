<template>
  <header class="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-8 space-x-reverse">
          <router-link to="/" class="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200">
            سیستم مدیریت فرآیند کسب و کار رایسا و سامیار
          </router-link>
          
          <!-- Mobile menu button -->
          <button
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <nav class="hidden md:flex items-center space-x-6 space-x-reverse">
            <router-link
              to="/"
              class="text-gray-700 hover:text-primary-600 transition-colors"
              active-class="text-primary-600 font-medium"
            >
              داشبورد
            </router-link>
            <router-link
              to="/requests"
              class="text-gray-700 hover:text-primary-600 transition-colors"
              active-class="text-primary-600 font-medium"
            >
              درخواست‌ها
            </router-link>
            <router-link
              v-if="!isCustomer"
              to="/reports"
              class="text-gray-700 hover:text-primary-600 transition-colors"
              active-class="text-primary-600 font-medium"
            >
              گزارش‌ها
            </router-link>
            <router-link
              v-if="!isCustomer"
              to="/scheduled-reports"
              class="text-gray-700 hover:text-primary-600 transition-colors"
              active-class="text-primary-600 font-medium"
            >
              گزارش‌های زمان‌بندی
            </router-link>
            <router-link
              v-if="!isCustomer"
              to="/export-history"
              class="text-gray-700 hover:text-primary-600 transition-colors"
              active-class="text-primary-600 font-medium"
            >
              تاریخچه خروجی
            </router-link>
            <router-link
              v-if="isAdmin"
              to="/admin/users"
              class="text-gray-700 hover:text-primary-600 transition-colors"
              active-class="text-primary-600 font-medium"
            >
              مدیریت کاربران
            </router-link>
          </nav>
          
          <!-- Mobile menu -->
          <nav
            v-if="showMobileMenu"
            class="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-40"
          >
            <div class="px-4 py-4 space-y-2">
              <router-link
                to="/"
                class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="showMobileMenu = false"
              >
                داشبورد
              </router-link>
              <router-link
                to="/requests"
                class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="showMobileMenu = false"
              >
                درخواست‌ها
              </router-link>
              <router-link
                v-if="!isCustomer"
                to="/reports"
                class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="showMobileMenu = false"
              >
                گزارش‌ها
              </router-link>
              <router-link
                v-if="isAdmin"
                to="/admin/users"
                class="block px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                @click="showMobileMenu = false"
              >
                مدیریت کاربران
              </router-link>
            </div>
          </nav>
        </div>
        
        <div class="flex items-center space-x-2 sm:space-x-4 space-x-reverse">
          <!-- Global Search (Keyboard shortcut: Cmd+K / Ctrl+K) -->
          <GlobalSearch ref="globalSearchRef" />
          
          <!-- Notifications -->
          <router-link
            to="/notifications"
            class="relative p-2 text-gray-700 hover:text-primary-600 transition-all duration-200 rounded-lg hover:bg-gray-100 transform hover:scale-110"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-md"
            >
              {{ unreadCount }}
            </span>
          </router-link>
          
          <!-- Dark Mode Toggle -->
          <button
            @click="toggleDarkMode"
            class="p-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transform hover:scale-110"
            :title="isDark ? 'روشن' : 'تاریک'"
          >
            <svg v-if="isDark" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
          
          <!-- User menu -->
          <div class="relative group">
            <button
              class="flex items-center space-x-2 space-x-reverse focus:outline-none hover:scale-105 transition-transform duration-200"
              @click="showMenu = !showMenu"
            >
              <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition-shadow">
                {{ userInitials }}
              </div>
              <span class="hidden md:block text-gray-700">{{ user?.name }}</span>
            </button>
            
            <div
              v-show="showMenu"
              class="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 animate-fade-in-down"
            >
              <router-link
                to="/profile"
                class="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                @click="showMenu = false"
              >
                پروفایل
              </router-link>
              <button
                @click="handleLogout"
                class="block w-full text-right px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useNotificationStore } from '@/store/notifications'
import GlobalSearch from './GlobalSearch.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { isDark, toggleDarkMode } = useDarkMode()

const showMenu = ref(false)
const showMobileMenu = ref(false)
const globalSearchRef = ref(null)

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const isCustomer = computed(() => authStore.isCustomer)
const unreadCount = computed(() => notificationStore.unreadCount)

const userInitials = computed(() => {
  if (!user.value?.name) return '?'
  const names = user.value.name.split(' ')
  return names.map(n => n[0]).join('').toUpperCase()
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

onMounted(async () => {
  if (authStore.user) {
    try {
      await notificationStore.fetchNotifications()
    } catch (error) {
      // Silently handle errors
      console.error('Failed to fetch notifications:', error)
    }
  }
})
</script>

