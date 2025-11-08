<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">مدیریت کاربران</h1>
        <p class="text-gray-600 mt-2">مدیریت و ویرایش کاربران سیستم</p>
      </div>
      <button @click="openCreateModal" class="btn btn-primary">
        <svg class="w-5 h-5 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        کاربر جدید
      </button>
    </div>
    
    <div class="card">
      <div v-if="loading" class="space-y-3 p-6">
        <div v-for="n in 6" :key="`user-skeleton-${n}`" class="animate-pulse space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <div class="flex items-center justify-between">
            <div class="h-4 w-1/4 rounded bg-gray-200"></div>
            <div class="h-4 w-10 rounded-full bg-gray-200"></div>
          </div>
          <div class="h-3 w-1/5 rounded bg-gray-200"></div>
          <div class="flex flex-wrap gap-2">
            <div class="h-6 w-20 rounded-full bg-gray-200"></div>
            <div class="h-6 w-16 rounded-full bg-gray-200"></div>
          </div>
        </div>
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
      <div class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-gray-900">
            {{ currentUserId ? 'ویرایش کاربر' : 'کاربر جدید' }}
          </h2>
          <button class="text-gray-500 hover:text-gray-700" @click="closeModal">✕</button>
        </div>
        
        <form @submit.prevent="handleSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">نام <span class="text-red-500">*</span></label>
              <input v-model="userForm.name" type="text" class="input" required />
            </div>
            <div>
              <label class="label">نام کاربری <span class="text-red-500">*</span></label>
              <input v-model="userForm.username" type="text" class="input" :disabled="!!currentUserId" required />
            </div>
            <div>
              <label class="label">ایمیل</label>
              <input v-model="userForm.email" type="email" class="input" />
            </div>
            <div>
              <label class="label">شماره تماس</label>
              <input v-model="userForm.phone" type="text" class="input" />
            </div>
            <div>
              <label class="label">رمز عبور<span v-if="!currentUserId" class="text-red-500">*</span></label>
              <input v-model="userForm.password" :required="!currentUserId" type="password" class="input" :placeholder="currentUserId ? 'در صورت نیاز به تغییر رمز' : ''" />
            </div>
            <div>
              <label class="label">نقش <span class="text-red-500">*</span></label>
              <select v-model="userForm.role" class="input" required>
                <option v-for="(label, key) in ROLE_LABELS" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">سمت</label>
              <input v-model="userForm.jobTitle" type="text" class="input" />
            </div>
            <div>
              <label class="label">دپارتمان</label>
              <input v-model="userForm.department" type="text" class="input" />
            </div>
            <div class="md:col-span-2" v-if="userForm.role === ROLES.SPECIALIST">
              <label class="label">وضعیت متخصص</label>
              <select v-model="userForm.specialistProfile.status" class="input">
                <option v-for="(label, key) in SPECIALIST_STATUS_LABELS" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:col-span-2" v-if="userForm.role === ROLES.SPECIALIST">
              <div>
                <label class="label">ظرفیت</label>
                <input v-model.number="userForm.specialistProfile.capacity" type="number" min="0" class="input" />
              </div>
              <div>
                <label class="label">تجربه (سال)</label>
                <input v-model.number="userForm.specialistProfile.experienceYears" type="number" min="0" class="input" />
              </div>
              <div>
                <label class="label">وضعیت فعالیت</label>
                <select v-model="userForm.isActive" class="input">
                  <option :value="true">فعال</option>
                  <option :value="false">غیرفعال</option>
                </select>
              </div>
            </div>
            <div class="md:col-span-2" v-if="userForm.role === ROLES.SPECIALIST">
              <label class="label">سیستم‌های تخصصی</label>
              <div class="flex flex-wrap gap-2">
                <label v-for="system in SYSTEM_LIST" :key="system" class="flex items-center gap-2 px-3 py-2 border rounded-md">
                  <input type="checkbox" :value="system" v-model="userForm.specialistProfile.systems" />
                  <span class="text-sm text-gray-700">{{ system }}</span>
                </label>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="label">مهارت‌ها</label>
              <input v-model="skillsInput" type="text" class="input" placeholder="هر مهارت را با کاما جدا کنید" />
            </div>
            <div class="md:col-span-2">
              <label class="label">برچسب‌ها</label>
              <input v-model="tagsInput" type="text" class="input" placeholder="مثال: ارشد، تمام‌وقت" />
            </div>
          </div>
          
          <div class="flex justify-end space-x-4 space-x-reverse mt-6">
            <button type="button" @click="closeModal" class="btn btn-secondary">
              انصراف
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ currentUserId ? 'ذخیره تغییرات' : 'ایجاد کاربر' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useUserStore } from '@/store/users'
import { ROLE_LABELS, ROLES, SPECIALIST_STATUS_LABELS, SPECIALIST_STATUS, SYSTEM_LIST } from '@/utils/constants'
import dateUtils from '@/utils/dateUtils'
import Swal from 'sweetalert2'

