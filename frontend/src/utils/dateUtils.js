import moment from 'moment-jalaali'

export const dateUtils = {
  // Convert Jalali date to Gregorian
  jalaliToGregorian(jalaliDate) {
    const m = moment(jalaliDate, 'jYYYY/jMM/jDD')
    const year = m.year()
    const month = String(m.month() + 1).padStart(2, '0')
    const day = String(m.date()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },
  
  // Convert Gregorian date to Jalali
  gregorianToJalali(gregorianDate) {
    const m = moment(gregorianDate, 'YYYY-MM-DD')
    const year = m.jYear()
    const month = String(m.jMonth() + 1).padStart(2, '0')
    const day = String(m.jDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  },
  
  // Get current Jalali date
  getCurrentJalaliDate() {
    const m = moment()
    const year = m.jYear()
    const month = String(m.jMonth() + 1).padStart(2, '0')
    const day = String(m.jDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  },
  
  // Get current Gregorian date
  getCurrentGregorianDate() {
    return moment().format('YYYY-MM-DD')
  },
  
  // Format date for display
  formatDate(date, format = 'jYYYY/jMM/jDD') {
    if (!date) return ''
    // If format has 'j' prefix, it means Jalali calendar output
    if (format.includes('j')) {
      // Convert date to Jalali calendar
      const m = moment(date)
      // Use jYear, jMonth, jDate etc. to get Jalali calendar values
      const year = m.jYear()
      const month = String(m.jMonth() + 1).padStart(2, '0')
      const day = String(m.jDate()).padStart(2, '0')
      
      // Support common formats
      if (format === 'jYYYY/jMM/jDD') {
        return `${year}/${month}/${day}`
      } else if (format === 'jYYYY/jMM/jDD HH:mm') {
        const hours = String(m.hour()).padStart(2, '0')
        const minutes = String(m.minute()).padStart(2, '0')
        return `${year}/${month}/${day} ${hours}:${minutes}`
      }
      // Default: try moment's format (might not work perfectly)
      return moment(date).format(format)
    }
    // Regular Gregorian format
    return moment(date).format(format)
  },
  
  // Get relative time in Persian
  getRelativeTime(date) {
    return moment(date).fromNow()
  },
  
  // Check if date is overdue
  isOverdue(dueDate) {
    if (!dueDate) return false
    return moment(dueDate).isBefore(moment(), 'day')
  },
  
  // Get week start in Jalali
  getWeekStart(date) {
    const m = moment(date).startOf('week')
    const year = m.jYear()
    const month = String(m.jMonth() + 1).padStart(2, '0')
    const day = String(m.jDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  },
  
  // Get month start in Jalali
  getMonthStart(date) {
    const m = moment(date).startOf('month')
    const year = m.jYear()
    const month = String(m.jMonth() + 1).padStart(2, '0')
    const day = String(m.jDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  },
  
  // Add days
  addDays(date, days) {
    const m = moment(date).add(days, 'days')
    const year = m.jYear()
    const month = String(m.jMonth() + 1).padStart(2, '0')
    const day = String(m.jDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  },
}

export default dateUtils

