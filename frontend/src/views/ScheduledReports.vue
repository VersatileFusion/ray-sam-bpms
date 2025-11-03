<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">گزارش‌های زمان‌بندی شده</h1>
        <p class="text-gray-600 mt-2">مدیریت گزارش‌های خودکار</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <svg class="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        گزارش جدید
      </button>
    </div>

    <!-- Scheduled Reports List -->
    <div class="card">
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else-if="reports.length === 0" class="text-center py-20 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>گزارش زمان‌بندی شده‌ای ثبت نشده است</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="report in reports"
          :key="report._id"
          class="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-bold text-gray-900">{{ report.name }}</h3>
                <span :class="report.isActive ? 'badge badge-success' : 'badge badge-danger'">
                  {{ report.isActive ? 'فعال' : 'غیرفعال' }}
                </span>
                <span class="badge badge-info">
                  {{ getTypeLabel(report.type) }}
                </span>
              </div>
              <p v-if="report.description" class="text-gray-600 mb-2">{{ report.description }}</p>
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span>فرکانس: {{ getFrequencyLabel(report.schedule.frequency) }}</span>
                <span>زمان: {{ report.schedule.time }}</span>
                <span>تعداد اجرا: {{ report.runCount || 0 }}</span>
                <span v-if="report.lastRun">آخرین اجرا: {{ formatDate(report.lastRun) }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="editReport(report)"
                class="text-blue-600 hover:text-blue-900"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="toggleReport(report)"
                :class="report.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'"
              >
                <svg v-if="report.isActive" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
              <button
                @click="runReport(report)"
                class="text-green-600 hover:text-green-900"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                @click="deleteReport(report._id)"
                class="text-red-600 hover:text-red-900"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-600 mb-2">
              <strong>فیلترها:</strong>
              <span v-if="report.filters.status"> وضعیت: {{ report.filters.status }}</span>
              <span v-if="report.filters.system">، سیستم: {{ report.filters.system }}</span>
              <span v-if="!report.filters.status && !report.filters.system">بدون فیلتر</span>
            </p>
            <p class="text-sm text-gray-500">
              ایجاد شده توسط: {{ report.createdBy?.name }} • 
              اجرای بعدی: {{ report.nextRun ? formatDate(report.nextRun) : 'محاسبه نشده' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          {{ editingReport ? 'ویرایش گزارش' : 'گزارش زمان‌بندی شده جدید' }}
        </h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="label">نام گزارش <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" class="input" required />
            </div>
            
            <div>
              <label class="label">توضیحات</label>
              <textarea v-model="form.description" class="input" rows="2"></textarea>
            </div>
            
            <div>
              <label class="label">نوع گزارش <span class="text-red-500">*</span></label>
              <select v-model="form.type" class="input" required>
                <option value="">انتخاب کنید</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="advanced">گزارش پیشرفته</option>
              </select>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">فرکانس <span class="text-red-500">*</span></label>
                <select v-model="form.schedule.frequency" class="input" required @change="updateScheduleFields">
                  <option value="">انتخاب کنید</option>
                  <option value="daily">روزانه</option>
                  <option value="weekly">هفتگی</option>
                  <option value="monthly">ماهانه</option>
                </select>
              </div>
              
              <div v-if="form.schedule.frequency === 'weekly'">
                <label class="label">روز هفته <span class="text-red-500">*</span></label>
                <select v-model.number="form.schedule.day" class="input" required>
                  <option value="0">یکشنبه</option>
                  <option value="1">دوشنبه</option>
                  <option value="2">سه‌شنبه</option>
                  <option value="3">چهارشنبه</option>
                  <option value="4">پنج‌شنبه</option>
                  <option value="5">جمعه</option>
                  <option value="6">شنبه</option>
                </select>
              </div>
              
              <div v-if="form.schedule.frequency === 'monthly'">
                <label class="label">روز ماه <span class="text-red-500">*</span></label>
                <input v-model.number="form.schedule.day" type="number" min="1" max="31" class="input" required />
              </div>
              
              <div>
                <label class="label">زمان <span class="text-red-500">*</span></label>
                <input v-model="form.schedule.time" type="time" class="input" required />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">از تاریخ</label>
                <PersianDatePicker 
                  v-model="form.filters.startDate" 
                  placeholder="1403/01/01"
                />
              </div>
              <div>
                <label class="label">تا تاریخ</label>
                <PersianDatePicker 
                  v-model="form.filters.endDate" 
                  placeholder="1403/12/29"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">وضعیت</label>
                <select v-model="form.filters.status" class="input">
                  <option value="">همه</option>
                  <option value="باز">باز</option>
                  <option value="در درست اقدام">در درست اقدام</option>
                  <option value="انجام">انجام</option>
                </select>
              </div>
              <div>
                <label class="label">سیستم</label>
                <select v-model="form.filters.system" class="input">
                  <option value="">همه</option>
                  <option v-for="system in SYSTEM_LIST" :key="system" :value="system">{{ system }}</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="label">فعال/غیرفعال</label>
              <div class="flex items-center gap-4">
                <label class="flex items-center">
                  <input v-model="form.isActive" type="radio" :value="true" class="ml-2" />
                  <span>فعال</span>
                </label>
                <label class="flex items-center">
                  <input v-model="form.isActive" type="radio" :value="false" class="ml-2" />
                  <span>غیرفعال</span>
                </label>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-4 space-x-reverse mt-6">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              انصراف
            </button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="mr-2">
                <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </span>
              {{ editingReport ? 'ویرایش' : 'ایجاد' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { scheduledReportService } from '@/services/scheduledReportService'
import { SYSTEM_LIST } from '@/utils/constants'
import dateUtils from '@/utils/dateUtils'
import PersianDatePicker from '@/components/PersianDatePicker.vue'
import Swal from 'sweetalert2'

const loading = ref(false)
const saving = ref(false)
const showCreateModal = ref(false)
const editingReport = ref(null)
const reports = ref([])

const form = ref({
  name: '',
  description: '',
  type: '',
  schedule: {
    frequency: '',
    day: undefined,
    time: '09:00'
  },
  filters: {
    startDate: '',
    endDate: '',
    status: '',
    system: ''
  },
  isActive: true
})

const getTypeLabel = (type) => {
  const labels = {
    excel: 'Excel',
    csv: 'CSV',
    advanced: 'پیشرفته'
  }
  return labels[type] || type
}

const getFrequencyLabel = (frequency) => {
  const labels = {
    daily: 'روزانه',
    weekly: 'هفتگی',
    monthly: 'ماهانه'
  }
  return labels[frequency] || frequency
}

const formatDate = (date) => {
  if (!date) return ''
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD HH:mm')
}

const updateScheduleFields = () => {
  if (form.value.schedule.frequency === 'weekly') {
    form.value.schedule.day = 0 // Default to Sunday
  } else if (form.value.schedule.frequency === 'monthly') {
    form.value.schedule.day = 1 // Default to 1st of month
  } else {
    form.value.schedule.day = undefined
  }
}

const closeModal = () => {
  showCreateModal.value = false
  editingReport.value = null
  form.value = {
    name: '',
    description: '',
    type: '',
    schedule: {
      frequency: '',
      day: undefined,
      time: '09:00'
    },
    filters: {
      startDate: '',
      endDate: '',
      status: '',
      system: ''
    },
    isActive: true
  }
}

const editReport = (report) => {
  editingReport.value = report._id
  form.value = {
    name: report.name,
    description: report.description || '',
    type: report.type,
    schedule: {
      frequency: report.schedule.frequency,
      day: report.schedule.day,
      time: report.schedule.time
    },
    filters: {
      startDate: report.filters?.startDate ? dateUtils.gregorianToJalali(report.filters.startDate) : '',
      endDate: report.filters?.endDate ? dateUtils.gregorianToJalali(report.filters.endDate) : '',
      status: report.filters?.status || '',
      system: report.filters?.system || ''
    },
    isActive: report.isActive
  }
  showCreateModal.value = true
}

const handleSubmit = async () => {
  saving.value = true
  try {
    const submitData = {
      ...form.value,
      filters: {
        startDate: form.value.filters.startDate ? dateUtils.jalaliToGregorian(form.value.filters.startDate) : undefined,
        endDate: form.value.filters.endDate ? dateUtils.jalaliToGregorian(form.value.filters.endDate) : undefined,
        status: form.value.filters.status || undefined,
        system: form.value.filters.system || undefined
      }
    }
    
    if (editingReport.value) {
      await scheduledReportService.updateScheduledReport(editingReport.value, submitData)
    } else {
      await scheduledReportService.createScheduledReport(submitData)
    }
    
    await Swal.fire({
      icon: 'success',
      title: 'موفقیت‌آمیز!',
      text: editingReport.value ? 'گزارش با موفقیت ویرایش شد' : 'گزارش با موفقیت ایجاد شد',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#3085d6'
    })
    
    closeModal()
    await loadReports()
  } catch (error) {
    console.error('Error saving report:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: error.response?.data?.message || 'خطا در ذخیره گزارش',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  } finally {
    saving.value = false
  }
}

const toggleReport = async (report) => {
  try {
    await scheduledReportService.updateScheduledReport(report._id, {
      isActive: !report.isActive
    })
    await loadReports()
  } catch (error) {
    console.error('Error toggling report:', error)
  }
}

const runReport = async (report) => {
  try {
    await scheduledReportService.runScheduledReport(report._id)
    await Swal.fire({
      icon: 'success',
      title: 'موفقیت‌آمیز!',
      text: 'گزارش در صف اجرا قرار گرفت',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#3085d6'
    })
  } catch (error) {
    console.error('Error running report:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در اجرای گزارش',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  }
}

const deleteReport = async (id) => {
  const result = await Swal.fire({
    title: 'آیا از حذف این گزارش اطمینان دارید؟',
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
    await scheduledReportService.deleteScheduledReport(id)
    await Swal.fire({
      icon: 'success',
      title: 'موفقیت‌آمیز!',
      text: 'گزارش با موفقیت حذف شد.',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#3085d6'
    })
    await loadReports()
  } catch (error) {
    console.error('Error deleting report:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در حذف گزارش',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  }
}

const loadReports = async () => {
  loading.value = true
  try {
    const response = await scheduledReportService.getScheduledReports()
    if (response.success) {
      reports.value = response.reports || []
    }
  } catch (error) {
    console.error('Error loading reports:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadReports()
})
</script>

