<template>
  <div class="flex justify-center">
    <div class="w-full max-w-4xl">
      <div class="mb-6">
        <h1 class="text-3xl font-bold text-gray-900">ثبت درخواست جدید</h1>
        <p class="text-gray-600 mt-2">فرم ثبت درخواست جدید</p>
      </div>
      
      <div class="card">
      <form @submit.prevent="handleSubmit">
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {{ error }}
        </div>
        
        <!-- Request Template Selector -->
        <div class="mb-6" v-if="!isCustomer">
          <RequestTemplateSelector @template-applied="applyTemplate" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="label">تاریخ <span class="text-red-500">*</span></label>
            <PersianDatePicker v-model="form.date" placeholder="1403/08/15" />
          </div>
          
          <div>
            <label class="label">نام مشتری <span class="text-red-500">*</span></label>
            <input
              v-model="form.customerName"
              type="text"
              class="input"
              placeholder="نام مشتری"
              required
              :disabled="isCustomer"
            />
          </div>
          
          <div>
            <label class="label">شماره تماس <span class="text-red-500">*</span></label>
            <input
              v-model="form.customerPhone"
              type="tel"
              class="input"
              placeholder="09123456789"
              required
            />
          </div>
          
          <div>
            <label class="label">نام کاربر <span class="text-red-500">*</span></label>
            <input
              v-model="form.userName"
              type="text"
              class="input"
              placeholder="نام کاربر"
              required
            />
          </div>
          
          <div>
            <label class="label">سیستم <span class="text-red-500">*</span></label>
            <select v-model="form.system" class="input" required>
              <option value="">انتخاب کنید</option>
              <option v-for="system in SYSTEM_LIST" :key="system" :value="system">{{ system }}</option>
            </select>
          </div>
          
          <div>
            <label class="label">نوع درخواست <span class="text-red-500">*</span></label>
            <select v-model="form.requestType" class="input" required>
              <option value="">انتخاب کنید</option>
              <option v-for="type in REQUEST_TYPES" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          
          <div v-if="!isCustomer">
            <label class="label">وضعیت <span class="text-red-500">*</span></label>
            <select v-model="form.status" class="input" required>
              <option value="">انتخاب کنید</option>
              <option value="باز">باز</option>
              <option value="در درست اقدام">در درست اقدام</option>
              <option value="انجام">انجام</option>
            </select>
          </div>
          
          <div>
            <label class="label">اولویت</label>
            <select v-model="form.priority" class="input">
              <option value="متوسط">متوسط</option>
              <option value="کم">کم</option>
              <option value="زیاد">زیاد</option>
              <option value="فوری">فوری</option>
            </select>
          </div>
          
          <div v-if="!isCustomer">
            <label class="label">تاریخ سررسید</label>
            <PersianDatePicker v-model="form.dueDate" placeholder="1403/09/01" />
          </div>
        </div>
        
        <div class="mt-6">
          <label class="label">درخواست <span class="text-red-500">*</span></label>
          <textarea
            v-model="form.request"
            class="input"
            rows="4"
            placeholder="توضیحات درخواست"
            required
          ></textarea>
        </div>
        
        <div v-if="!isCustomer" class="mt-6">
          <label class="label">شرح اقدام <span class="text-red-500">*</span></label>
          <textarea
            v-model="form.actionDescription"
            class="input"
            rows="4"
            placeholder="شرح اقدامات انجام شده"
            required
          ></textarea>
        </div>
        
        <div v-if="!isCustomer" class="mt-6">
          <label class="label">شرح بستن درخواست</label>
          <textarea
            v-model="form.closeDescription"
            class="input"
            rows="3"
            placeholder="شرح بستن درخواست (اختیاری)"
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-4 space-x-reverse mt-8">
          <button
            type="button"
            @click="$router.push('/requests')"
            class="btn btn-secondary"
            :disabled="loading"
          >
            انصراف
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="loading"
          >
            <span v-if="loading" class="mr-2">
              <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            </span>
            ثبت درخواست
          </button>
        </div>
      </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRequestStore } from '@/store/requests'
import { useAuthStore } from '@/store/auth'
import { SYSTEM_LIST, REQUEST_TYPES } from '@/utils/constants'
import dateUtils from '@/utils/dateUtils'
import PersianDatePicker from '@/components/PersianDatePicker.vue'
import RequestTemplateSelector from '@/components/RequestTemplateSelector.vue'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const requestStore = useRequestStore()
const authStore = useAuthStore()
const { success, error: showError } = useToast()

const loading = ref(false)
const error = ref('')
const user = computed(() => authStore.user)
const isCustomer = computed(() => user.value?.role === 'customer')

const form = ref({
  date: dateUtils.getCurrentJalaliDate(),
  customerName: '',
  customerPhone: '',
  userName: '',
  system: '',
  request: '',
  requestType: '',
  actionDescription: '',
  closeDescription: '',
  status: 'باز',
  priority: 'متوسط',
  dueDate: '',
})

// Auto-fill customer name when component mounts
onMounted(() => {
  if (user.value?.name) {
    form.value.customerName = user.value.name
  }
})

const handleSubmit = async () => {
  error.value = ''
  loading.value = true
  
  try {
    // Convert Jalali dates to Gregorian and prepare data
    let submitData = {
      ...form.value,
      date: dateUtils.jalaliToGregorian(form.value.date),
    }
    
    // For customers, don't send fields they shouldn't have access to
    if (!isCustomer.value) {
      submitData.dueDate = form.value.dueDate ? dateUtils.jalaliToGregorian(form.value.dueDate) : undefined
    }
    
    await requestStore.createRequest(submitData)
    success('درخواست با موفقیت ثبت شد')
    router.push('/requests')
  } catch (err) {
    error.value = err.response?.data?.message || 'خطا در ثبت درخواست'
    showError(error.value)
  } finally {
    loading.value = false
  }
}

const applyTemplate = (template) => {
  if (!template) return
  
  if (template.defaultFields) {
    if (template.defaultFields.request) {
      form.value.request = template.defaultFields.request
    }
    if (template.defaultFields.actionDescription) {
      form.value.actionDescription = template.defaultFields.actionDescription
    }
  }
  
  if (template.system) {
    form.value.system = template.system
  }
  
  if (template.requestType) {
    form.value.requestType = template.requestType
  }
  
  if (template.defaultPriority) {
    form.value.priority = template.defaultPriority
  }
  
  success(`الگوی "${template.name}" اعمال شد`)
}
</script>

