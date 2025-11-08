<template>
  <header class="sticky top-0 z-50 border-b border-white/30 bg-glass backdrop-blur-xl shadow-soft">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3 lg:gap-6">
        <button
          @click="toggleMobileMenu"
          class="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-white/70 text-smoke-500 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:text-brand-600 hover:shadow-soft md:hidden"
          aria-label="باز و بسته کردن منو"
          :aria-expanded="showMobileMenu"
        >
          <svg v-if="!showMobileMenu" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <router-link
          to="/"
          class="group flex flex-1 items-center gap-2 overflow-hidden rounded-2xl border border-transparent px-1 py-1 text-sm font-semibold duration-300 ease-spring"
        >
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-iris-500 to-teal-500 text-white shadow-glow">
            ر‌س
          </span>
          <span
            class="truncate text-base font-extrabold tracking-tight text-smoke-900 sm:text-lg lg:text-xl gradient-text"
          >
            سیستم مدیریت فرآیند رایسا و سامیار
          </span>
        </router-link>

        <nav class="hidden lg:flex items-center gap-2 xl:gap-3">
          <router-link :class="navClasses('/')" to="/">
            داشبورد
          </router-link>
          <router-link :class="navClasses('/requests')" to="/requests">
            درخواست‌ها
          </router-link>
          <router-link v-if="!isCustomer" :class="navClasses('/reports')" to="/reports">
            گزارش‌ها
          </router-link>
          <router-link v-if="!isCustomer" :class="navClasses('/scheduled-reports')" to="/scheduled-reports">
            گزارش‌های زمان‌بندی
          </router-link>
          <router-link v-if="!isCustomer" :class="navClasses('/export-history')" to="/export-history">
            تاریخچه خروجی
          </router-link>

          <div v-if="isAdmin" class="relative" ref="managementMenuRef">
            <button
              type="button"
              @click="toggleManagementMenu"
              :class="[navLinkBaseClass, showManagementMenu ? navLinkActiveClass : '']"
              :aria-expanded="showManagementMenu"
              aria-haspopup="true"
            >
              <span class="flex items-center gap-1">
                مدیریت
                <svg class="h-4 w-4 transition-transform duration-200" :class="{ 'rotate-180': showManagementMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            <transition name="menu">
              <div
                v-show="showManagementMenu"
                class="absolute left-0 mt-3 w-56 rounded-3xl border border-white/40 bg-white/80 p-3 shadow-soft backdrop-blur-xl"
              >
                <router-link
                  to="/admin"
                  :class="dropdownLinkClasses('/admin')"
                  @click="closeMenus"
                >
                  داشبورد مدیریت
                </router-link>
                <router-link
                  to="/admin/users"
                  :class="dropdownLinkClasses('/admin/users')"
                  @click="closeMenus"
                >
                  مدیریت کاربران
                </router-link>
                <router-link
                  to="/admin/customers"
                  :class="dropdownLinkClasses('/admin/customers')"
                  @click="closeMenus"
                >
                  مشتریان
                </router-link>
                <router-link
                  to="/admin/specialists"
                  :class="dropdownLinkClasses('/admin/specialists')"
                  @click="closeMenus"
                >
                  متخصصین
                </router-link>
              </div>
            </transition>
          </div>
        </nav>

        <div class="flex items-center justify-end gap-2 sm:gap-3">
          <GlobalSearch ref="globalSearchRef" />

          <router-link
            to="/notifications"
            class="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/70 text-smoke-500 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:text-brand-600 hover:shadow-soft"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M15 17h5l-1.4-1.4c-.38-.38-.6-.89-.6-1.42V11a6 6 0 00-4-5.66V5a2 2 0 10-4 0v.34A6 6 0 006 11v3.18c0 .53-.21 1.04-.59 1.42L4 17h5m6 0v1a3 3 0 11-6 0v-1" />
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-danger-500 to-danger-400 text-[11px] font-semibold text-white shadow-soft"
            >
              {{ unreadCount }}
            </span>
          </router-link>

          <button
            @click="toggleDarkMode"
            :title="isDark ? 'روشن' : 'تاریک'"
            class="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/70 text-smoke-500 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:text-brand-600 hover:shadow-soft"
          >
            <svg v-if="isDark" class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.71-.71M6.34 6.34l-.71-.71m12.73 0l-.71.71M6.34 17.66l-.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <svg v-else class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M20.35 15.35A9 9 0 018.65 3.65 9 9 0 0012 21a9 9 0 008.35-5.65z" />
            </svg>
          </button>

          <div class="relative" ref="userMenuRef">
            <button
              class="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/70 px-2 py-1.5 text-sm font-semibold text-smoke-600 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:text-brand-600 hover:shadow-soft"
              @click="toggleUserMenu"
            >
              <span class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-iris-500 to-teal-500 text-base font-bold text-white shadow-glow">
                {{ userInitials }}
              </span>
              <span class="hidden md:block truncate max-w-[140px]">{{ user?.name }}</span>
              <svg class="h-4 w-4 transition-transform duration-200" :class="{ 'rotate-180': showMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <transition name="menu">
              <div
                v-show="showMenu"
                class="absolute left-0 mt-3 w-52 rounded-3xl border border-white/40 bg-white/80 p-3 shadow-soft backdrop-blur-xl"
              >
                <router-link
                  to="/profile"
                  class="flex items-center justify-between gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-smoke-600 transition-all duration-200 hover:bg-white/70 hover:text-brand-600"
                  @click="closeMenus"
                >
                  <span>پروفایل</span>
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 5l7 7-7 7" />
                  </svg>
                </router-link>
                <button
                  @click="handleLogout"
                  class="mt-2 flex w-full items-center justify-between gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-danger-600 transition-all duration-200 hover:bg-danger-50/80"
                >
                  <span>خروج</span>
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M17 16l4-4-4-4m-7 4h11M7 4v16" />
                  </svg>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <transition name="mobile">
        <nav
          v-if="showMobileMenu"
          class="md:hidden overflow-hidden rounded-3xl border border-white/40 bg-white/80 p-4 shadow-soft backdrop-blur-xl"
        >
          <div class="flex flex-col gap-2 text-sm font-medium text-smoke-600">
            <router-link :class="mobileLinkClasses('/')" to="/" @click="closeMenus">
              داشبورد
            </router-link>
            <router-link :class="mobileLinkClasses('/requests')" to="/requests" @click="closeMenus">
              درخواست‌ها
            </router-link>
            <router-link
              v-if="!isCustomer"
              :class="mobileLinkClasses('/reports')"
              to="/reports"
              @click="closeMenus"
            >
              گزارش‌ها
            </router-link>
            <router-link
              v-if="!isCustomer"
              :class="mobileLinkClasses('/scheduled-reports')"
              to="/scheduled-reports"
              @click="closeMenus"
            >
              گزارش‌های زمان‌بندی
            </router-link>
            <router-link
              v-if="!isCustomer"
              :class="mobileLinkClasses('/export-history')"
              to="/export-history"
              @click="closeMenus"
            >
              تاریخچه خروجی
            </router-link>
            <div v-if="isAdmin" class="mt-2 grid gap-2 pt-2">
              <p class="text-xs uppercase tracking-[0.3em] text-smoke-400">مدیریت</p>
              <router-link :class="mobileLinkClasses('/admin')" to="/admin" @click="closeMenus">
                داشبورد مدیریت
              </router-link>
              <router-link :class="mobileLinkClasses('/admin/users')" to="/admin/users" @click="closeMenus">
                مدیریت کاربران
              </router-link>
              <router-link :class="mobileLinkClasses('/admin/customers')" to="/admin/customers" @click="closeMenus">
                مشتریان
              </router-link>
              <router-link :class="mobileLinkClasses('/admin/specialists')" to="/admin/specialists" @click="closeMenus">
                متخصصین
              </router-link>
            </div>
          </div>
        </nav>
      </transition>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useNotificationStore } from '@/store/notifications'
