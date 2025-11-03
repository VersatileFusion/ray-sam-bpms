import api from './api'

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },
  
  async logout() {
    const response = await api.post('/auth/logout')
    return response.data
  },
  
  async getMe() {
    const response = await api.get('/auth/me')
    return response.data
  },
  
  async changePassword(data) {
    const response = await api.post('/auth/change-password', data)
    return response.data
  },
}

