# سیستم مدیریت درخواست‌های رایسا و سامیار

## 📋 معرفی پروژه

این پروژه یک سیستم مدیریت درخواست‌های تحت وب است که برای مدیریت و پیگیری درخواست‌های مشتریان در سیستم‌های مختلف طراحی شده است. این سیستم امکان ثبت، ویرایش، جستجو و گزارش‌گیری از درخواست‌ها را فراهم می‌کند.

## 🚀 ویژگی‌های اصلی

### 🔐 سیستم احراز هویت
- ورود و خروج امن با استفاده از Session
- مدیریت کاربران با نقش‌های مختلف (کاربر عادی و ادمین)
- رمزگذاری رمزهای عبور با bcrypt
- محافظت از مسیرهای حساس

### 📝 مدیریت درخواست‌ها
- ثبت درخواست‌های جدید با فرم جامع
- ویرایش درخواست‌های موجود
- پیگیری تاریخچه تغییرات
- جستجوی پیشرفته در درخواست‌ها
- فیلتر کردن بر اساس معیارهای مختلف

### 📊 گزارش‌گیری
- تولید گزارش‌های Excel
- فیلتر کردن داده‌ها قبل از گزارش‌گیری
- نمایش آمار و اطلاعات تفصیلی

### 📱 رابط کاربری
- طراحی ریسپانسیو و سازگار با موبایل
- استفاده از تقویم شمسی
- رابط کاربری فارسی و راست‌چین
- استفاده از فونت Vazirmatn برای نمایش بهتر متن فارسی

### 📨 اعلان‌ها
- ارسال پیامک خودکار هنگام ثبت درخواست جدید
- استفاده از سرویس SMS.ir

## 🛠 تکنولوژی‌های استفاده شده

### Backend
- **Node.js** - محیط اجرای JavaScript
- **Express.js** - فریمورک وب
- **MongoDB** - پایگاه داده NoSQL
- **Mongoose** - ODM برای MongoDB
- **bcryptjs** - رمزگذاری رمزهای عبور
- **express-session** - مدیریت Session
- **cors** - مدیریت CORS
- **dotenv** - مدیریت متغیرهای محیطی
- **jalali-moment** - کار با تاریخ شمسی
- **smsir-js** - ارسال پیامک
- **xlsx** - تولید فایل‌های Excel

### Frontend
- **HTML5** - ساختار صفحات
- **CSS3** - استایل‌دهی
- **JavaScript (ES6+)** - منطق سمت کلاینت
- **Bootstrap 5** - فریمورک CSS
- **SweetAlert2** - نمایش پیام‌ها و فرم‌ها
- **jQuery** - کتابخانه JavaScript
- **XLSX.js** - تولید فایل‌های Excel در مرورگر

### ابزارهای توسعه
- **Nodemon** - راه‌اندازی مجدد خودکار سرور در حالت توسعه

## 📁 ساختار پروژه

```
ray-sam/
├── index.js                 # فایل اصلی سرور
├── sms.js                   # ماژول ارسال پیامک
├── package.json             # وابستگی‌های پروژه
├── customers.json           # لیست مشتریان
├── models/                  # مدل‌های پایگاه داده
│   ├── User.js             # مدل کاربر
│   ├── Request.js          # مدل درخواست
│   └── RequestHistory.js   # مدل تاریخچه تغییرات
└── public/                  # فایل‌های استاتیک
    ├── index.html          # صفحه اصلی
    └── login.html          # صفحه ورود
```

## 🗄 ساختار پایگاه داده

### مدل User
```javascript
{
  username: String,      // نام کاربری (یکتا)
  password: String,      // رمز عبور (رمزگذاری شده)
  name: String,          // نام کامل
  role: String,          // نقش (user/admin)
  isActive: Boolean,     // وضعیت فعال/غیرفعال
  lastLogin: Date,       // آخرین ورود
  createdAt: Date        // تاریخ ایجاد
}
```

### مدل Request
```javascript
{
  date: String,                    // تاریخ درخواست
  customerName: String,            // نام مشتری
  userName: String,                // نام کاربر
  system: String,                  // سیستم مربوطه
  request: String,                 // متن درخواست
  requestType: String,             // نوع درخواست
  actionDescription: String,       // شرح اقدام
  closeDescription: String,        // شرح بستن درخواست
  status: String,                  // وضعیت (انجام/باز/در درست اقدام)
  createdBy: {                     // اطلاعات ایجادکننده
    userId: ObjectId,
    name: String,
    timestamp: Date
  },
  lastModifiedBy: {                // اطلاعات آخرین ویرایش‌کننده
    userId: ObjectId,
    name: String,
    timestamp: Date
  },
  createdAt: Date,                 // تاریخ ایجاد
  updatedAt: Date                  // تاریخ آخرین ویرایش
}
```

### مدل RequestHistory
```javascript
{
  requestId: ObjectId,             // شناسه درخواست
  changedFields: [{                // فیلدهای تغییر یافته
    field: String,                 // نام فیلد
    oldValue: Mixed,               // مقدار قبلی
    newValue: Mixed                // مقدار جدید
  }],
  modifiedBy: {                    // اطلاعات ویرایش‌کننده
    userId: ObjectId,
    name: String,
    timestamp: Date
  },
  timestamp: Date                  // زمان تغییر
}
```

## 🔧 نصب و راه‌اندازی

### پیش‌نیازها
- Node.js (نسخه 14 یا بالاتر)
- MongoDB (محلی یا Atlas)
- Git

### مراحل نصب

1. **کلون کردن پروژه:**
```bash
git clone <repository-url>
cd ray-sam
```