import GlobalSearch from './GlobalSearch.vue'
import { useDarkMode } from '@/composables/useDarkMode'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { isDark, toggleDarkMode } = useDarkMode()

const showMenu = ref(false)
const showMobileMenu = ref(false)
const showManagementMenu = ref(false)
const globalSearchRef = ref(null)
const managementMenuRef = ref(null)
const userMenuRef = ref(null)

const user = computed(() => authStore.user)
const isAdmin = computed(() => authStore.isAdmin)
const isCustomer = computed(() => authStore.isCustomer)
const unreadCount = computed(() => notificationStore.unreadCount)

const userInitials = computed(() => {
  if (!user.value?.name) return '?'
  const names = user.value.name.split(' ')
  return names.map(n => n[0]).join('').toUpperCase()
})

const isActiveRoute = (match) => {
  if (Array.isArray(match)) {
    return match.some((m) => isActiveRoute(m))
  }
  if (match === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(match)
}

const navLinkBaseClass =
  'rounded-2xl px-4 py-2 text-sm font-semibold text-smoke-500 transition-all duration-200 ease-spring hover:-translate-y-0.5 hover:text-brand-600 hover:bg-white/80'
const navLinkActiveClass = 'bg-white/90 text-brand-600 shadow-inner'

const navClasses = (match) => [navLinkBaseClass, isActiveRoute(match) ? navLinkActiveClass : '']

const dropdownLinkClasses = (match) => [
  'block rounded-2xl px-4 py-2 text-sm font-medium text-smoke-600 transition-all duration-200 hover:bg-white/70 hover:text-brand-600',
  isActiveRoute(match) ? 'bg-white/80 text-brand-600' : '',
]

const mobileLinkClasses = (match) => [
  'rounded-2xl border border-transparent px-4 py-2 transition-all duration-200 hover:border-white/40 hover:bg-white/70',
  isActiveRoute(match) ? 'border-white/50 bg-white/80 text-brand-600 shadow-inner' : '',
]

const closeMenus = () => {
  showMenu.value = false
  showMobileMenu.value = false
  showManagementMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  if (showMobileMenu.value) {
    showMenu.value = false
    showManagementMenu.value = false
  }
}

const toggleManagementMenu = () => {
  showManagementMenu.value = !showManagementMenu.value
  if (showManagementMenu.value) {
    showMenu.value = false
  }
}

const toggleUserMenu = () => {
  showMenu.value = !showMenu.value
  if (showMenu.value) {
    showManagementMenu.value = false
    showMobileMenu.value = false
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    closeMenus()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const handleClickOutside = (event) => {
  if (managementMenuRef.value && !managementMenuRef.value.contains(event.target)) {
    showManagementMenu.value = false
  }

  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showMenu.value = false
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
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => route.fullPath,
  () => {
    closeMenus()
  }
)
</script>

