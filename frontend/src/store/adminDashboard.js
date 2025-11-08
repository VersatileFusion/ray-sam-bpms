import { defineStore } from 'pinia'
import { adminDashboardService } from '@/services/adminDashboardService'

export const useAdminDashboardStore = defineStore('adminDashboard', {
  state: () => ({
    overview: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchOverview(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await adminDashboardService.getOverview(params)
        if (response.success) {
          this.overview = response
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت داده‌های داشبورد مدیریت'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})


