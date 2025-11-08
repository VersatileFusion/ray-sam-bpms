<template>
  <div class="space-y-12">
    <section class="card card-glass relative overflow-hidden p-8 lg:p-10">
      <span
        class="pointer-events-none absolute inset-x-1/2 -top-28 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-400/25 via-iris-400/25 to-teal-400/25 blur-3xl"
      ></span>
      <div class="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="space-y-4">
          <span class="pill">داشبورد</span>
          <h1 class="text-3xl font-black text-smoke-900 md:text-4xl">
            سلام، <span class="gradient-text">{{ user?.name }}</span>
          </h1>
          <p class="max-w-2xl text-sm text-smoke-500 md:text-base">
            وضعیت درخواست‌ها و عملکرد تیم را در یک نگاه دنبال کنید. گزارش‌های زنده، روندهای اخیر و تحلیل‌های مدیریتی همیشه آماده هستند.
          </p>
          <div v-if="isAdmin" class="flex flex-wrap items-center gap-3 text-xs text-smoke-500">
            <span class="inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/60 px-3 py-1.5">
              <svg class="h-4 w-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              فیلترهای مدیریتی فعال است
            </span>
            <span v-if="startDate" class="pill">از {{ startDate }}</span>
            <span v-if="endDate" class="pill">تا {{ endDate }}</span>
          </div>
        </div>
        <div class="w-full max-w-sm rounded-3xl border border-white/40 bg-white/40 p-6 text-left shadow-inner backdrop-blur-xl">
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">امروز</p>
          <p class="mt-3 text-3xl font-bold text-smoke-900 md:text-4xl">{{ getCurrentDate() }}</p>
          <p class="mt-4 text-sm text-smoke-500">
            آخرین بروزرسانی:
            <span class="font-semibold text-brand-600">{{ lastUpdatedLabel }}</span>
          </p>
          <button
            type="button"
            @click="loadDashboardStats"
            class="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/50 bg-white/70 px-4 py-2 text-xs font-semibold text-brand-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white/90"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M4 4v5h.6M20 20v-5h-.6M5 9a7 7 0 0112.9-2M19 15a7 7 0 01-12.9 2" />
            </svg>
            بروزرسانی داده‌ها
          </button>
        </div>
      </div>
    </section>

    <section v-if="isAdmin" class="card card-muted">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label class="label">از تاریخ</label>
          <PersianDatePicker
            v-model="startDate"
            placeholder="1403/01/01"
            @update:modelValue="loadDashboardStats"
          />
        </div>
        <div>
          <label class="label">تا تاریخ</label>
          <PersianDatePicker
            v-model="endDate"
            placeholder="1403/12/29"
            @update:modelValue="loadDashboardStats"
          />
        </div>
        <div class="flex items-end">
          <button type="button" class="btn btn-secondary w-full" @click="clearDateFilter">
            حذف فیلتر تاریخ
          </button>
        </div>
      </div>
    </section>

    <section>
      <header class="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-smoke-900 md:text-2xl">نمای کلی عملکرد</h2>
          <p class="text-sm text-smoke-500">شاخص‌های کلیدی درخواست‌ها و نرخ تکمیل تیم</p>
        </div>
      </header>

      <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AuroraSkeleton
          v-for="n in 4"
          :key="`stat-skeleton-${n}`"
          :lines="4"
          tone="brand"
          compact
        />
      </div>

      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="stat in statCards"
          :key="stat.key"
          class="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/85 p-6 shadow-soft transition-all duration-500 ease-spring hover:-translate-y-1 hover:shadow-strong"
        >
          <span class="pointer-events-none absolute inset-0 opacity-80" :class="stat.gradient"></span>
          <div class="relative flex flex-col gap-6">
            <div class="flex items-start justify-between">
              <div class="space-y-2">
                <span class="text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                  {{ stat.title }}
                </span>
                <p class="text-4xl font-black text-smoke-900">
                  {{ formatNumber(dashboardStats.summary?.[stat.key]) }}
                </p>
              </div>
              <span
                class="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl shadow-inner transition-transform duration-500 group-hover:rotate-6"
                :class="stat.iconClass"
              >
                {{ stat.icon }}
              </span>
            </div>
            <p v-if="stat.extra" class="text-xs font-medium text-smoke-500">
              {{ stat.extra }}
            </p>
          </div>
        </article>
      </div>
    </section>

    <section v-if="isAdmin" class="space-y-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 class="text-xl font-extrabold text-smoke-900 md:text-2xl">تحلیل مدیریتی</h2>
        <p class="text-sm text-smoke-500">جزئیات وضعیت، سیستم‌ها، اولویت‌ها و روند ۳۰ روزه</p>
      </div>

      <div v-if="loading" class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AuroraSkeleton
          v-for="n in 4"
          :key="`chart-skeleton-${n}`"
          :lines="8"
          tone="iris"
        />
      </div>

      <div v-else class="space-y-6">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="card card-glass">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-bold text-smoke-900">توزیع وضعیت</h3>
            </div>
            <div v-if="dashboardStats.byStatus?.length">
              <SimpleChart
                type="doughnut"
                :data="{
                  labels: dashboardStats.byStatus.map(item => item.name),
                  datasets: [{
                    data: dashboardStats.byStatus.map(item => item.count),
                    backgroundColor: ['#3B82F6', '#F59E0B', '#10B981']
                  }]
                }"
                :options="{
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }"
                height="250px"
              />
            </div>
            <EmptyState
              v-else
              title="داده‌ای یافت نشد"
              description="هیچ داده‌ای برای نمایش توزیع وضعیت در این بازه وجود ندارد."
            />
          </div>

          <div class="card card-glass">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-bold text-smoke-900">توزیع بر اساس سیستم</h3>
            </div>
            <div v-if="dashboardStats.bySystem?.length">
              <SimpleChart
                type="pie"
                :data="{
                  labels: dashboardStats.bySystem.map(item => item.name),
                  datasets: [{
                    data: dashboardStats.bySystem.map(item => item.count),
                    backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
                  }]
                }"
                :options="{
                  plugins: {
                    legend: { position: 'bottom' }
                  }
                }"
                height="250px"
              />
            </div>
            <EmptyState
              v-else
              title="داده‌ای ثبت نشده"
              description="گزارشی از سیستم‌های مورد استفاده در بازه انتخابی یافت نشد."
            />
          </div>

          <div class="card card-glass">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-bold text-smoke-900">توزیع اولویت</h3>
            </div>
            <div v-if="dashboardStats.byPriority?.length">
              <SimpleChart
                type="bar"
                :data="{
                  labels: dashboardStats.byPriority.map(item => item.name),
                  datasets: [{
                    label: 'تعداد',
                    data: dashboardStats.byPriority.map(item => item.count),
                    backgroundColor: ['#10B981', '#F59E0B', '#F97316', '#EF4444']
                  }]
                }"
                :options="{
                  indexAxis: 'y',
                  plugins: { legend: { display: false } }
                }"
                height="200px"
              />
            </div>
            <EmptyState
              v-else
              title="هنوز اولویتی ثبت نشده"
              description="برای مشاهده این نمودار، باید درخواست‌هایی با اولویت‌های مختلف ثبت شده باشد."
            />
          </div>

          <div class="card card-glass">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-bold text-smoke-900">روند درخواست‌ها (۳۰ روز اخیر)</h3>
            </div>
            <div v-if="dashboardStats.byDateRange?.length">
              <SimpleChart
                type="line"
                :data="{
                  labels: dashboardStats.byDateRange.slice(-10).map(item => formatDateForChart(item.date)),
                  datasets: [{
                    label: 'تعداد درخواست‌ها',
                    data: dashboardStats.byDateRange.slice(-10).map(item => item.count),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }"
                :options="{
                  plugins: { legend: { display: false } }
                }"
                height="250px"
              />
            </div>
            <EmptyState
              v-else
              title="روندی برای نمایش نیست"
              description="برای نمایش روند، در این بازه زمانی درخواست ثبت نشده است."
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="card">
            <h3 class="mb-4 text-lg font-bold text-smoke-900">معیارهای عملکرد</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 p-4 shadow-inner">
                <span class="text-sm font-medium text-smoke-600">نرخ تکمیل</span>
                <span class="text-2xl font-bold text-brand-600">
                  {{ formatPercentValue(dashboardStats.summary?.completionRate) }}
                </span>
              </div>
              <div class="flex items-center justify-between rounded-2xl border border-white/40 bg-white/70 p-4 shadow-inner">
                <span class="text-sm font-medium text-smoke-600">میانگین زمان حل (روز)</span>
                <span class="text-2xl font-bold text-emerald-600">
                  {{ formatNumber(dashboardStats.summary?.avgResolutionDays) }}
                </span>
              </div>
            </div>
          </div>

          <div class="card table-container">
            <h3 class="mb-4 text-lg font-bold text-smoke-900">عملکرد اختصاص‌یافتگان</h3>
            <div v-if="dashboardStats.byAssignee?.length" class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                      نام
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                      کل
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                      انجام شده
                    </th>
                    <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                      نرخ تکمیل
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="assignee in dashboardStats.byAssignee"
                    :key="assignee.userId"
                    class="transition-colors duration-200 hover:bg-brand-50/40"
                  >
                    <td class="px-6 py-4 text-sm font-semibold text-smoke-700">
                      {{ assignee.name }}
                    </td>
                    <td class="px-6 py-4 text-sm text-smoke-600">
                      {{ formatNumber(assignee.total) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-smoke-600">
                      {{ formatNumber(assignee.completed) }}
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold text-brand-600">
                      {{ formatPercentage(assignee.completed, assignee.total) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <EmptyState
              v-else
              title="هیچ تخصیصی ثبت نشده"
              description="برای مشاهده عملکرد مسئولین، ابتدا درخواست‌هایی را به آن‌ها اختصاص دهید."
            />
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-smoke-900 md:text-2xl">عملیات سریع</h2>
          <p class="text-sm text-smoke-500">میانبرهایی برای اقدامات پرتکرار روزانه</p>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <router-link
          v-for="action in quickActions"
          :key="action.to"
          :to="action.to"
          class="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/75 p-6 shadow-soft transition-all duration-500 ease-spring hover:-translate-y-1 hover:shadow-strong"
        >
          <span class="pointer-events-none absolute inset-0 opacity-80" :class="action.gradient"></span>
          <div class="relative flex h-full flex-col gap-4">
            <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-2xl shadow-inner">
              {{ action.icon }}
            </span>
            <div class="space-y-2">
              <h3 class="text-lg font-bold text-smoke-900">{{ action.title }}</h3>
              <p class="text-sm text-smoke-500">{{ action.description }}</p>
            </div>
            <span class="mt-auto inline-flex items-center gap-2 text-xs font-semibold text-brand-600">
              شروع کنید
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </router-link>
      </div>
    </section>

    <section class="space-y-4">
      <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-smoke-900 md:text-2xl">درخواست‌های اخیر</h2>
          <p class="text-sm text-smoke-500">آخرین فعالیت‌ها و درخواست‌های ثبت‌شده</p>
        </div>
        <router-link
          to="/requests"
          class="btn btn-ghost"
        >
          مشاهده همه
        </router-link>
      </div>

      <AuroraSkeleton
        v-if="loading"
        :lines="6"
        tone="brand"
      />

      <EmptyState
        v-else-if="recentRequests.length === 0"
        title="درخواستی یافت نشد"
        description="هیچ درخواست تازه‌ای در این بازه ثبت نشده است."
      />

      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                مشتری
              </th>
              <th
                v-if="user?.role !== 'customer'"
                class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400"
              >
                تماس
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                سیستم
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                وضعیت
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                تاریخ
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in recentRequests"
              :key="request._id"
              class="transition-colors duration-200 hover:bg-brand-50/40"
            >
              <td class="px-6 py-4 text-sm font-semibold text-smoke-700">
                {{ request.customerName }}
              </td>
              <td
                v-if="user?.role !== 'customer'"
                class="px-6 py-4 text-sm text-brand-600"
              >
                <a
                  :href="`tel:${request.customerPhone}`"
                  class="font-semibold hover:text-brand-700"
                >
                  {{ request.customerPhone || '—' }}
                </a>
              </td>
              <td class="px-6 py-4 text-sm text-smoke-600">
                {{ request.system || '—' }}
              </td>
              <td class="px-6 py-4 text-sm">
                <span :class="getStatusBadgeClass(request.status)">
                  {{ request.status || 'نامشخص' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-smoke-600">
                {{ formatDate(request.date) }}
              </td>
              <td class="px-6 py-4 text-sm">
                <router-link
                  :to="`/requests/${request._id}`"
                  class="inline-flex items-center gap-1 rounded-xl border border-brand-200/70 px-3 py-1 text-xs font-semibold text-brand-600 transition-all duration-200 hover:bg-brand-50/60"
                >
                  مشاهده
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 5l7 7-7 7" />
                  </svg>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/store/auth'
import { dashboardService } from '@/services/dashboardService'
import { STATUS } from '@/utils/constants'
import dateUtils from '@/utils/dateUtils'
import PersianDatePicker from '@/components/PersianDatePicker.vue'
import SimpleChart from '@/components/SimpleChart.vue'
import AuroraSkeleton from '@/components/AuroraSkeleton.vue'
import EmptyState from '@/components/EmptyState.vue'

const STAT_TONES = {
  brand: {
    gradient: 'bg-gradient-to-br from-brand-200/40 via-white/45 to-brand-100/55',
    iconClass: 'bg-gradient-to-br from-brand-500 via-iris-500 to-teal-500 text-white shadow-glow',
  },
  iris: {
    gradient: 'bg-gradient-to-br from-iris-200/40 via-white/45 to-iris-100/55',
    iconClass: 'bg-gradient-to-br from-iris-500 via-brand-500 to-iris-600 text-white shadow-soft',
  },
  amber: {
    gradient: 'bg-gradient-to-br from-warning-200/35 via-white/45 to-warning-100/60',
    iconClass: 'bg-gradient-to-br from-warning-500 via-warning-400 to-warning-500 text-white shadow-soft',
  },
  emerald: {
    gradient: 'bg-gradient-to-br from-success-200/35 via-white/45 to-success-100/55',
    iconClass: 'bg-gradient-to-br from-success-500 via-teal-500 to-success-600 text-white shadow-soft',
  },
}

const RAW_STAT_CARDS = [
  { key: 'total', title: 'کل درخواست‌ها', icon: '📊', tone: 'brand' },
  { key: 'open', title: 'باز', icon: '🆕', tone: 'iris', extraKey: 'openShare' },
  { key: 'inProgress', title: 'در حال انجام', icon: '⏳', tone: 'amber', extraKey: 'inProgressShare' },
  { key: 'completed', title: 'انجام شده', icon: '✅', tone: 'emerald', extraKey: 'completionRate' },
]

const RAW_QUICK_ACTIONS = [
  {
    to: '/requests/create',
    icon: '➕',
    title: 'ثبت درخواست جدید',
    description: 'درخواست جدید برای مشتری یا همکار ثبت کنید.',
    gradient: 'bg-gradient-to-br from-brand-500/18 via-iris-500/15 to-teal-500/18',
  },
  {
    to: '/requests',
    icon: '📋',
    title: 'مدیریت درخواست‌ها',
    description: 'لیست کامل درخواست‌ها با فیلترهای پیشرفته.',
    gradient: 'bg-gradient-to-br from-iris-500/15 via-brand-500/12 to-smoke-100/50',
  },
  {
    to: '/reports',
    icon: '📈',
    title: 'مشاهده گزارش‌ها',
    description: 'دسترسی سریع به گزارش‌های مدیریتی و تحلیلی.',
    gradient: 'bg-gradient-to-br from-teal-500/18 via-brand-500/12 to-iris-500/20',
    adminOnly: true,
  },
  {
    to: '/admin',
    icon: '🛠️',
    title: 'کنترل پنل مدیریت',
    description: 'مدیریت کاربران، مشتریان و متخصصین در یکجا.',
    gradient: 'bg-gradient-to-br from-danger-500/12 via-iris-500/12 to-brand-500/18',
    adminOnly: true,
  },
]

const authStore = useAuthStore()

const loading = ref(false)
const lastUpdated = ref(null)
const dashboardStats = ref({
  summary: {
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    completionRate: 0,
    avgResolutionDays: 0,
  },
  bySystem: [],
  byPriority: [],
  byStatus: [],
  byDateRange: [],
  byAssignee: [],
  recentRequests: [],
})
const startDate = ref('')
const endDate = ref('')

const user = computed(() => authStore.user)
const isAdmin = computed(() => user.value?.role === 'admin')
const recentRequests = computed(() => dashboardStats.value.recentRequests || [])

const integerFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 })
const decimalFormatter = new Intl.NumberFormat('fa-IR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
const percentFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 })

const formatNumber = (value) => {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric)) return '۰'
  return Number.isInteger(numeric) ? integerFormatter.format(numeric) : decimalFormatter.format(numeric)
}

const formatPercentValue = (value) => {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric)) return '۰٪'
  return `${percentFormatter.format(numeric)}٪`
}

