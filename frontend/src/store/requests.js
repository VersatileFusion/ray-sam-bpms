import { defineStore } from 'pinia'
import { requestService } from '@/services/requestService'

export const useRequestStore = defineStore('requests', {
  state: () => ({
    requests: [],
    currentRequest: null,
    loading: false,
    error: null,
    pagination: null,
    lastParams: {},
    pendingUpdates: {},
  }),
  
  getters: {
    hasResults: (state) => state.requests.length > 0,
  },
  
  actions: {
    async fetchRequests(params = {}) {
      this.loading = true
      this.error = null
      try {
        this.lastParams = { ...params }
        const response = await requestService.getRequests(params)
        if (Array.isArray(response)) {
          this.requests = response
          this.pagination = null
          return response
        }

        if (response?.success && Array.isArray(response.data)) {
          this.requests = response.data
          this.pagination = response.pagination || null
          return response.data
        }

        if (Array.isArray(response?.data)) {
          this.requests = response.data
          this.pagination = response.pagination || null
          return response.data
        }

        this.requests = []
        this.pagination = null
        return []
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت درخواست‌ها'
        this.requests = []
        this.pagination = null
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
        await this.fetchRequests(this.lastParams)
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
      const previous = { current: this.currentRequest ? { ...this.currentRequest } : null, list: [...this.requests] }
      const optimistic = { ...data, _id: id }
      const listIndex = this.requests.findIndex((r) => r._id === id)
      if (listIndex !== -1) {
        this.requests.splice(listIndex, 1, { ...this.requests[listIndex], ...optimistic })
      }
      if (this.currentRequest?._id === id) {
        this.currentRequest = { ...this.currentRequest, ...optimistic }
      }
      this.pendingUpdates[id] = true
      try {
        const response = await requestService.updateRequest(id, data)
        await this.fetchRequests(this.lastParams)
        if (this.currentRequest?._id === id) {
          this.currentRequest = response
        }
        return response
      } catch (error) {
        this.requests = previous.list
        if (previous.current) {
          this.currentRequest = previous.current
        }
        this.error = error.response?.data?.message || 'خطا در ویرایش درخواست'
        throw error
      } finally {
        this.loading = false
        delete this.pendingUpdates[id]
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
      const previous = { list: [...this.requests], current: this.currentRequest ? { ...this.currentRequest } : null }
      const assignedTo = previous.list.find((r) => r._id === id)?.assignedTo || null
      const optimisticAssigned = { assignedTo: { userId, name: '—' } }
      const listIndex = this.requests.findIndex((r) => r._id === id)
      if (listIndex !== -1) {
        this.requests.splice(listIndex, 1, { ...this.requests[listIndex], ...optimisticAssigned })
      }
      if (this.currentRequest?._id === id) {
        this.currentRequest = { ...this.currentRequest, ...optimisticAssigned }
      }
      this.pendingUpdates[id] = true
      try {
        const response = await requestService.assignRequest(id, userId)
        await this.fetchRequests(this.lastParams)
        if (this.currentRequest?._id === id) {
          this.currentRequest = { ...this.currentRequest, assignedTo: response?.request?.assignedTo || response?.assignedTo || assignedTo }
        }
        return response
      } catch (error) {
        this.requests = previous.list
        if (previous.current) {
          this.currentRequest = previous.current
        }
        this.error = error.response?.data?.message || 'خطا در اختصاص درخواست'
        throw error
      } finally {
        delete this.pendingUpdates[id]
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
  },
})

