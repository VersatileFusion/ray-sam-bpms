<template>
  <div class="animate-fade-in-up">
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h1 class="text-4xl font-bold gradient-text mb-2">داشبورد</h1>
          <p class="text-gray-600 text-lg">خوش آمدید، <span class="font-semibold text-primary-600">{{ user?.name }}</span></p>
        </div>
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl px-6 py-3 text-white shadow-lg animate-float">
          <p class="text-sm">📅 {{ getCurrentDate() }}</p>
        </div>
      </div>
    </div>
    
    <!-- Date Range Filter (only for admins) -->
    <div v-if="user?.role === 'admin'" class="mb-6 card">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="label">از تاریخ</label>
          <PersianDatePicker
            v-model="startDate"
            placeholder="1403/01/01"
            @update:modelValue="loadDashboardStats"
          />
        </div>
        <div>
          <label class="label">تا تاریخ</label>
          <PersianDatePicker
            v-model="endDate"
            placeholder="1403/12/29"
            @update:modelValue="loadDashboardStats"
          />
        </div>
        <div class="flex items-end">
          <button @click="clearDateFilter" class="btn btn-secondary w-full">
            حذف فیلتر تاریخ
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div 
        v-for="(stat, index) in statCards" 
        :key="stat.key"
        class="card hover-lift animate-fade-in-up"
        :style="`animation-delay: ${index * 0.1}s`"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">{{ stat.title }}</p>
            <p class="text-4xl font-bold mt-2" :class="stat.textColor">{{ dashboardStats.summary?.[stat.key] || 0 }}</p>
            <div v-if="stat.extra" class="mt-2 text-xs text-gray-500">
              {{ stat.extra }}
            </div>
          </div>
          <div class="p-4 rounded-2xl transform rotate-3" :class="stat.bgClass">
            <div class="text-4xl">
              {{ stat.icon }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section (only for admins) -->
    <div v-if="user?.role === 'admin'" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- Status Distribution Chart -->
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">توزیع وضعیت</h2>
        <div v-if="dashboardStats.byStatus && dashboardStats.byStatus.length > 0">
          <SimpleChart
            type="doughnut"
            :data="{
              labels: dashboardStats.byStatus.map(item => item.name),
              datasets: [{
                data: dashboardStats.byStatus.map(item => item.count),
                backgroundColor: ['#3B82F6', '#F59E0B', '#10B981']
              }]
            }"
            :options="{
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }"
            height="250px"
          />
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          داده‌ای برای نمایش وجود ندارد
        </div>
      </div>

      <!-- System Distribution Chart -->
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">توزیع بر اساس سیستم</h2>
        <div v-if="dashboardStats.bySystem && dashboardStats.bySystem.length > 0">
          <SimpleChart
            type="pie"
            :data="{
              labels: dashboardStats.bySystem.map(item => item.name),
              datasets: [{
                data: dashboardStats.bySystem.map(item => item.count),
                backgroundColor: [
                  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'
                ]
              }]
            }"
            :options="{
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }"
            height="250px"
          />
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          داده‌ای برای نمایش وجود ندارد
        </div>
      </div>

      <!-- Priority Distribution Chart -->
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">توزیع اولویت</h2>
        <div v-if="dashboardStats.byPriority && dashboardStats.byPriority.length > 0">
          <SimpleChart
            type="bar"
            :data="{
              labels: dashboardStats.byPriority.map(item => item.name),
              datasets: [{
                label: 'تعداد',
                data: dashboardStats.byPriority.map(item => item.count),
                backgroundColor: [
                  '#10B981', // کم - سبز
                  '#F59E0B', // متوسط - زرد
                  '#F97316', // زیاد - نارنجی
                  '#EF4444'  // فوری - قرمز
                ]
              }]
            }"
            :options="{
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false
                }
              }
            }"
            height="200px"
          />
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          داده‌ای برای نمایش وجود ندارد
        </div>
      </div>
      
      <!-- Trends Chart -->
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">روند درخواست‌ها (30 روز اخیر)</h2>
        <div v-if="dashboardStats.byDateRange && dashboardStats.byDateRange.length > 0">
          <SimpleChart
            type="line"
            :data="{
              labels: dashboardStats.byDateRange.slice(-10).map(item => formatDateForChart(item.date)),
              datasets: [{
                label: 'تعداد درخواست‌ها',
                data: dashboardStats.byDateRange.slice(-10).map(item => item.count),
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
              }]
            }"
            :options="{
              plugins: {
                legend: {
                  display: false
                }
              }
            }"
            height="250px"
          />
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          داده‌ای برای نمایش وجود ندارد
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">معیارهای عملکرد</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
            <span class="text-sm font-medium text-gray-700">نرخ تکمیل</span>
            <span class="text-2xl font-bold text-blue-600">{{ dashboardStats.summary?.completionRate || 0 }}%</span>
          </div>
          <div class="flex justify-between items-center p-4 bg-green-50 rounded-lg">
            <span class="text-sm font-medium text-gray-700">میانگین زمان حل (روز)</span>
            <span class="text-2xl font-bold text-green-600">{{ dashboardStats.summary?.avgResolutionDays || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Assignee Performance (only for admins) -->
    <div v-if="user?.role === 'admin'" class="card mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">عملکرد اختصاص‌یافتگان</h2>
      <div v-if="dashboardStats.byAssignee && dashboardStats.byAssignee.length > 0" class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">کل درخواست‌ها</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">انجام شده</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نرخ تکمیل</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="assignee in dashboardStats.byAssignee" :key="assignee.userId" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ assignee.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ assignee.total }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ assignee.completed }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="font-medium">{{ assignee.total > 0 ? Math.round((assignee.completed / assignee.total) * 100) : 0 }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="text-center py-8 text-gray-500">
        داده‌ای برای نمایش وجود ندارد
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">عملیات سریع</h2>
      <div class="flex flex-wrap gap-4">
        <router-link
          to="/requests/create"
          class="btn btn-primary"
        >
          <svg class="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          درخواست جدید
        </router-link>
        <router-link
          to="/requests"
          class="btn btn-secondary"
        >
          <svg class="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          مشاهده همه درخواست‌ها
        </router-link>
      </div>
    </div>
    
    <!-- Recent Requests -->
    <div class="card">
      <h2 class="text-xl font-bold text-gray-900 mb-4">درخواست‌های اخیر</h2>
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
      <div v-else-if="recentRequests.length === 0" class="text-center py-8 text-gray-500">
        درخواستی یافت نشد
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">مشتری</th>
              <th v-if="user?.role !== 'customer'" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تماس</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سیستم</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="request in recentRequests" :key="request._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ request.customerName }}</td>
              <td v-if="user?.role !== 'customer'" class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <a :href="`tel:${request.customerPhone}`" class="text-blue-600 hover:text-blue-800">{{ request.customerPhone }}</a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ request.system }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(request.status)">
                  {{ request.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(request.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <router-link
                  :to="`/requests/${request._id}`"
                  class="text-primary-600 hover:text-primary-900"
                >
                  مشاهده
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { dashboardService } from '@/services/dashboardService'
import { STATUS } from '@/utils/constants'
import dateUtils from '@/utils/dateUtils'
import PersianDatePicker from '@/components/PersianDatePicker.vue'
import SimpleChart from '@/components/SimpleChart.vue'

const authStore = useAuthStore()

const loading = ref(false)
const dashboardStats = ref({
  summary: {
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0,
    avgResolutionDays: 0
  },
  bySystem: [],
  byPriority: [],
  byStatus: [],
  byDateRange: [],
  byAssignee: [],
  recentRequests: []
})
const startDate = ref('')
const endDate = ref('')

const user = computed(() => authStore.user)
const recentRequests = computed(() => dashboardStats.value.recentRequests || [])

const statCards = computed(() => [
  {
    key: 'total',
    title: 'کل درخواست‌ها',
    icon: '📊',
    textColor: 'text-gray-900',
    bgClass: 'bg-gradient-to-br from-blue-100 to-blue-200'
  },
  {
    key: 'open',
    title: 'باز',
    icon: '🆕',
    textColor: 'text-blue-900',
    bgClass: 'bg-gradient-to-br from-purple-100 to-purple-200',
    extra: dashboardStats.value.summary?.total > 0 
      ? `${Math.round((dashboardStats.value.summary.open / dashboardStats.value.summary.total) * 100)}% از کل`
      : ''
  },
  {
    key: 'inProgress',
    title: 'در حال انجام',
    icon: '⏳',
    textColor: 'text-yellow-900',
    bgClass: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
    extra: dashboardStats.value.summary?.total > 0 
      ? `${Math.round((dashboardStats.value.summary.inProgress / dashboardStats.value.summary.total) * 100)}% از کل`
      : ''
  },
  {
    key: 'completed',
    title: 'انجام شده',
    icon: '✅',
    textColor: 'text-green-900',
    bgClass: 'bg-gradient-to-br from-green-100 to-green-200',
    extra: `${dashboardStats.value.summary?.completionRate || 0}% نرخ تکمیل`
  }
])

const getCurrentDate = () => {
  return dateUtils.getCurrentJalaliDate()
}

const getStatusBadgeClass = (status) => {
  const classes = {
    [STATUS.OPEN]: 'badge badge-info',
    [STATUS.IN_PROGRESS]: 'badge badge-warning',
    [STATUS.COMPLETED]: 'badge badge-success',
  }
  return classes[status] || 'badge badge-secondary'
}

const getStatusColor = (status) => {
  const colors = {
    'باز': 'bg-blue-500',
    'در درست اقدام': 'bg-yellow-500',
    'انجام': 'bg-green-500'
  }
  return colors[status] || 'bg-gray-500'
}

const getPriorityColor = (priority) => {
  const colors = {
    'کم': 'bg-green-500',
    'متوسط': 'bg-yellow-500',
    'زیاد': 'bg-orange-500',
    'فوری': 'bg-red-500'
  }
  return colors[priority] || 'bg-gray-500'
}

const getPercentage = (value, total) => {
  if (!total || total === 0) return 0
  return Math.round((value / total) * 100)
}

const formatDate = (date) => {
  if (!date) return ''
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      const normalizedDate = date.includes('-') ? date : date.replace(/\//g, '-')
      return dateUtils.gregorianToJalali(normalizedDate)
    }
  }
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD')
}

const formatDateForChart = (date) => {
  if (!date) return ''
  // Format for chart labels - short format
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const jalali = dateUtils.gregorianToJalali(date)
      return jalali.substring(5) // Return MM/DD
    }
  }
  return date
}

const loadDashboardStats = async () => {
  loading.value = true
  try {
    const params = {}
    // Only add date filters for admins
    if (user.value?.role === 'admin') {
      if (startDate.value) {
        params.startDate = dateUtils.jalaliToGregorian(startDate.value)
      }
      if (endDate.value) {
        params.endDate = dateUtils.jalaliToGregorian(endDate.value)
      }
    }

    const response = await dashboardService.getDashboardStats(params)
    if (response.success) {
      dashboardStats.value = response.data
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

const clearDateFilter = () => {
  startDate.value = ''
  endDate.value = ''
  loadDashboardStats()
}

onMounted(async () => {
  await loadDashboardStats()
})
</script>

