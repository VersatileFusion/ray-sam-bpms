import api from './api'

export const reportService = {
  async exportToExcel(params = {}) {
    const response = await api.get('/reports/export/excel', {
      params,
      responseType: 'blob'
    })
    
    // Create blob and download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Extract filename from response headers or use default
    const contentDisposition = response.headers['content-disposition']
    let filename = `درخواست‌ها_${new Date().toISOString().split('T')[0]}.xlsx`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return { success: true }
  },
  
  async exportToCSV(params = {}) {
    const response = await api.get('/reports/export/csv', {
      params,
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], {
      type: 'text/csv; charset=utf-8'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const contentDisposition = response.headers['content-disposition']
    let filename = `درخواست‌ها_${new Date().toISOString().split('T')[0]}.csv`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return { success: true }
  },
  
  async exportAdvancedReport(params = {}) {
    const response = await api.get('/reports/export/advanced', {
      params,
      responseType: 'blob'
    })
    
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    const contentDisposition = response.headers['content-disposition']
    let filename = `گزارش_پیشرفته_${new Date().toISOString().split('T')[0]}.xlsx`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''))
      }
    }
    
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return { success: true }
  },
}

