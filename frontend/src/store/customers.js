import { defineStore } from 'pinia'
import { customerService } from '@/services/customerService'

export const useCustomerStore = defineStore('customers', {
  state: () => ({
    items: [],
    pagination: {
      page: 1,
      limit: 25,
      total: 0,
      pages: 0,
    },
    loading: false,
    error: null,
    filters: {
      search: '',
      status: '',
      tier: '',
      tag: '',
    },
    selectedCustomer: null,
    insights: null,
  }),

  actions: {
    async fetchCustomers(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await customerService.getCustomers({
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...this.filters,
          ...params,
        })

        if (response.success) {
          this.items = response.data
          this.pagination = {
            page: response.pagination?.page || 1,
            limit: response.pagination?.limit || 25,
            total: response.pagination?.total || 0,
            pages: response.pagination?.pages || 0,
          }
        }

        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در دریافت لیست مشتریان'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCustomer(id) {
      this.loading = true
      try {
        const response = await customerService.getCustomer(id)
        if (response.success) {
          this.selectedCustomer = response.customer
        }
        return response
      } finally {
        this.loading = false
      }
    },

    async fetchCustomerInsights(id) {
      this.loading = true
      try {
        const response = await customerService.getCustomerInsights(id)
        if (response.success) {
          this.insights = response
        }
        return response
      } finally {
        this.loading = false
      }
    },

    async createCustomer(payload) {
      this.loading = true
      this.error = null
      try {
        const response = await customerService.createCustomer(payload)
        if (response.success) {
          await this.fetchCustomers({ page: 1 })
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ایجاد مشتری'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCustomer(id, payload) {
      this.loading = true
      this.error = null
      try {
        const response = await customerService.updateCustomer(id, payload)
        if (response.success) {
          await this.fetchCustomers()
        }
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'خطا در ویرایش مشتری'
        throw error
      } finally {
        this.loading = false
      }
    },

    async archiveCustomer(id) {
      this.loading = true
      try {
        const response = await customerService.archiveCustomer(id)
        if (response.success) {
          await this.fetchCustomers()
        }
        return response
      } finally {
        this.loading = false
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    resetFilters() {
      this.filters = {
        search: '',
        status: '',
        tier: '',
        tag: '',
      }
    },
  },
})


