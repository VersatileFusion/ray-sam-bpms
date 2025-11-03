import api from './api'

export const scheduledReportService = {
  async getScheduledReports() {
    const response = await api.get('/scheduled-reports')
    return response.data
  },
  
  async getScheduledReport(id) {
    const response = await api.get(`/scheduled-reports/${id}`)
    return response.data
  },
  
  async createScheduledReport(data) {
    const response = await api.post('/scheduled-reports', data)
    return response.data
  },
  
  async updateScheduledReport(id, data) {
    const response = await api.put(`/scheduled-reports/${id}`, data)
    return response.data
  },
  
  async deleteScheduledReport(id) {
    const response = await api.delete(`/scheduled-reports/${id}`)
    return response.data
  },
  
  async runScheduledReport(id) {
    const response = await api.post(`/scheduled-reports/${id}/run`)
    return response.data
  },
}

