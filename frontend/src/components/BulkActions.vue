<template>
  <div v-if="selectedCount > 0" class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 z-50 md:relative md:shadow-none md:border-0 md:p-0 md:mb-4">
    <div class="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
        <span class="font-bold text-primary-600 dark:text-primary-400">{{ selectedCount }}</span> درخواست انتخاب شده
      </div>
      
      <div class="flex flex-wrap gap-2 w-full md:w-auto justify-center">
        <button
          @click="showAssignDialog = true"
          class="btn btn-secondary text-sm px-3 py-2"
          :disabled="loading"
        >
          <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          اختصاص
        </button>
        
        <button
          @click="showStatusDialog = true"
          class="btn btn-secondary text-sm px-3 py-2"
          :disabled="loading"
        >
          <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          تغییر وضعیت
        </button>
        
        <button
          @click="showPriorityDialog = true"
          class="btn btn-secondary text-sm px-3 py-2"
          :disabled="loading"
        >
          <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          تغییر اولویت
        </button>
        
        <button
          @click="handleBulkExport"
          class="btn btn-secondary text-sm px-3 py-2"
          :disabled="loading"
        >
          <svg class="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          خروجی
        </button>
        
        <button
          @click="handleClearSelection"
          class="btn btn-ghost text-sm px-3 py-2"
        >
          لغو انتخاب
        </button>
      </div>
    </div>
    
    <!-- Assign Dialog -->
    <div v-if="showAssignDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" @click.self="showAssignDialog = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">اختصاص به</h3>
        <select v-model="selectedUserId" class="input mb-4">
          <option value="">انتخاب کاربر</option>
          <option v-for="user in assignableUsers" :key="user._id" :value="user._id">
            {{ user.name }}
          </option>
        </select>
        <div class="flex gap-2 justify-end">
          <button @click="showAssignDialog = false" class="btn btn-secondary">انصراف</button>
          <button @click="handleBulkAssign" class="btn btn-primary" :disabled="!selectedUserId || loading">
            اختصاص
          </button>
        </div>
      </div>
    </div>
    
    <!-- Status Dialog -->
    <div v-if="showStatusDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" @click.self="showStatusDialog = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">تغییر وضعیت</h3>
        <select v-model="selectedStatus" class="input mb-4">
          <option value="باز">باز</option>
          <option value="در درست اقدام">در درست اقدام</option>
          <option value="انجام">انجام</option>
        </select>
        <div class="flex gap-2 justify-end">
          <button @click="showStatusDialog = false" class="btn btn-secondary">انصراف</button>
          <button @click="handleBulkStatusChange" class="btn btn-primary" :disabled="!selectedStatus || loading">
            اعمال
          </button>
        </div>
      </div>
    </div>
    
    <!-- Priority Dialog -->
    <div v-if="showPriorityDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4" @click.self="showPriorityDialog = false">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">تغییر اولویت</h3>
        <select v-model="selectedPriority" class="input mb-4">
          <option value="کم">کم</option>
          <option value="متوسط">متوسط</option>
          <option value="زیاد">زیاد</option>
          <option value="فوری">فوری</option>
        </select>
        <div class="flex gap-2 justify-end">
          <button @click="showPriorityDialog = false" class="btn btn-secondary">انصراف</button>
          <button @click="handleBulkPriorityChange" class="btn btn-primary" :disabled="!selectedPriority || loading">
            اعمال
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/users'
import { useToast } from '@/composables/useToast'
import api from '@/services/api'

const props = defineProps({
  selectedIds: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['bulk-updated', 'clear-selection'])

const userStore = useUserStore()
const { success, error: showError } = useToast()

const selectedCount = computed(() => props.selectedIds.length)
const assignableUsers = computed(() => userStore.users.filter(u => u.role === 'admin' || u.role === 'user'))

const showAssignDialog = ref(false)
const showStatusDialog = ref(false)
const showPriorityDialog = ref(false)
const selectedUserId = ref('')
const selectedStatus = ref('باز')
const selectedPriority = ref('متوسط')
const loadingBulk = ref(false)

const handleBulkAssign = async () => {
  if (!selectedUserId.value) return
  
  loadingBulk.value = true
  try {
    await api.post('/requests/bulk/assign', {
      requestIds: props.selectedIds,
      userId: selectedUserId.value
    })
    success(`${props.selectedIds.length} درخواست با موفقیت اختصاص داده شد`)
    showAssignDialog.value = false
    selectedUserId.value = ''
    emit('bulk-updated')
  } catch (error) {
    showError(error.response?.data?.message || 'خطا در اختصاص درخواست‌ها')
  } finally {
    loadingBulk.value = false
  }
}

const handleBulkStatusChange = async () => {
  if (!selectedStatus.value) return
  
  loadingBulk.value = true
  try {
    await api.post('/requests/bulk/status', {
      requestIds: props.selectedIds,
      status: selectedStatus.value
    })
    success(`${props.selectedIds.length} درخواست با موفقیت به‌روزرسانی شد`)
    showStatusDialog.value = false
    selectedStatus.value = 'باز'
    emit('bulk-updated')
  } catch (error) {
    showError(error.response?.data?.message || 'خطا در به‌روزرسانی وضعیت')
  } finally {
    loadingBulk.value = false
  }
}

const handleBulkPriorityChange = async () => {
  if (!selectedPriority.value) return
  
  loadingBulk.value = true
  try {
    await api.post('/requests/bulk/priority', {
      requestIds: props.selectedIds,
      priority: selectedPriority.value
    })
    success(`${props.selectedIds.length} درخواست با موفقیت به‌روزرسانی شد`)
    showPriorityDialog.value = false
    selectedPriority.value = 'متوسط'
    emit('bulk-updated')
  } catch (error) {
    showError(error.response?.data?.message || 'خطا در به‌روزرسانی اولویت')
  } finally {
    loadingBulk.value = false
  }
}

const handleBulkExport = () => {
  // Export selected requests
  const params = new URLSearchParams()
  props.selectedIds.forEach(id => {
    params.append('ids', id)
  })
  window.location.href = `/api/requests/export/excel?${params.toString()}`
}

const handleClearSelection = () => {
  emit('clear-selection')
}
</script>

