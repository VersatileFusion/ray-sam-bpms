<template>
  <div>
    <div v-if="loading" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else-if="request">
      <div class="mb-6 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">جزئیات درخواست</h1>
        <router-link to="/requests" class="btn btn-secondary">
          بازگشت به لیست
        </router-link>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 space-y-6">
          <!-- Main Details -->
          <div class="card">
            <h2 class="text-xl font-bold text-gray-900 mb-4">اطلاعات درخواست</h2>
            <div class="space-y-4">
              <div>
                <label class="text-sm text-gray-600">تاریخ:</label>
                <p class="text-gray-900 font-medium">{{ formatDate(request.date) }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">نام مشتری:</label>
                <p class="text-gray-900 font-medium">{{ request.customerName }}</p>
              </div>
              <div v-if="request.customerPhone">
                <label class="text-sm text-gray-600">شماره تماس:</label>
                <p class="text-gray-900 font-medium">{{ request.customerPhone }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">نام کاربر:</label>
                <p class="text-gray-900 font-medium">{{ request.userName }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">سیستم:</label>
                <p class="text-gray-900 font-medium">{{ request.system }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">نوع درخواست:</label>
                <p class="text-gray-900 font-medium">{{ request.requestType }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">درخواست:</label>
                <p class="text-gray-900">{{ request.request }}</p>
              </div>
              <div>
                <label class="text-sm text-gray-600">شرح اقدام:</label>
                <p class="text-gray-900">{{ request.actionDescription }}</p>
              </div>
              <div v-if="request.closeDescription">
                <label class="text-sm text-gray-600">شرح بستن:</label>
                <p class="text-gray-900">{{ request.closeDescription }}</p>
              </div>
            </div>
          </div>
          
          <!-- Activity Timeline -->
          <div class="card">
            <ActivityTimeline :request-id="request._id" />
          </div>
          
          <!-- Comments -->
          <div class="card">
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">نظرات</h2>
            
            <!-- Add Comment Form -->
            <div class="mb-6">
              <form @submit.prevent="handleAddComment">
                <div class="flex gap-2">
                  <textarea
                    v-model="newComment"
                    class="input flex-1"
                    rows="3"
                    placeholder="نظر خود را بنویسید..."
                    required
                  ></textarea>
                  <button type="submit" class="btn btn-primary px-4" :disabled="loading">
                    ارسال
                  </button>
                </div>
              </form>
            </div>
            
            <!-- Comments List -->
            <div v-if="request.comments && request.comments.length > 0" class="space-y-4">
              <div
                v-for="comment in request.comments"
                :key="comment._id || comment._id?.toString() || Math.random()"
                class="border-b border-gray-200 pb-4"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="font-medium text-gray-900">{{ comment.createdBy.name }}</span>
                  <span class="text-sm text-gray-500">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <p class="text-gray-700 whitespace-pre-wrap">{{ comment.text }}</p>
              </div>
            </div>
            <div v-else class="text-gray-500 text-center py-8">
              نظری ثبت نشده است
            </div>
          </div>
          
          <!-- Attachments -->
          <div class="card">
            <h2 class="text-xl font-bold text-gray-900 mb-4">پیوست‌ها</h2>
            
            <!-- Upload Form -->
            <div v-if="user?.role !== 'customer'" class="mb-4">
              <form @submit.prevent="handleUploadAttachment">
                <div class="flex gap-2">
                  <input
                    ref="fileInput"
                    type="file"
                    class="input flex-1"
                    @change="onFileSelect"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                  <button type="submit" class="btn btn-primary px-4" :disabled="loading || !selectedFile">
                    آپلود
                  </button>
                </div>
              </form>
            </div>
            
            <!-- Attachments List -->
            <div v-if="request.attachments && request.attachments.length > 0" class="space-y-2">
              <div
                v-for="(attachment, index) in request.attachments"
                :key="index"
                class="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div class="flex items-center gap-3">
                  <svg v-if="!isImage(attachment.mimetype)" class="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <img
                    v-else
                    :src="`/uploads/${attachment.filename}`"
                    @click="openImagePreview(`/uploads/${attachment.filename}`)"
                    class="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    :alt="attachment.originalName"
                  />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-gray-100">{{ attachment.originalName }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(attachment.size) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="isImage(attachment.mimetype)"
                    @click="openImagePreview(`/uploads/${attachment.filename}`)"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    مشاهده
                  </button>
                  <a
                    :href="`/uploads/${attachment.filename}`"
                    target="_blank"
                    class="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    download
                  >
                    دانلود
                  </a>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 text-center py-8">
              پیوستی وجود ندارد
            </div>
          </div>
        </div>
        
        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status Card -->
          <div class="card">
            <h3 class="text-lg font-bold text-gray-900 mb-4">وضعیت</h3>
            <div class="space-y-4">
              <div>
                <span :class="getStatusBadgeClass(request.status)" class="block text-center">
                  {{ request.status }}
                </span>
              </div>
              
              <!-- Status Update for Specialists/Admins -->
              <div v-if="user?.role !== 'customer'">
                <label class="label">تغییر وضعیت</label>
                <select v-model="newStatus" class="input" :disabled="loading">
                  <option value="">انتخاب کنید</option>
                  <option value="باز">باز</option>
                  <option value="در درست اقدام">در درست اقدام</option>
                  <option value="انجام">انجام</option>
                </select>
                <button
                  v-if="newStatus && newStatus !== request.status"
                  @click="updateStatus"
                  class="btn btn-success w-full mt-2 text-sm"
                  :disabled="loading"
                >
                  تغییر وضعیت
                </button>
              </div>
              
              <div>
                <label class="text-sm text-gray-600">اولویت:</label>
                <p class="font-medium">{{ request.priority }}</p>
              </div>
              <div v-if="request.dueDate">
                <label class="text-sm text-gray-600">تاریخ سررسید:</label>
                <p class="font-medium">{{ formatDate(request.dueDate) }}</p>
              </div>
              
              <!-- Assign To -->
              <div v-if="user?.role !== 'customer'">
                <label class="label">اختصاص به:</label>
                <select v-model="assignedToId" class="input" :disabled="loading">
                  <option value="">انتخاب کنید</option>
                  <option v-for="u in assignableUsers" :key="u._id" :value="u._id">{{ u.name }}</option>
                </select>
                <button
                  v-if="assignedToId && assignedToId !== request.assignedTo?.userId"
                  @click="assignRequest"
                  class="btn btn-primary w-full mt-2 text-sm"
                  :disabled="loading"
                >
                  اختصاص درخواست
                </button>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions for Specialists/Admins -->
          <div v-if="user?.role !== 'customer'" class="card">
            <h3 class="text-lg font-bold text-gray-900 mb-4">عملیات سریع</h3>
            <div class="space-y-3">
              <button
                @click="toggleEditMode"
                class="btn btn-secondary w-full"
              >
                {{ isEditMode ? 'لغو ویرایش' : 'ویرایش درخواست' }}
              </button>
            </div>
          </div>
          
          <!-- Edit Form -->
          <div v-if="isEditMode && user?.role !== 'customer'" class="card">
            <h3 class="text-lg font-bold text-gray-900 mb-4">ثبت اقدام</h3>
            <form @submit.prevent="handleSaveEdit" class="space-y-4">
              <div>
                <label class="label">نام مشتری</label>
                <input v-model="editForm.customerName" type="text" class="input" disabled />
              </div>
              <div>
                <label class="label">شماره تماس</label>
                <input v-model="editForm.customerPhone" type="tel" class="input" />
              </div>
              <div>
                <label class="label">نام کاربر</label>
                <input v-model="editForm.userName" type="text" class="input" disabled />
              </div>
              <div>
                <label class="label">سیستم</label>
                <select v-model="editForm.system" class="input" disabled>
                  <option value="">انتخاب کنید</option>
                  <option v-for="system in SYSTEM_LIST" :key="system" :value="system">{{ system }}</option>
                </select>
              </div>
              <div>
                <label class="label">نوع درخواست</label>
                <select v-model="editForm.requestType" class="input" required>
                  <option value="">انتخاب کنید</option>
                  <option v-for="type in REQUEST_TYPES" :key="type" :value="type">{{ type }}</option>
                </select>
              </div>
              <div>
                <label class="label">اولویت</label>
                <select v-model="editForm.priority" class="input">
                  <option value="کم">کم</option>
                  <option value="متوسط">متوسط</option>
                  <option value="زیاد">زیاد</option>
                  <option value="فوری">فوری</option>
                </select>
              </div>
              <div>
                <label class="label">درخواست</label>
                <textarea v-model="editForm.request" class="input" rows="4" required></textarea>
              </div>
              <div>
                <label class="label">شرح اقدام</label>
                <textarea v-model="editForm.actionDescription" class="input" rows="4"></textarea>
              </div>
              <div>
                <label class="label">شرح بستن</label>
                <textarea v-model="editForm.closeDescription" class="input" rows="3"></textarea>
              </div>
              <div class="flex gap-2">
                <button type="submit" class="btn btn-primary flex-1" :disabled="loading">ذخیره</button>
                <button type="button" @click="toggleEditMode" class="btn btn-secondary flex-1">انصراف</button>
              </div>
            </form>
          </div>
          
          <!-- Info Card -->
          <div class="card">
            <h3 class="text-lg font-bold text-gray-900 mb-4">اطلاعات</h3>
            <div class="space-y-3 text-sm">
              <div>
                <label class="text-gray-600">ایجاد کننده:</label>
                <p class="font-medium">{{ request.createdBy?.name }}</p>
              </div>
              <div>
                <label class="text-gray-600">آخرین ویرایش:</label>
                <p class="font-medium">{{ request.lastModifiedBy?.name }}</p>
              </div>
              <div>
                <label class="text-gray-600">آخرین تغییر:</label>
                <p class="font-medium">{{ formatDate(request.updatedAt) }}</p>
              </div>
            </div>
          </div>
          
          <!-- History Card -->
          <div class="card">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold text-gray-900">تاریخچه تغییرات</h3>
              <button
                @click="toggleHistory"
                class="text-blue-600 hover:text-blue-900 text-sm"
              >
                {{ showHistory ? 'مخفی' : 'نمایش' }}
              </button>
            </div>
            <div v-if="showHistory">
              <div v-if="historyLoading" class="text-center py-4">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
              <div v-else-if="requestHistory.length === 0" class="text-gray-500 text-center py-4">
                تغییراتی ثبت نشده است
              </div>
              <div v-else class="space-y-3 max-h-64 overflow-y-auto">
                <div
                  v-for="(historyItem, index) in requestHistory"
                  :key="index"
                  class="border-b border-gray-200 pb-3 last:border-0"
                >
                  <div class="flex justify-between items-start mb-2">
                    <span class="font-medium text-gray-900">{{ historyItem.modifiedBy?.name }}</span>
                    <span class="text-xs text-gray-500">{{ formatDate(historyItem.timestamp) }}</span>
                  </div>
                  <div class="space-y-1 text-sm">
                    <div v-for="(change, idx) in historyItem.changedFields" :key="idx">
                      <span class="text-gray-600">{{ change.field }}:</span>
                      <span class="line-through text-red-500 ml-2">{{ change.oldValue || '-' }}</span>
                      <span class="text-green-600 mr-2">→</span>
                      <span class="text-green-600">{{ change.newValue || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-20">
      <p class="text-gray-500">درخواست یافت نشد</p>
    </div>
    
    <!-- Image Preview Modal -->
    <ImagePreview
      v-model:is-open="imagePreviewOpen"
      :image-url="previewImageUrl"
    />
  </div>
</template>

<script setup>
import ActivityTimeline from '@/components/ActivityTimeline.vue'
import ImagePreview from '@/components/ImagePreview.vue'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRequestStore } from '@/store/requests'
import { useAuthStore } from '@/store/auth'
import { useUserStore } from '@/store/users'
import dateUtils from '@/utils/dateUtils'
import { STATUS, SYSTEM_LIST, REQUEST_TYPES } from '@/utils/constants'
import Swal from 'sweetalert2'

const route = useRoute()
const router = useRouter()
const requestStore = useRequestStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const loading = ref(false)
const requestId = computed(() => route.params.id)
const newStatus = ref('')
const newComment = ref('')
const isEditMode = ref(false)
const showHistory = ref(false)
const historyLoading = ref(false)
const requestHistory = ref([])
const fileInput = ref(null)
const selectedFile = ref(null)
const assignedToId = ref('')
const imagePreviewOpen = ref(false)
const previewImageUrl = ref('')

const request = computed(() => requestStore.currentRequest)
const user = computed(() => authStore.user)
const users = computed(() => userStore.users)

// Filter users to only admins and specialists (not customers)
const assignableUsers = computed(() => {
  return users.value.filter(u => u.role === 'admin' || u.role === 'user')
})

const editForm = ref({
  customerName: '',
  customerPhone: '',
  userName: '',
  system: '',
  requestType: '',
  priority: '',
  request: '',
  actionDescription: '',
  closeDescription: ''
})

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
  // If it's a Gregorian date string (YYYY-MM-DD or YYYY/MM/DD), convert from Gregorian to Jalali
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      // If it's already in YYYY/MM/DD format, convert to YYYY-MM-DD first
      const normalizedDate = date.includes('-') ? date : date.replace(/\//g, '-')
      return dateUtils.gregorianToJalali(normalizedDate)
    }
  }
  // For Date objects or ISO strings, format with Jalali calendar
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD HH:mm')
}

const updateStatus = async () => {
  if (!newStatus.value || newStatus.value === request.value.status) return
  
  const result = await Swal.fire({
    title: 'آیا از تغییر وضعیت اطمینان دارید؟',
    text: 'این عملیات قابل برگشت نیست.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'بله، تغییر دهید',
    cancelButtonText: 'لغو',
    reverseButtons: true
  })
  
  if (!result.isConfirmed) return
  
  loading.value = true
  try {
    await requestStore.updateRequest(requestId.value, {
      status: newStatus.value
    })
    // Reload the request to show updated data
    await requestStore.fetchRequest(requestId.value)
    // Reset the select
    newStatus.value = ''
    
    await Swal.fire({
      icon: 'success',
      title: 'موفقیت‌آمیز!',
      text: 'وضعیت درخواست با موفقیت تغییر کرد.',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#3085d6'
    })
  } catch (error) {
    console.error('Error updating status:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در تغییر وضعیت',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  } finally {
    loading.value = false
  }
}

const handleAddComment = async () => {
  if (!newComment.value || !newComment.value.trim()) return
  
  loading.value = true
  try {
    const response = await requestStore.addComment(requestId.value, newComment.value)
    newComment.value = ''
    // Reload the request to show updated comments
    await requestStore.fetchRequest(requestId.value)
  } catch (error) {
    console.error('Error adding comment:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در ثبت نظر',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  if (!isEditMode.value) {
    // Populate form with current request data
    editForm.value = {
      customerName: request.value.customerName || '',
      customerPhone: request.value.customerPhone || '',
      userName: request.value.userName || '',
      system: request.value.system || '',
      requestType: request.value.requestType || '',
      priority: request.value.priority || '',
      request: request.value.request || '',
      actionDescription: request.value.actionDescription || '',
      closeDescription: request.value.closeDescription || ''
    }
  }
  isEditMode.value = !isEditMode.value
}

const handleSaveEdit = async () => {
  loading.value = true
  try {
    // Only send editable fields (exclude customerName, userName, system which are disabled)
    const updateData = {
      customerPhone: editForm.value.customerPhone,
      requestType: editForm.value.requestType,
      priority: editForm.value.priority,
      request: editForm.value.request,
      actionDescription: editForm.value.actionDescription,
      closeDescription: editForm.value.closeDescription
    }
    await requestStore.updateRequest(requestId.value, updateData)
    isEditMode.value = false
    // Reload the request
    await requestStore.fetchRequest(requestId.value)
  } catch (error) {
    console.error('Error updating request:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در ویرایش درخواست',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  } finally {
    loading.value = false
  }
}

const toggleHistory = async () => {
  showHistory.value = !showHistory.value
  if (showHistory.value && requestHistory.value.length === 0) {
    historyLoading.value = true
    try {
      const history = await requestStore.getRequestHistory(requestId.value)
      requestHistory.value = history
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      historyLoading.value = false
    }
  }
}

const onFileSelect = (event) => {
  selectedFile.value = event.target.files[0]
}

const handleUploadAttachment = async () => {
  if (!selectedFile.value) return
  
  loading.value = true
  try {
    await requestStore.uploadAttachment(requestId.value, selectedFile.value)
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    // Reload the request
    await requestStore.fetchRequest(requestId.value)
  } catch (error) {
    console.error('Error uploading attachment:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در آپلود فایل',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  } finally {
    loading.value = false
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const assignRequest = async () => {
  if (!assignedToId.value) return
  
  loading.value = true
  try {
    await requestStore.assignRequest(requestId.value, assignedToId.value)
    // Reload the request
    await requestStore.fetchRequest(requestId.value)
    assignedToId.value = ''
  } catch (error) {
    console.error('Error assigning request:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در اختصاص درخواست',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  try {
    // Fetch users for assignment dropdown
    if (user.value?.role !== 'customer') {
      await userStore.fetchUsers()
    }
    
    await requestStore.fetchRequest(requestId.value)
    
    // Set initial status and assigned to
    if (request.value) {
      newStatus.value = request.value.status
      assignedToId.value = request.value.assignedTo?.userId || ''
    }
    
    // Check if customer is trying to view someone else's request
    if (request.value && user.value?.role === 'customer' && 
        request.value.createdBy.userId !== user.value._id) {
      router.push('/requests')
    }
  } finally {
    loading.value = false
  }
})
</script>

