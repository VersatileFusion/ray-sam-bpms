import { defineStore } from 'pinia'
import { requestService } from '@/services/requestService'

export const useRequestStore = defineStore('requests', {
  state: () => ({
    requests: [],
    currentRequest: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      system: '',
      priority: '',
      date: '',
    },
  }),
  
  getters: {
    filteredRequests: (state) => {
      let result = state.requests
      
      if (state.filters.status) {
        result = result.filter(r => r.status === state.filters.status)
      }
      if (state.filters.system) {
        result = result.filter(r => r.system === state.filters.system)
      }
      if (state.filters.priority) {
        result = result.filter(r => r.priority === state.filters.priority)
      }
      
      return result
    },
  },
  
  actions: {
    async fetchRequests() {
      this.loading = true
      this.error = null
      try {
        const data = await requestService.getRequests()
        this.requests = data
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت درخواست‌ها'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async fetchRequest(id) {
      this.loading = true
      this.error = null
      try {
        const data = await requestService.getRequest(id)
        this.currentRequest = data
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت درخواست'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async createRequest(data) {
      this.loading = true
      this.error = null
      try {
        const response = await requestService.createRequest(data)
        await this.fetchRequests()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ثبت درخواست'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateRequest(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await requestService.updateRequest(id, data)
        await this.fetchRequests()
        if (this.currentRequest?._id === id) {
          this.currentRequest = { ...this.currentRequest, ...data }
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ویرایش درخواست'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async searchRequests(params) {
      this.loading = true
      this.error = null
      try {
        const data = await requestService.searchRequests(params)
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در جستجو'
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async assignRequest(id, userId) {
      try {
        const response = await requestService.assignRequest(id, userId)
        await this.fetchRequests()
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در اختصاص درخواست'
        throw error
      }
    },
    
    async addComment(id, comment) {
      try {
        const response = await requestService.addComment(id, comment)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ثبت نظر'
        throw error
      }
    },
    
    async getRequestHistory(id) {
      try {
        const data = await requestService.getRequestHistory(id)
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت تاریخچه'
        throw error
      }
    },
    
    async uploadAttachment(id, file) {
      try {
        const response = await requestService.uploadAttachment(id, file)
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در آپلود فایل'
        throw error
      }
    },
    
    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },
    
    clearFilters() {
      this.filters = {
        status: '',
        system: '',
        priority: '',
        date: '',
      }
    },
  },
})

