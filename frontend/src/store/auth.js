import { defineStore } from 'pinia'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isCustomer: (state) => state.user?.role === 'customer',
  },
  
  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.login(credentials)
        this.user = response.user
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ورود'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      this.loading = true
      try {
        await authService.logout()
        this.user = null
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در خروج'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async checkAuth() {
      try {
        const response = await authService.getMe()
        if (response.success) {
          this.user = response.user
        }
      } catch (error) {
        this.user = null
      }
    },
    
    async changePassword(data) {
      try {
        const response = await authService.changePassword(data)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در تغییر رمز عبور'
        throw error
      }
    },
  },
})

