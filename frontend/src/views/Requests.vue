<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">درخواست‌ها</h1>
        <p class="text-gray-600 mt-2">مدیریت و پیگیری درخواست‌ها</p>
      </div>
      <div class="flex gap-3">
        <div class="relative" v-if="user?.role !== 'customer'">
          <button 
            @click="showExportMenu = !showExportMenu"
            class="btn btn-secondary"
          >
            <svg class="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            خروجی
          </button>
          <div v-if="showExportMenu" class="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
            <button 
              @click="exportToExcel"
              class="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
            >
              <span>خروجی Excel</span>
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button 
              @click="exportToCSV"
              class="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center justify-between border-t border-gray-200"
            >
              <span>خروجی CSV</span>
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button 
              @click="exportAdvancedReport"
              class="w-full text-right px-4 py-2 hover:bg-gray-100 flex items-center justify-between border-t border-gray-200"
            >
              <span>گزارش پیشرفته</span>
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>
        <router-link to="/requests/create" class="btn btn-primary">
          <svg class="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          درخواست جدید
        </router-link>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="card mb-6">
      <h2 class="text-lg font-bold text-gray-900 mb-4">فیلترها</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label">وضعیت</label>
          <select v-model="filters.status" class="input">
            <option value="">همه</option>
            <option value="باز">باز</option>
            <option value="در درست اقدام">در درست اقدام</option>
            <option value="انجام">انجام</option>
          </select>
        </div>
        <div>
          <label class="label">سیستم</label>
          <select v-model="filters.system" class="input">
            <option value="">همه</option>
            <option v-for="system in SYSTEM_LIST" :key="system" :value="system">{{ system }}</option>
          </select>
        </div>
        <div>
          <label class="label">اولویت</label>
          <select v-model="filters.priority" class="input">
            <option value="">همه</option>
            <option value="کم">کم</option>
            <option value="متوسط">متوسط</option>
            <option value="زیاد">زیاد</option>
            <option value="فوری">فوری</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="applyFilters" class="btn btn-primary w-full">اعمال فیلتر</button>
        </div>
      </div>
    </div>
    
    <!-- Requests Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
      <div v-else-if="filteredRequests.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
        درخواستی یافت نشد
      </div>
      <div v-else>
        <!-- Bulk Actions Bar -->
        <BulkActions
          v-if="user?.role !== 'customer'"
          :selected-ids="selectedRequestIds"
          :loading="loading"
          @bulk-updated="handleBulkUpdated"
          @clear-selection="selectedRequestIds = []"
        />
        
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th v-if="user?.role !== 'customer'" class="px-4 py-3 text-right">
                  <input
                    type="checkbox"
                    :checked="selectedRequestIds.length === filteredRequests.length && filteredRequests.length > 0"
                    @change="toggleSelectAll"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تاریخ</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">مشتری</th>
                <th v-if="user?.role !== 'customer'" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">تماس</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">سیستم</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">درخواست</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">وضعیت</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">اولویت</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="request in filteredRequests" :key="request._id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td v-if="user?.role !== 'customer'" class="px-4 py-4">
                <input
                  type="checkbox"
                  :value="request._id"
                  v-model="selectedRequestIds"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ formatDate(request.date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ request.customerName }}</td>
              <td v-if="user?.role !== 'customer'" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <a :href="`tel:${request.customerPhone}`" class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  {{ request.customerPhone }}
                </a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{{ request.system }}</td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{{ truncate(request.request, 50) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(request.status)">
                  {{ request.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getPriorityBadgeClass(request.priority)">
                  {{ request.priority }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <router-link
                  :to="`/requests/${request._id}`"
                  class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 ml-4"
                >
                  مشاهده
                </router-link>
                <button
                  v-if="user?.role === 'admin'"
                  @click="editRequest(request)"
                  class="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 mr-4"
                >
                  ویرایش
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { useRequestStore } from '@/store/requests'
import { reportService } from '@/services/reportService'
import { SYSTEM_LIST, STATUS_COLORS, PRIORITY_COLORS } from '@/utils/constants'
import dateUtils from '@/utils/dateUtils'
import helpers from '@/utils/helpers'
import Swal from 'sweetalert2'
import BulkActions from '@/components/BulkActions.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const authStore = useAuthStore()
const requestStore = useRequestStore()
const { success } = useToast()

const loading = ref(false)
const showExportMenu = ref(false)
const exporting = ref(false)
const selectedRequestIds = ref([])
const filters = ref({
  status: '',
  system: '',
  priority: '',
})

const user = computed(() => authStore.user)
const requests = computed(() => requestStore.requests)
const filteredRequests = computed(() => requestStore.filteredRequests)

const applyFilters = () => {
  requestStore.setFilters(filters.value)
}

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    selectedRequestIds.value = filteredRequests.value.map(r => r._id)
  } else {
    selectedRequestIds.value = []
  }
}

const handleBulkUpdated = () => {
  selectedRequestIds.value = []
  requestStore.fetchRequests()
  success('عملیات با موفقیت انجام شد')
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'باز': 'badge badge-info',
    'در درست اقدام': 'badge badge-warning',
    'انجام': 'badge badge-success',
  }
  return classes[status] || 'badge badge-secondary'
}

const getPriorityBadgeClass = (priority) => {
  const colors = PRIORITY_COLORS
  const classes = {
    [colors['کم'] || 'green']: 'badge badge-success',
    [colors['متوسط'] || 'yellow']: 'badge badge-warning',
    [colors['زیاد'] || 'orange']: 'badge badge-info',
    [colors['فوری'] || 'red']: 'badge badge-danger',
  }
  return classes[priority] || 'badge badge-secondary'
}

const formatDate = (date) => {
  if (!date) return ''
  // If it's a Gregorian date string (YYYY-MM-DD or YYYY/MM/DD), convert from Gregorian to Jalali
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      // If it's already in YYYY/MM/DD format, convert to YYYY-MM-DD first
      const normalizedDate = date.includes('-') ? date : date.replace(/\//g, '-')
      return dateUtils.gregorianToJalali(normalizedDate)
    }
  }
  // For Date objects or ISO strings, format with Jalali calendar
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD')
}

const truncate = (text, length) => {
  return helpers.truncate(text, length)
}

const editRequest = (request) => {
  router.push(`/requests/${request._id}`)
}

const getExportParams = () => {
  const params = {}
  if (filters.value.status) params.status = filters.value.status
  if (filters.value.system) params.system = filters.value.system
  if (filters.value.priority) params.priority = filters.value.priority
  return params
}

const exportToExcel = async () => {
  showExportMenu.value = false
  exporting.value = true
  try {
    const params = getExportParams()
    await reportService.exportToExcel(params)
    await Swal.fire({
      icon: 'success',
      title: 'موفقیت‌آمیز!',
      text: 'فایل Excel با موفقیت دانلود شد.',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#3085d6'
    })
  } catch (error) {
    console.error('Export error:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در خروجی گرفتن فایل Excel',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  } finally {
    exporting.value = false
  }
}

const exportToCSV = async () => {
  showExportMenu.value = false
  exporting.value = true
  try {
    const params = getExportParams()
    await reportService.exportToCSV(params)
    await Swal.fire({
      icon: 'success',
      title: 'موفقیت‌آمیز!',
      text: 'فایل CSV با موفقیت دانلود شد.',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#3085d6'
    })
  } catch (error) {
    console.error('Export error:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در خروجی گرفتن فایل CSV',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  } finally {
    exporting.value = false
  }
}

const exportAdvancedReport = async () => {
  showExportMenu.value = false
  exporting.value = true
  try {
    const params = getExportParams()
    await reportService.exportAdvancedReport(params)
    await Swal.fire({
      icon: 'success',
      title: 'موفقیت‌آمیز!',
      text: 'گزارش پیشرفته با موفقیت دانلود شد.',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#3085d6'
    })
  } catch (error) {
    console.error('Export error:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در خروجی گرفتن گزارش پیشرفته',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  } finally {
    exporting.value = false
  }
}

// Close export menu when clicking outside
const handleClickOutside = (event) => {
  if (showExportMenu.value && !event.target.closest('.relative')) {
    showExportMenu.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await requestStore.fetchRequests()
  } finally {
    loading.value = false
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

