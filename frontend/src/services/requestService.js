import api from './api'

export const requestService = {
  async getRequests(params = {}) {
    const queryParams = { ...params }
    if (Array.isArray(queryParams.conditions)) {
      queryParams.conditions = JSON.stringify(queryParams.conditions)
    }
    if (queryParams.conditions === '[]') {
      delete queryParams.conditions
    }
    const response = await api.get('/requests', { params: queryParams })
    return response.data
  },
  
  async searchRequests(params) {
    const response = await api.get('/requests/search', { params })
    return response.data
  },
  
  async getRequest(id) {
    const response = await api.get(`/requests/${id}`)
    return response.data
  },
  
  async createRequest(data) {
    const response = await api.post('/requests', data)
    return response.data
  },
  
  async updateRequest(id, data) {
    const response = await api.put(`/requests/${id}`, data)
    return response.data
  },
  
  async getRequestHistory(id) {
    const response = await api.get(`/requests/${id}/history`)
    return response.data
  },
  
  async addComment(id, comment) {
    const response = await api.post(`/requests/${id}/comments`, { comment })
    return response.data
  },
  
  async uploadAttachment(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/requests/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },
  
  async assignRequest(id, userId) {
    const response = await api.post(`/requests/${id}/assign`, { userId })
    return response.data
  },
  
  async bulkUpdate(ids, updates) {
    const response = await api.post('/requests/bulk/update', { ids, updates })
    return response.data
  },
}

