// System Constants
const SYSTEMS = {
  FINANCE: 'مالی',
  WAREHOUSE: 'انبار',
  SALES: 'فروش',
  PAYMENTS: 'دریافت و پرداخت',
  SAMIAR: 'سامیار',
  PAYROLL: 'حقوق و دستمزد',
  ASSETS: 'اموال و دارایی های ثابت'
};

const SYSTEM_LIST = Object.values(SYSTEMS);

// Status Constants
const STATUS = {
  OPEN: 'باز',
  IN_PROGRESS: 'در درست اقدام',
  COMPLETED: 'انجام'
};

const STATUS_LIST = Object.values(STATUS);

// Priority Constants
const PRIORITY = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'زیاد',
  URGENT: 'فوری'
};

const PRIORITY_LIST = Object.values(PRIORITY);

// User Roles
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  SPECIALIST: 'specialist'
};

// Customer Status
const CUSTOMER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PROSPECT: 'prospect'
};

const CUSTOMER_TIERS = ['standard', 'gold', 'platinum'];

// Specialist Availability
const SPECIALIST_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  AWAY: 'away'
};

// Request Types
const REQUEST_TYPES = [
  'رفع باگ',
  'گزارش جدید',
  'تغییر فرآیند',
  'بهبود عملکرد',
  'اضافه کردن فیلد',
  'تغییر محاسبات',
  'آموزش کاربر',
  'پشتیبانی فنی',
  'تحلیل داده',
  'سایر'
];

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'دسترسی غیرمجاز',
  FORBIDDEN: 'عدم دسترسی',
  NOT_FOUND: 'یافت نشد',
  BAD_REQUEST: 'درخواست نامعتبر',
  SERVER_ERROR: 'خطای سرور',
  VALIDATION_ERROR: 'خطای اعتبارسنجی',
  DATABASE_ERROR: 'خطای پایگاه داده',
  AUTHENTICATION_REQUIRED: 'نیاز به احراز هویت',
  INVALID_CREDENTIALS: 'نام کاربری یا رمز عبور اشتباه است',
  USER_NOT_FOUND: 'کاربر یافت نشد',
  USER_INACTIVE: 'حساب کاربری غیرفعال است',
  REQUEST_NOT_FOUND: 'درخواست یافت نشد',
  RATE_LIMIT_EXCEEDED: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفا بعدا تلاش کنید',
  CUSTOMER_NOT_FOUND: 'مشتری یافت نشد'
};

// Success Messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'ورود موفقیت‌آمیز',
  LOGOUT_SUCCESS: 'خروج موفقیت‌آمیز',
  REQUEST_CREATED: 'درخواست با موفقیت ثبت شد',
  REQUEST_UPDATED: 'درخواست با موفقیت ویرایش شد',
  REQUEST_DELETED: 'درخواست با موفقیت حذف شد',
  USER_CREATED: 'کاربر با موفقیت ایجاد شد',
  USER_UPDATED: 'کاربر با موفقیت ویرایش شد',
  PASSWORD_CHANGED: 'رمز عبور با موفقیت تغییر کرد',
  CUSTOMER_CREATED: 'مشتری با موفقیت ایجاد شد',
  CUSTOMER_UPDATED: 'مشتری با موفقیت ویرایش شد'
};

// Rate Limiting
const RATE_LIMITS = {
  LOGIN: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  }
};

module.exports = {
  SYSTEMS,
  SYSTEM_LIST,
  STATUS,
  STATUS_LIST,
  PRIORITY,
  PRIORITY_LIST,
  ROLES,
  CUSTOMER_STATUS,
  CUSTOMER_TIERS,
  SPECIALIST_STATUS,
  REQUEST_TYPES,
  PAGINATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  RATE_LIMITS
};

