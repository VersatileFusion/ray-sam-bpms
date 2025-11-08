import api from './api'

export const specialistService = {
  async getSpecialists(params = {}) {
    const response = await api.get('/users', { params: { role: 'specialist', ...params } })
    return response.data
  },

  async updateProfile(id, payload) {
    const response = await api.put(`/specialists/${id}/profile`, payload)
    return response.data
  }
}


