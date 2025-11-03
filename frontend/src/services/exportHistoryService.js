import api from './api'

export const exportHistoryService = {
  async getExportHistory(params = {}) {
    const response = await api.get('/export-history', { params })
    return response.data
  },
  
  async getExportStatistics() {
    const response = await api.get('/export-history/statistics')
    return response.data
  },
  
  async deleteExportHistory(id) {
    const response = await api.delete(`/export-history/${id}`)
    return response.data
  },
}

