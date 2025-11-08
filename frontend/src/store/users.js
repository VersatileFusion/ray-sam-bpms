import { defineStore } from 'pinia'
import { userService } from '@/services/userService'

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
  }),
  
  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        const response = await userService.getUsers()
        if (response.success) {
          this.users = response.data?.users || []
        } else {
          this.error = response.message || 'خطا در دریافت کاربران'
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت کاربران'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createUser(data) {
      this.loading = true
      this.error = null
      try {
        const response = await userService.createUser(data)
        if (response.success) {
          await this.fetchUsers()
        } else {
          this.error = response.message || 'خطا در ایجاد کاربر'
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ایجاد کاربر'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateUser(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await userService.updateUser(id, data)
        if (response.success) {
          await this.fetchUsers()
        } else {
          this.error = response.message || 'خطا در ویرایش کاربر'
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ویرایش کاربر'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteUser(id) {
      this.loading = true
      this.error = null
      try {
        const response = await userService.deleteUser(id)
        if (response.success) {
          await this.fetchUsers()
        } else {
          this.error = response.message || 'خطا در حذف کاربر'
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در حذف کاربر'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async resetPassword(id, newPassword) {
      try {
        const response = await userService.resetPassword(id, newPassword)
        if (!response.success) {
          this.error = response.message || 'خطا در تغییر رمز عبور'
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در تغییر رمز عبور'
        throw error
      }
    },
  },
})

