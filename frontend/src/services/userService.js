import api from './api'

export const userService = {
  async getUsers() {
    const response = await api.get('/users')
    return response.data
  },
  
  async getUser(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },
  
  async createUser(data) {
    const response = await api.post('/admin/users', data)
    return response.data
  },
  
  async updateUser(id, data) {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  },
  
  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },
  
  async resetPassword(id, newPassword) {
    const response = await api.post(`/admin/users/${id}/reset-password`, { newPassword })
    return response.data
  },
}

