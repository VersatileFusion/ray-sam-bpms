<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4"
        @click.self="close"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700"
          @click.stop
        >
          <!-- Search Input -->
          <div class="p-4 border-b border-gray-200 dark:border-gray-700">
            <div class="relative">
              <input
                ref="searchInput"
                v-model="query"
                type="text"
                placeholder="جستجوی درخواست‌ها، مشتری‌ها، سیستم‌ها..."
                class="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                @input="handleSearch"
                @keydown.esc="close"
                @keydown.enter="handleEnter"
                @keydown.down.prevent="navigateDown"
                @keydown.up.prevent="navigateUp"
              />
              <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Results -->
          <div class="max-h-[60vh] overflow-y-auto">
            <div v-if="loading" class="p-8 text-center">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>

            <div v-else-if="!query.trim()" class="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>برای جستجو تایپ کنید...</p>
              <p class="text-xs mt-2">می‌توانید از کلیدهای میانبر استفاده کنید</p>
            </div>

            <div v-else-if="results.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>نتیجه‌ای یافت نشد</p>
            </div>

            <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
              <div
                v-for="(result, index) in results"
                :key="result._id"
                :class="[
                  'p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                  selectedIndex === index ? 'bg-gray-50 dark:bg-gray-700' : ''
                ]"
                @click="selectResult(result)"
                @mouseenter="selectedIndex = index"
              >
                <div class="flex items-start space-x-3 space-x-reverse">
                  <div class="flex-shrink-0">
                    <span :class="getStatusBadgeClass(result.status)" class="badge">
                      {{ result.status }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {{ highlightText(result.request || '', query) }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ result.customerName }} • {{ result.system }} • {{ formatDate(result.date) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div class="flex items-center space-x-4 space-x-reverse">
              <span>↑↓ برای حرکت</span>
              <span>Enter برای انتخاب</span>
              <span>Esc برای بستن</span>
            </div>
            <span v-if="results.length > 0">{{ results.length }} نتیجه</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import dateUtils from '@/utils/dateUtils'
import { STATUS } from '@/utils/constants'

const router = useRouter()

const isOpen = ref(false)
const query = ref('')
const results = ref([])
const loading = ref(false)
const selectedIndex = ref(-1)
const searchInput = ref(null)

const getStatusBadgeClass = (status) => {
  const classes = {
    [STATUS.OPEN]: 'badge badge-info',
    [STATUS.IN_PROGRESS]: 'badge badge-warning',
    [STATUS.COMPLETED]: 'badge badge-success',
  }
  return classes[status] || 'badge badge-secondary'
}

const formatDate = (date) => {
  if (!date) return ''
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD')
}

const highlightText = (text, searchQuery) => {
  if (!searchQuery.trim()) return text
  const regex = new RegExp(`(${searchQuery})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
}

const handleSearch = async () => {
  if (!query.value.trim()) {
    results.value = []
    return
  }

  loading.value = true
  try {
    const response = await api.get('/requests/search', {
      params: { q: query.value, limit: 10 }
    })
    if (response.data.success) {
      results.value = response.data.data || []
      selectedIndex.value = -1
    }
  } catch (error) {
    console.error('Search error:', error)
    results.value = []
  } finally {
    loading.value = false
  }
}

const handleEnter = () => {
  if (selectedIndex.value >= 0 && results.value[selectedIndex.value]) {
    selectResult(results.value[selectedIndex.value])
  } else if (results.value.length > 0) {
    selectResult(results.value[0])
  }
}

const navigateDown = () => {
  if (selectedIndex.value < results.value.length - 1) {
    selectedIndex.value++
  }
}

const navigateUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--
  }
}

const selectResult = (result) => {
  close()
  router.push(`/requests/${result._id}`)
}

const open = () => {
  isOpen.value = true
  query.value = ''
  results.value = []
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const close = () => {
  isOpen.value = false
  query.value = ''
  results.value = []
  selectedIndex.value = -1
}

// Keyboard shortcut: Cmd+K or Ctrl+K
const handleKeyDown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// Expose methods for parent components
defineExpose({
  open,
  close
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