2. **نصب وابستگی‌ها:**
```bash
npm install
```

3. **تنظیم متغیرهای محیطی:**
فایل `.env` یا `atlas.env` ایجاد کنید:
```env
MONGODB_URI=mongodb://localhost:27017/ray-sam
# یا برای MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ray-sam

SESSION_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
```

4. **راه‌اندازی سرور:**
```bash
# حالت توسعه
npm run dev

# حالت تولید
npm start
```

5. **دسترسی به سیستم:**
- آدرس: `http://localhost:3000`
- کاربران پیش‌فرض در جدول زیر آمده است

## 👥 کاربران پیش‌فرض

| نام کاربری | رمز عبور | نام | نقش |
|------------|----------|-----|-----|
| miladi | Miladi@2024! | Miladi | user |
| yazdani | Yazdani@2024! | Yazdani | user |
| ghasemi | Ghasemi@2024! | Ghasemi | user |
| ahmadvand | Ahmadvand@2024! | Ahmadvand | user |
| mohades | Mohades@2024! | Mohades | user |
| admin | Admin@2024! | Administrator | admin |

## 🔌 API Endpoints

### احراز هویت
- `POST /api/auth/login` - ورود به سیستم
- `POST /api/auth/logout` - خروج از سیستم
- `GET /api/auth/me` - دریافت اطلاعات کاربر فعلی

### مدیریت درخواست‌ها
- `POST /api/requests` - ایجاد درخواست جدید
- `GET /api/requests` - دریافت تمام درخواست‌ها
- `GET /api/requests/search` - جستجوی درخواست‌ها
- `PUT /api/requests/:id` - ویرایش درخواست
- `GET /api/requests/:id/history` - دریافت تاریخچه تغییرات

### سایر
- `GET /api/health` - بررسی وضعیت سرور

## 📱 ویژگی‌های رابط کاربری

### صفحه ورود
- فرم ورود ساده و امن
- بررسی خودکار ورود قبلی
- نمایش پیام‌های خطا

### صفحه اصلی
- فرم ثبت درخواست جدید
- جدول نمایش درخواست‌ها
- دکمه‌های جستجو و گزارش‌گیری
- امکان ویرایش inline
- نمایش تاریخچه تغییرات

### ویژگی‌های خاص
- استفاده از تقویم شمسی
- تبدیل خودکار تاریخ شمسی به میلادی
- نمایش وضعیت درخواست‌ها با رنگ‌بندی
- تولید گزارش Excel
- ارسال پیامک خودکار

## 🔒 امنیت

### احراز هویت
- استفاده از Session برای مدیریت ورود
- رمزگذاری رمزهای عبور با bcrypt
- محافظت از مسیرهای حساس با middleware

### CORS
- تنظیم CORS برای دامنه‌های مجاز
- پشتیبانی از درخواست‌های cross-origin

### اعتبارسنجی
- اعتبارسنجی ورودی‌ها در سمت سرور
- بررسی وجود فیلدهای اجباری
- اعتبارسنجی فرمت تاریخ

## 📊 سیستم‌های پشتیبانی شده

- **مالی** - سیستم‌های مالی و حسابداری
- **انبار** - مدیریت انبار و موجودی
- **فروش** - سیستم‌های فروش و CRM
- **دریافت و پرداخت** - مدیریت مالی
- **سامیار** - سیستم‌های تخصصی

## 📈 وضعیت‌های درخواست

- **باز** - درخواست جدید و باز
- **در درست اقدام** - در حال انجام
- **انجام** - تکمیل شده

## 🚀 استقرار (Deployment)

### Render.com
پروژه برای استقرار روی Render.com آماده شده است:

1. اتصال به GitHub repository
2. تنظیم متغیرهای محیطی در Render
3. انتخاب Node.js به عنوان runtime
4. تنظیم Build Command: `npm install`
5. تنظیم Start Command: `npm start`

### متغیرهای محیطی مورد نیاز
```env
MONGODB_URI=mongodb+srv://...
SESSION_SECRET=your-secret-key
NODE_ENV=production
PORT=3000
```

## 🔧 تنظیمات پیامک

برای فعال‌سازی ارسال پیامک:

1. ثبت‌نام در سرویس SMS.ir
2. دریافت API Key
3. تنظیم شماره خط در فایل `sms.js`:
```javascript
const SMS_API_KEY = "your-api-key";
const LINE_NUMBER = 30004802149089;
const USERS_PHONE_NUMBERS = ["09109924707"];
```

## 🐛 عیب‌یابی

### مشکلات رایج

1. **خطای اتصال به پایگاه داده:**
   - بررسی صحت MONGODB_URI
   - اطمینان از دسترسی به MongoDB

2. **خطای CORS:**
   - بررسی تنظیمات CORS در کد
   - اضافه کردن دامنه جدید به allowedOrigins

3. **مشکل در ارسال پیامک:**
   - بررسی صحت API Key
   - بررسی شماره خط و شماره‌های مقصد

## 📝 مجوز

این پروژه تحت مجوز ISC منتشر شده است.

## 🤝 مشارکت

برای مشارکت در پروژه:

1. Fork کردن repository
2. ایجاد branch جدید
3. اعمال تغییرات
4. ارسال Pull Request

## 📞 پشتیبانی

برای گزارش باگ یا درخواست ویژگی جدید، لطفاً issue جدید ایجاد کنید.

---

**توسعه‌دهنده:** تیم توسعه رایسا و سامیار  
**نسخه:** 1.0.0  
**آخرین بروزرسانی:** 1404