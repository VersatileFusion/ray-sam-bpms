<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">اعلان‌ها</h1>
        <p class="text-gray-600 mt-2">پیام‌ها و هشدارهای شما</p>
      </div>
      <button
        v-if="notifications.length > 0 && unreadCount > 0"
        @click="markAllAsRead"
        class="btn btn-secondary"
      >
        همه را خوانده شده علامت بزن
      </button>
    </div>
    
    <div class="card">
      <div v-if="loading" class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else-if="notifications.length === 0" class="text-center py-20 text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p>اعلانی موجود نیست</p>
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="notification in notifications"
          :key="notification._id"
          class="flex items-start p-4 hover:bg-gray-50 transition-colors"
          :class="{ 'bg-blue-50': !notification.read }"
        >
          <div class="flex-1">
            <div class="flex items-start justify-between">
              <div>
                <h3 class="font-medium text-gray-900">{{ notification.title }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
              </div>
              <div class="flex items-center space-x-2 space-x-reverse">
                <span v-if="!notification.read" class="w-2 h-2 bg-blue-600 rounded-full"></span>
                <span class="text-xs text-gray-500">{{ formatDate(notification.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2 space-x-reverse mr-4">
            <button
              v-if="!notification.read"
              @click="markAsRead(notification._id)"
              class="text-blue-600 hover:text-blue-900 text-sm"
            >
              علامت خوانده شده
            </button>
            <button
              @click="deleteNotification(notification._id)"
              class="text-red-600 hover:text-red-900"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/store/notifications'
import dateUtils from '@/utils/dateUtils'

const notificationStore = useNotificationStore()

const loading = ref(false)
const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)

const markAsRead = async (id) => {
  try {
    await notificationStore.markAsRead(id)
  } catch (error) {
    console.error('Error marking as read:', error)
  }
}

const markAllAsRead = async () => {
  loading.value = true
  try {
    await notificationStore.markAllAsRead()
  } catch (error) {
    console.error('Error marking all as read:', error)
  } finally {
    loading.value = false
  }
}

const deleteNotification = async (id) => {
  try {
    await notificationStore.deleteNotification(id)
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD HH:mm')
}

onMounted(async () => {
  loading.value = true
  try {
    await notificationStore.fetchNotifications()
  } finally {
    loading.value = false
  }
})
</script>

<script>
import { computed } from 'vue'
export default { computed }
</script>

