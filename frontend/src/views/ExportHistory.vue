<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">تاریخچه خروجی‌ها</h1>
        <p class="text-gray-600 mt-2">مشاهده تمامی خروجی‌های گرفته شده</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">کل خروجی‌ها</p>
            <p class="text-3xl font-bold text-gray-900">{{ statistics.total || 0 }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-blue-100">
            <div class="text-3xl">📊</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">موفق</p>
            <p class="text-3xl font-bold text-green-600">{{ statistics.successCount || 0 }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-green-100">
            <div class="text-3xl">✅</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">ناموفق</p>
            <p class="text-3xl font-bold text-red-600">{{ statistics.failedCount || 0 }}</p>
          </div>
          <div class="p-4 rounded-2xl bg-red-100">
            <div class="text-3xl">❌</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm mb-1">نرخ موفقیت</p>
            <p class="text-3xl font-bold text-blue-600">{{ statistics.successRate || 0 }}%</p>
          </div>
          <div class="p-4 rounded-2xl bg-blue-100">
            <div class="text-3xl">📈</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label">نوع خروجی</label>
          <select v-model="filters.exportType" class="input" @change="loadHistory">
            <option value="">همه</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
            <option value="advanced">پیشرفته</option>
          </select>
        </div>
        <div>
          <label class="label">از تاریخ</label>
          <PersianDatePicker 
            v-model="filters.startDate" 
            placeholder="1403/01/01"
            @update:modelValue="loadHistory"
          />
        </div>
        <div>
          <label class="label">تا تاریخ</label>
          <PersianDatePicker 
            v-model="filters.endDate" 
            placeholder="1403/12/29"
            @update:modelValue="loadHistory"
          />
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary w-full">پاک کردن</button>
        </div>
      </div>
    </div>

    <!-- Export History Table -->
    <div class="card">
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else-if="history.length === 0" class="text-center py-20 text-gray-500">
        <p>رکوردی یافت نشد</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نوع</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام فایل</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تعداد رکورد</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">حجم فایل</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">توسط</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in history" :key="item._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="badge badge-info">{{ getTypeLabel(item.exportType) }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ item.filename }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.recordCount || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatFileSize(item.fileSize || 0) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(item.status)">
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ item.exportedBy?.name || 'نامشخص' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(item.createdAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  v-if="item.status === 'failed'"
                  @click="deleteHistory(item._id)"
                  class="text-red-600 hover:text-red-900"
                >
                  حذف
                </button>
                <span v-else class="text-gray-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="mt-6 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          نمایش {{ (pagination.page - 1) * pagination.limit + 1 }} تا {{ Math.min(pagination.page * pagination.limit, pagination.total) }} از {{ pagination.total }}
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="btn btn-secondary"
          >
            قبلی
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="btn btn-secondary"
          >
            بعدی
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { exportHistoryService } from '@/services/exportHistoryService'
import dateUtils from '@/utils/dateUtils'
import PersianDatePicker from '@/components/PersianDatePicker.vue'
import Swal from 'sweetalert2'

const loading = ref(false)
const history = ref([])
const statistics = ref({
  total: 0,
  successCount: 0,
  failedCount: 0,
  successRate: 0
})
const pagination = ref({
  page: 1,
  limit: 25,
  total: 0,
  pages: 1
})
const filters = ref({
  exportType: '',
  startDate: '',
  endDate: ''
})

const getTypeLabel = (type) => {
  const labels = {
    excel: 'Excel',
    csv: 'CSV',
    advanced: 'پیشرفته'
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    success: 'موفق',
    failed: 'ناموفق',
    processing: 'در حال پردازش'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    success: 'badge badge-success',
    failed: 'badge badge-danger',
    processing: 'badge badge-warning'
  }
  return classes[status] || 'badge badge-secondary'
}

const formatDate = (date) => {
  if (!date) return ''
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD HH:mm')
}

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const changePage = (page) => {
  pagination.value.page = page
  loadHistory()
}

const clearFilters = () => {
  filters.value = {
    exportType: '',
    startDate: '',
    endDate: ''
  }
  loadHistory()
}

const deleteHistory = async (id) => {
  const result = await Swal.fire({
    title: 'آیا از حذف این رکورد اطمینان دارید؟',
    text: 'این عملیات قابل برگشت نیست.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'بله، حذف کن',
    cancelButtonText: 'لغو',
    reverseButtons: true
  })
  
  if (!result.isConfirmed) return
  
  try {
    await exportHistoryService.deleteExportHistory(id)
    await Swal.fire({
      icon: 'success',
      title: 'موفقیت‌آمیز!',
      text: 'رکورد با موفقیت حذف شد.',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#3085d6'
    })
    await loadHistory()
    await loadStatistics()
  } catch (error) {
    console.error('Error deleting history:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در حذف رکورد',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  }
}

const loadHistory = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    
    if (filters.value.exportType) params.exportType = filters.value.exportType
    if (filters.value.startDate) {
      params.startDate = dateUtils.jalaliToGregorian(filters.value.startDate)
    }
    if (filters.value.endDate) {
      params.endDate = dateUtils.jalaliToGregorian(filters.value.endDate)
    }
    
    const response = await exportHistoryService.getExportHistory(params)
    if (response.success) {
      history.value = response.data || []
      pagination.value = {
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 25,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1
      }
    }
  } catch (error) {
    console.error('Error loading history:', error)
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  try {
    const response = await exportHistoryService.getExportStatistics()
    if (response.success) {
      statistics.value = response.data || statistics.value
    }
  } catch (error) {
    console.error('Error loading statistics:', error)
  }
}

onMounted(async () => {
  await loadStatistics()
  await loadHistory()
})
</script>

