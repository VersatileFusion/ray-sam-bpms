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
  SPECIALIST: 'specialist',
}

export const ROLE_LABELS = {
  [ROLES.USER]: 'کاربر',
  [ROLES.ADMIN]: 'مدیر',
  [ROLES.CUSTOMER]: 'مشتری',
  [ROLES.SPECIALIST]: 'متخصص',
}

export const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PROSPECT: 'prospect',
}

export const CUSTOMER_STATUS_LABELS = {
  [CUSTOMER_STATUS.ACTIVE]: 'فعال',
  [CUSTOMER_STATUS.INACTIVE]: 'غیرفعال',
  [CUSTOMER_STATUS.PROSPECT]: 'فرصت',
}

export const CUSTOMER_TIERS = ['standard', 'gold', 'platinum']

export const CUSTOMER_TIER_LABELS = {
  standard: 'استاندارد',
  gold: 'طلایی',
  platinum: 'پلاتینیوم',
}

export const SPECIALIST_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  AWAY: 'away',
}

export const SPECIALIST_STATUS_LABELS = {
  [SPECIALIST_STATUS.AVAILABLE]: 'آماده به کار',
  [SPECIALIST_STATUS.BUSY]: 'مشغول',
  [SPECIALIST_STATUS.AWAY]: 'غایب',
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
  CUSTOMER_STATUS,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_TIERS,
  CUSTOMER_TIER_LABELS,
  SPECIALIST_STATUS,
  SPECIALIST_STATUS_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
}

