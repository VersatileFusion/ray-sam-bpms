export const SYSTEMS = {
  FINANCE: 'مالی',
  WAREHOUSE: 'انبار',
  SALES: 'فروش',
  PAYMENTS: 'دریافت و پرداخت',
  SAMIAR: 'سامیار',
  PAYROLL: 'حقوق و دستمزد',
  ASSETS: 'اموال و دارایی های ثابت',
}

export const SYSTEM_LIST = Object.values(SYSTEMS)

export const STATUS = {
  OPEN: 'باز',
  IN_PROGRESS: 'در درست اقدام',
  COMPLETED: 'انجام',
}

export const STATUS_LIST = Object.values(STATUS)

export const PRIORITY = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'زیاد',
  URGENT: 'فوری',
}

export const PRIORITY_LIST = Object.values(PRIORITY)

export const REQUEST_TYPES = [
  'رفع باگ',
  'گزارش جدید',
  'تغییر فرآیند',
  'بهبود عملکرد',
  'اضافه کردن فیلد',
  'تغییر محاسبات',
  'آموزش کاربر',
  'پشتیبانی فنی',
  'تحلیل داده',
  'سایر',
]

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
}

export const ROLE_LABELS = {
  [ROLES.USER]: 'کاربر',
  [ROLES.ADMIN]: 'مدیر',
  [ROLES.CUSTOMER]: 'مشتری',
}

export const PRIORITY_COLORS = {
  [PRIORITY.LOW]: 'green',
  [PRIORITY.MEDIUM]: 'yellow',
  [PRIORITY.HIGH]: 'orange',
  [PRIORITY.URGENT]: 'red',
}

export const STATUS_COLORS = {
  [STATUS.OPEN]: 'blue',
  [STATUS.IN_PROGRESS]: 'yellow',
  [STATUS.COMPLETED]: 'green',
}

export default {
  SYSTEMS,
  SYSTEM_LIST,
  STATUS,
  STATUS_LIST,
  PRIORITY,
  PRIORITY_LIST,
  REQUEST_TYPES,
  ROLES,
  ROLE_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
}

