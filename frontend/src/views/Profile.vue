<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">پروفایل کاربری</h1>
      <p class="text-gray-600 mt-2">مدیریت حساب کاربری</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- User Info -->
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">اطلاعات کاربری</h2>
        <div class="space-y-4">
          <div>
            <label class="text-sm text-gray-600">نام:</label>
            <p class="text-gray-900 font-medium">{{ user?.name }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">نام کاربری:</label>
            <p class="text-gray-900 font-medium">{{ user?.username }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">نقش:</label>
            <p class="text-gray-900 font-medium">{{ getRoleLabel(user?.role) }}</p>
          </div>
        </div>
      </div>
      
      <!-- Change Password -->
      <div class="card">
        <h2 class="text-xl font-bold text-gray-900 mb-4">تغییر رمز عبور</h2>
        <form @submit.prevent="handleChangePassword">
          <div v-if="passwordError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {{ passwordError }}
          </div>
          <div v-if="passwordSuccess" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            {{ passwordSuccess }}
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="label">رمز عبور فعلی</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                class="input"
                required
              />
            </div>
            <div>
              <label class="label">رمز عبور جدید</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                class="input"
                required
              />
            </div>
            <div>
              <label class="label">تکرار رمز عبور جدید</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                class="input"
                required
              />
            </div>
            <button
              type="submit"
              class="btn btn-primary w-full"
              :disabled="passwordLoading"
            >
              <span v-if="passwordLoading" class="mr-2">
                <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              </span>
              تغییر رمز عبور
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/auth'
import { ROLE_LABELS } from '@/utils/constants'

const authStore = useAuthStore()

const passwordLoading = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const user = computed(() => authStore.user)

const getRoleLabel = (role) => {
  return ROLE_LABELS[role] || role
}

const handleChangePassword = async () => {
  passwordError.value = ''
  passwordSuccess.value = ''
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = 'رمز عبور جدید و تکرار آن مطابقت ندارد'
    return
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    passwordError.value = 'رمز عبور باید حداقل 6 کاراکتر باشد'
    return
  }
  
  passwordLoading.value = true
  
  try {
    await authStore.changePassword({
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword,
    })
    
    passwordSuccess.value = 'رمز عبور با موفقیت تغییر کرد'
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  } catch (error) {
    passwordError.value = error.response?.data?.message || 'خطا در تغییر رمز عبور'
  } finally {
    passwordLoading.value = false
  }
}
</script>

