import api from './api'

export const adminDashboardService = {
  async getOverview(params = {}) {
    const response = await api.get('/dashboard/admin-overview', { params })
    return response.data
  }
}


