import { defineStore } from 'pinia'
import { notificationService } from '@/services/notificationService'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  }),
  
  actions: {
    async fetchNotifications() {
      this.loading = true
      this.error = null
      try {
        const response = await notificationService.getNotifications()
        if (response.success) {
          this.notifications = response.data.notifications
          this.unreadCount = response.data.unreadCount
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت اعلان‌ها'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async markAsRead(id) {
      try {
        const response = await notificationService.markAsRead(id)
        if (response.success) {
          const notification = this.notifications.find(n => n._id === id)
          if (notification) {
            notification.read = true
          }
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در علامت‌گذاری'
        throw error
      }
    },
    
    async markAllAsRead() {
      try {
        const response = await notificationService.markAllAsRead()
        if (response.success) {
          this.notifications.forEach(n => n.read = true)
          this.unreadCount = 0
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در علامت‌گذاری'
        throw error
      }
    },
    
    async deleteNotification(id) {
      try {
        const response = await notificationService.deleteNotification(id)
        if (response.success) {
          this.notifications = this.notifications.filter(n => n._id !== id)
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در حذف'
        throw error
      }
    },
  },
})

