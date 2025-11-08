const { body, query, param, validationResult } = require('express-validator');
const { SYSTEM_LIST, STATUS_LIST, PRIORITY_LIST, CUSTOMER_STATUS, CUSTOMER_TIERS, SPECIALIST_STATUS, ROLES } = require('../config/constants');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'خطای اعتبارسنجی',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Login validation
const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('نام کاربری الزامی است')
    .isLength({ min: 3 }).withMessage('نام کاربری باید حداقل 3 کاراکتر باشد'),
  body('password')
    .notEmpty().withMessage('رمز عبور الزامی است')
    .isLength({ min: 6 }).withMessage('رمز عبور باید حداقل 6 کاراکتر باشد'),
  validate
];

// Create request validation
const validateCreateRequest = [
  body('date').notEmpty().withMessage('تاریخ الزامی است'),
  body('customerId').optional().isMongoId().withMessage('شناسه مشتری نامعتبر است'),
  body('customerName')
    .if(body('customerId').not().exists())
    .trim()
    .notEmpty()
    .withMessage('نام مشتری الزامی است'),
  body('userName').trim().notEmpty().withMessage('نام کاربر الزامی است'),
  body('system')
    .notEmpty().withMessage('سیستم الزامی است')
    .isIn(SYSTEM_LIST).withMessage('سیستم نامعتبر است'),
  body('request').trim().notEmpty().withMessage('درخواست الزامی است'),
  body('requestType').trim().notEmpty().withMessage('نوع درخواست الزامی است'),
  body('actionDescription').trim().notEmpty().withMessage('شرح اقدام الزامی است'),
  body('status')
    .notEmpty().withMessage('وضعیت الزامی است')
    .isIn(STATUS_LIST).withMessage('وضعیت نامعتبر است'),
  body('priority').optional().isIn(PRIORITY_LIST).withMessage('اولویت نامعتبر است'),
  body('dueDate').optional().isISO8601().withMessage('تاریخ سررسید نامعتبر است'),
  body('assignedToId').optional().isMongoId().withMessage('شناسه کاربر نامعتبر است'),
  validate
];

// Update request validation
const validateUpdateRequest = [
  param('id').isMongoId().withMessage('شناسه نامعتبر است'),
  body('customerId').optional().isMongoId().withMessage('شناسه مشتری نامعتبر است'),
  body('system').optional().isIn(SYSTEM_LIST).withMessage('سیستم نامعتبر است'),
  body('status').optional().isIn(STATUS_LIST).withMessage('وضعیت نامعتبر است'),
  body('priority').optional().isIn(PRIORITY_LIST).withMessage('اولویت نامعتبر است'),
  body('dueDate').optional().isISO8601().withMessage('تاریخ سررسید نامعتبر است'),
  validate
];

// Create user validation
const validateCreateUser = [
  body('username')
    .trim()
    .notEmpty().withMessage('نام کاربری الزامی است')
    .isLength({ min: 3 }).withMessage('نام کاربری باید حداقل 3 کاراکتر باشد')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('نام کاربری فقط می‌تواند شامل حروف، اعداد و _ باشد'),
  body('password')
    .notEmpty().withMessage('رمز عبور الزامی است')
    .isLength({ min: 6 }).withMessage('رمز عبور باید حداقل 6 کاراکتر باشد'),
  body('name')
    .trim()
    .notEmpty().withMessage('نام الزامی است'),
  body('role')
    .optional()
    .isIn(Object.values(ROLES)).withMessage('نقش نامعتبر است'),
  validate
];

// Pagination validation
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('شماره صفحه باید عدد مثبت باشد'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('تعداد در صفحه باید بین 1 تا 100 باشد'),
  validate
];

// Comment validation
const validateComment = [
  body('comment').trim().notEmpty().withMessage('متن نظر الزامی است'),
  validate
];

// Create customer validation
const validateCreateCustomer = [
  body('name').trim().notEmpty().withMessage('نام مشتری الزامی است'),
  body('status').optional().isIn(Object.values(CUSTOMER_STATUS)).withMessage('وضعیت مشتری نامعتبر است'),
  body('tier').optional().isIn(CUSTOMER_TIERS).withMessage('سطح مشتری نامعتبر است'),
  body('contacts').optional().isArray().withMessage('لیست مخاطبین نامعتبر است'),
  body('contacts.*.email').optional().isEmail().withMessage('ایمیل نامعتبر است'),
  body('contacts.*.userId').optional().isMongoId().withMessage('شناسه کاربر نامعتبر است'),
  body('assignedSpecialists').optional().isArray().withMessage('لیست متخصصین نامعتبر است'),
  body('assignedSpecialists.*').optional().isMongoId().withMessage('شناسه متخصص نامعتبر است'),
  validate
];

const validateUpdateCustomer = [
  param('id').isMongoId().withMessage('شناسه مشتری نامعتبر است'),
  body('status').optional().isIn(Object.values(CUSTOMER_STATUS)).withMessage('وضعیت مشتری نامعتبر است'),
  body('tier').optional().isIn(CUSTOMER_TIERS).withMessage('سطح مشتری نامعتبر است'),
  body('contacts').optional().isArray().withMessage('لیست مخاطبین نامعتبر است'),
  body('contacts.*.email').optional().isEmail().withMessage('ایمیل نامعتبر است'),
  body('contacts.*.userId').optional().isMongoId().withMessage('شناسه کاربر نامعتبر است'),
  body('assignedSpecialists').optional().isArray().withMessage('لیست متخصصین نامعتبر است'),
  body('assignedSpecialists.*').optional().isMongoId().withMessage('شناسه متخصص نامعتبر است'),
  validate
];

const validateSpecialistProfile = [
  param('id').isMongoId().withMessage('شناسه کاربر نامعتبر است'),
  body('specialistProfile').isObject().withMessage('اطلاعات متخصص نامعتبر است'),
  body('specialistProfile.status').optional().isIn(Object.values(SPECIALIST_STATUS)).withMessage('وضعیت متخصص نامعتبر است'),
  body('specialistProfile.capacity').optional().isInt({ min: 0 }).withMessage('ظرفیت نامعتبر است'),
  validate
];

module.exports = {
  validate,
  validateLogin,
  validateCreateRequest,
  validateUpdateRequest,
  validateCreateUser,
  validatePagination,
  validateComment,
  validateCreateCustomer,
  validateUpdateCustomer,
  validateSpecialistProfile
};