const formatPercentage = (value, total) => {
  const totalValue = Number(total ?? 0)
  const currentValue = Number(value ?? 0)
  if (!totalValue) return '۰٪'
  const percent = Math.round((currentValue / totalValue) * 100)
  return `${percentFormatter.format(percent)}٪`
}

const statCards = computed(() => {
  const summary = dashboardStats.value.summary || {}
  const total = Number(summary.total) || 0

  return RAW_STAT_CARDS.map((card) => {
    const tone = STAT_TONES[card.tone] ?? STAT_TONES.brand
    let extra = ''
    if (card.extraKey === 'openShare' && total > 0) {
      extra = `${formatPercentage(summary.open, total)} از کل`
    } else if (card.extraKey === 'inProgressShare' && total > 0) {
      extra = `${formatPercentage(summary.inProgress, total)} از کل`
    } else if (card.extraKey === 'completionRate') {
      extra = `${formatPercentValue(summary.completionRate)} نرخ تکمیل`
    }

    return {
      ...card,
      extra,
      gradient: tone.gradient,
      iconClass: tone.iconClass,
    }
  })
})

const quickActions = computed(() =>
  RAW_QUICK_ACTIONS.filter((action) => !action.adminOnly || isAdmin.value)
)

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) {
    return loading.value ? 'در حال بارگذاری...' : '—'
  }
  return dateUtils.getRelativeTime(lastUpdated.value)
})

