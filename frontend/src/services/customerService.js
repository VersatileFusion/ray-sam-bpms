import api from './api'

export const customerService = {
  async getCustomers(params = {}) {
    const response = await api.get('/customers', { params })
    return response.data
  },

  async getCustomer(id) {
    const response = await api.get(`/customers/${id}`)
    return response.data
  },

  async getCustomerInsights(id) {
    const response = await api.get(`/customers/${id}/insights`)
    return response.data
  },

  async createCustomer(payload) {
    const response = await api.post('/customers', payload)
    return response.data
  },

  async updateCustomer(id, payload) {
    const response = await api.put(`/customers/${id}`, payload)
    return response.data
  },

  async archiveCustomer(id) {
    const response = await api.delete(`/customers/${id}`)
    return response.data
  }
}


