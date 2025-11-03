<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">گزارش‌ها و خروجی</h1>
        <p class="text-gray-600 mt-2">تولید و دریافت گزارش‌های مختلف</p>
      </div>
    </div>

    <!-- Report Options -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- Excel Export -->
      <div class="card hover-lift cursor-pointer" @click="exportToExcel">
        <div class="flex flex-col items-center text-center p-6">
          <div class="bg-green-100 rounded-full p-4 mb-4">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">خروجی Excel</h3>
          <p class="text-gray-600 text-sm">خروجی کامل درخواست‌ها به فرمت Excel</p>
        </div>
      </div>

      <!-- CSV Export -->
      <div class="card hover-lift cursor-pointer" @click="exportToCSV">
        <div class="flex flex-col items-center text-center p-6">
          <div class="bg-blue-100 rounded-full p-4 mb-4">
            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">خروجی CSV</h3>
          <p class="text-gray-600 text-sm">خروجی کامل درخواست‌ها به فرمت CSV</p>
        </div>
      </div>

      <!-- Advanced Report -->
      <div class="card hover-lift cursor-pointer" @click="exportAdvancedReport">
        <div class="flex flex-col items-center text-center p-6">
          <div class="bg-purple-100 rounded-full p-4 mb-4">
            <svg class="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">گزارش پیشرفته</h3>
          <p class="text-gray-600 text-sm">گزارش Excel با چندین برگه و دسته‌بندی</p>
        </div>
      </div>

    </div>

    <!-- Filters -->
    <div class="card mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">فیلترهای گزارش</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="label">از تاریخ</label>
          <PersianDatePicker 
            v-model="filters.startDate" 
            placeholder="1403/01/01"
          />
        </div>
        <div>
          <label class="label">تا تاریخ</label>
          <PersianDatePicker 
            v-model="filters.endDate" 
            placeholder="1403/12/29"
          />
        </div>
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
        <div>
          <label class="label">اختصاص یافته به</label>
          <select v-model="filters.assignedTo" class="input">
            <option value="">همه</option>
            <option v-for="user in assignableUsers" :key="user._id" :value="user._id">{{ user.name }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="clearFilters" class="btn btn-secondary w-full">پاک کردن فیلترها</button>
        </div>
      </div>
    </div>

    <!-- Export Button -->
    <div class="text-center">
      <button 
        @click="showExportDialog" 
        class="btn btn-primary text-lg px-8 py-4"
        :disabled="exporting"
      >
        <span v-if="exporting" class="mr-2">
          <span class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        </span>
        <span v-else class="mr-2">
          <svg class="w-6 h-6 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </span>
        {{ exporting ? 'در حال تولید گزارش...' : 'تولید گزارش با فیلترهای انتخاب شده' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { useUserStore } from '@/store/users'
import { reportService } from '@/services/reportService'
import { SYSTEM_LIST } from '@/utils/constants'
import dateUtils from '@/utils/dateUtils'
import PersianDatePicker from '@/components/PersianDatePicker.vue'
import Swal from 'sweetalert2'

const authStore = useAuthStore()
const userStore = useUserStore()

const exporting = ref(false)
const filters = ref({
  startDate: '',
  endDate: '',
  status: '',
  system: '',
  priority: '',
  assignedTo: ''
})

const user = computed(() => authStore.user)
const users = computed(() => userStore.users)
const assignableUsers = computed(() => {
  return users.value.filter(u => u.role === 'admin' || u.role === 'user')
})

const getExportParams = () => {
  const params = {}
  
  if (filters.value.startDate) {
    params.startDate = dateUtils.jalaliToGregorian(filters.value.startDate)
  }
  if (filters.value.endDate) {
    params.endDate = dateUtils.jalaliToGregorian(filters.value.endDate)
  }
  if (filters.value.status) params.status = filters.value.status
  if (filters.value.system) params.system = filters.value.system
  if (filters.value.priority) params.priority = filters.value.priority
  if (filters.value.assignedTo) params.assignedTo = filters.value.assignedTo
  
  return params
}

const showExportDialog = async () => {
  const result = await Swal.fire({
    title: 'انتخاب نوع گزارش',
    text: 'لطفا نوع گزارش مورد نظر را انتخاب کنید',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Excel',
    cancelButtonText: 'CSV',
    showDenyButton: true,
    denyButtonText: 'پیشرفته',
    showCloseButton: true,
    reverseButtons: true
  })

  if (result.isConfirmed) {
    await exportToExcel()
  } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
    await exportToCSV()
  } else if (result.isDenied) {
    await exportAdvancedReport()
  }
}

const exportToExcel = async () => {
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

const clearFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    status: '',
    system: '',
    priority: '',
    assignedTo: ''
  }
}

onMounted(async () => {
  if (user.value?.role !== 'customer') {
    await userStore.fetchUsers()
  }
})
</script>

