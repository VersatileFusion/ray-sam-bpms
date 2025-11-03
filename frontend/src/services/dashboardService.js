import api from './api'

export const dashboardService = {
  async getDashboardStats(params = {}) {
    const response = await api.get('/dashboard/stats', { params })
    return response.data
  },
  
  async getTrends(period = 'daily', params = {}) {
    const response = await api.get('/dashboard/trends', {
      params: { period, ...params }
    })
    return response.data
  },
}

