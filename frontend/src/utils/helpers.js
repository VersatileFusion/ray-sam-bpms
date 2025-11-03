export const helpers = {
  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  },
  
  // Debounce function
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },
  
  // Clone object
  clone(obj) {
    return JSON.parse(JSON.stringify(obj))
  },
  
  // Check if object is empty
  isEmpty(obj) {
    return Object.keys(obj).length === 0
  },
  
  // Generate random ID
  generateId() {
    return Math.random().toString(36).substring(2, 9)
  },
  
  // Show toast notification
  showToast(message, type = 'info') {
    // This would be implemented with a toast library
    console.log(`[${type}] ${message}`)
  },
  
  // Validate Persian text
  isPersian(text) {
    const persianPattern = /^[\u0600-\u06FF\s]+$/
    return persianPattern.test(text)
  },
  
  // Truncate text
  truncate(text, length = 50) {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  },
}

export default helpers