const getCurrentDate = () => dateUtils.getCurrentJalaliDate()

const getStatusBadgeClass = (status) => {
  const classes = {
    [STATUS.OPEN]: 'badge badge-info',
    [STATUS.IN_PROGRESS]: 'badge badge-warning',
    [STATUS.COMPLETED]: 'badge badge-success',
  }
  return classes[status] || 'badge badge-secondary'
}

const formatDate = (date) => {
  if (!date) return ''
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) || /^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      const normalizedDate = date.includes('-') ? date : date.replace(/\//g, '-')
      return dateUtils.gregorianToJalali(normalizedDate)
    }
  }
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD')
}

const formatDateForChart = (date) => {
  if (!date) return ''
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const jalali = dateUtils.gregorianToJalali(date)
    return jalali.substring(5)
  }
  return date
}

const loadDashboardStats = async () => {
  loading.value = true
  try {
    const params = {}
    if (isAdmin.value) {
      if (startDate.value) {
        params.startDate = dateUtils.jalaliToGregorian(startDate.value)
      }
      if (endDate.value) {
        params.endDate = dateUtils.jalaliToGregorian(endDate.value)
      }
    }

    const response = await dashboardService.getDashboardStats(params)
    if (response.success) {
      dashboardStats.value = response.data
      lastUpdated.value = new Date()
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
  } finally {
    loading.value = false
  }
}

const clearDateFilter = () => {
  startDate.value = ''
  endDate.value = ''
  loadDashboardStats()
}

onMounted(async () => {
  await loadDashboardStats()
})
</script>