const userStore = useUserStore()

const loading = ref(false)
const showCreateModal = ref(false)
const currentUserId = ref(null)

const users = computed(() => userStore.users)
const userForm = reactive({
  name: '',
  username: '',
  password: '',
  role: ROLES.USER,
  email: '',
  phone: '',
  jobTitle: '',
  department: '',
  isActive: true,
  specialistProfile: {
    status: SPECIALIST_STATUS.AVAILABLE,
    capacity: 5,
    experienceYears: 0,
    systems: [],
  },
  skills: [],
  tags: [],
})

const skillsInput = ref('')
const tagsInput = ref('')

const getRoleLabel = (role) => ROLE_LABELS[role] || role

const formatDate = (date) => {
  if (!date) return '-'
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return dateUtils.gregorianToJalali(date)
  }
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD HH:mm')
}

const resetForm = () => {
  currentUserId.value = null
  Object.assign(userForm, {
    name: '',
    username: '',
    password: '',
    role: ROLES.USER,
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    isActive: true,
    specialistProfile: {
      status: SPECIALIST_STATUS.AVAILABLE,
      capacity: 5,
      experienceYears: 0,
      systems: [],
    },
    skills: [],
    tags: [],
  })
  skillsInput.value = ''
  tagsInput.value = ''
}

const openCreateModal = () => {
  resetForm()
  showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  resetForm()
}

const buildPayload = () => ({
  name: userForm.name,
  username: userForm.username,
  password: userForm.password,
  role: userForm.role,
  email: userForm.email,
  phone: userForm.phone,
  jobTitle: userForm.jobTitle,
  department: userForm.department,
  isActive: userForm.isActive,
  specialistProfile: userForm.role === ROLES.SPECIALIST ? userForm.specialistProfile : undefined,
  skills: skillsInput.value ? skillsInput.value.split(',').map((skill) => skill.trim()).filter(Boolean) : [],
  tags: tagsInput.value ? tagsInput.value.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const payload = buildPayload()
    if (!currentUserId.value) {
      await userStore.createUser(payload)
    } else {
      if (!payload.password) {
        delete payload.password
      }
      await userStore.updateUser(currentUserId.value, payload)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving user:', error)
  } finally {
    loading.value = false
  }
}

const editUser = (user) => {
  currentUserId.value = user._id
  Object.assign(userForm, {
    name: user.name,
    username: user.username,
    password: '',
    role: user.role,
    email: user.email || '',
    phone: user.phone || '',
    jobTitle: user.jobTitle || '',
    department: user.department || '',
    isActive: user.isActive !== false,
    specialistProfile: {
      status: user.specialistProfile?.status || SPECIALIST_STATUS.AVAILABLE,
      capacity: user.specialistProfile?.capacity ?? 5,
      experienceYears: user.specialistProfile?.experienceYears ?? 0,
      systems: [...(user.specialistProfile?.systems || [])],
    },
    skills: user.skills || [],
    tags: user.tags || [],
  })
  skillsInput.value = (user.skills || []).join(', ')
  tagsInput.value = (user.tags || []).join(', ')
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

