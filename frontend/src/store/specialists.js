import { defineStore } from 'pinia'
import { specialistService } from '@/services/specialistService'

export const useSpecialistStore = defineStore('specialists', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchSpecialists(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await specialistService.getSpecialists(params)
        if (response.success) {
          this.items = response.users || response.data || []
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت لیست متخصصین'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProfile(id, payload) {
      this.loading = true
      try {
        const response = await specialistService.updateProfile(id, payload)
        await this.fetchSpecialists()
        return response
      } finally {
        this.loading = false
      }
    },
  },
})


