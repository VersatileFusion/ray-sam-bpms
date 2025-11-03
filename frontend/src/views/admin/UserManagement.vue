<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">مدیریت کاربران</h1>
        <p class="text-gray-600 mt-2">مدیریت و ویرایش کاربران سیستم</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <svg class="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        کاربر جدید
      </button>
    </div>
    
    <div class="card">
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام کاربری</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نقش</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">آخرین ورود</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user._id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.username }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="badge" :class="user.role === 'admin' ? 'badge-warning' : 'badge-info'">
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="user.isActive ? 'badge badge-success' : 'badge badge-danger'">
                  {{ user.isActive ? 'فعال' : 'غیرفعال' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.lastLogin) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2 space-x-reverse">
                <button @click="editUser(user)" class="text-blue-600 hover:text-blue-900">
                  ویرایش
                </button>
                <button @click="deleteUser(user._id)" class="text-red-600 hover:text-red-900">
                  حذف
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Create User Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">کاربر جدید</h2>
        
        <form @submit.prevent="handleCreateUser">
          <div class="space-y-4">
            <div>
              <label class="label">نام <span class="text-red-500">*</span></label>
              <input v-model="userForm.name" type="text" class="input" required />
            </div>
            <div>
              <label class="label">نام کاربری <span class="text-red-500">*</span></label>
              <input v-model="userForm.username" type="text" class="input" required />
            </div>
            <div>
              <label class="label">رمز عبور <span class="text-red-500">*</span></label>
              <input v-model="userForm.password" type="password" class="input" required />
            </div>
            <div>
              <label class="label">نقش <span class="text-red-500">*</span></label>
              <select v-model="userForm.role" class="input" required>
                <option value="user">کاربر</option>
                <option value="admin">مدیر</option>
              </select>
            </div>
          </div>
          
          <div class="flex justify-end space-x-4 space-x-reverse mt-6">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              انصراف
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              ایجاد کاربر
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/users'
import { ROLE_LABELS } from '@/utils/constants'
import dateUtils from '@/utils/dateUtils'
import Swal from 'sweetalert2'

const userStore = useUserStore()

const loading = ref(false)
const showCreateModal = ref(false)
const currentUserId = ref(null)

const users = computed(() => userStore.users)
const userForm = ref({
  name: '',
  username: '',
  password: '',
  role: 'user',
})

const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role
}

const formatDate = (date) => {
  if (!date) return '-'
  // If it's a date string in format YYYY-MM-DD, convert from Gregorian to Jalali
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return dateUtils.gregorianToJalali(date)
  }
  // For Date objects or ISO strings, format with Jalali calendar
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD HH:mm')
}

const closeModal = () => {
  showCreateModal.value = false
  currentUserId.value = null
  userForm.value = {
    name: '',
    username: '',
    password: '',
    role: 'user',
  }
}

const handleCreateUser = async () => {
  loading.value = true
  try {
    await userStore.createUser(userForm.value)
    closeModal()
  } catch (error) {
    console.error('Error creating user:', error)
  } finally {
    loading.value = false
  }
}

const editUser = (user) => {
  currentUserId.value = user._id
  userForm.value = {
    name: user.name,
    username: user.username,
    password: '',
    role: user.role,
  }
  showCreateModal.value = true
}

const deleteUser = async (id) => {
  const result = await Swal.fire({
    title: 'آیا از حذف این کاربر اطمینان دارید؟',
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
    await userStore.deleteUser(id)
    await Swal.fire({
      icon: 'success',
      title: 'موفقیت‌آمیز!',
      text: 'کاربر با موفقیت حذف شد.',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#3085d6'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    await Swal.fire({
      icon: 'error',
      title: 'خطا!',
      text: 'خطا در حذف کاربر',
      confirmButtonText: 'باشه',
      confirmButtonColor: '#d33'
    })
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await userStore.fetchUsers()
  } finally {
    loading.value = false
  }
})
</script>

