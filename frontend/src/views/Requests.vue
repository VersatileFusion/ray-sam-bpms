<template>
  <div class="space-y-12">
    <section class="card card-glass relative overflow-hidden p-6 lg:p-8">
      <span
        class="pointer-events-none absolute inset-x-1/2 -top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-400/25 via-iris-400/20 to-teal-400/25 blur-3xl"
      ></span>
      <div class="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="space-y-3">
          <span class="pill">جستجوی درخواست‌ها</span>
          <h1 class="text-3xl font-black text-smoke-900 md:text-4xl">
            لیست درخواست‌ها
          </h1>
          <p class="max-w-2xl text-sm text-smoke-500 md:text-base">
            با ترکیب جستجوی متن کامل و فیلترهای ساختاری، دقیق‌ترین نتایج را برای مشتریان و متخصصان پیدا کنید.
          </p>
          <div class="flex flex-wrap gap-3 text-xs text-smoke-500">
            <span class="pill">تعداد نتایج: {{ formatNumber(resultCount) }}</span>
            <span v-if="activeFilters.length" class="pill">
              فیلترهای فعال: {{ activeFilters.length }}
            </span>
          </div>
        </div>
        <router-link
          to="/requests/create"
          class="btn btn-primary"
        >
          ثبت درخواست جدید
        </router-link>
      </div>
    </section>

    <section class="card card-muted">
      <header class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-lg font-extrabold text-smoke-900 md:text-xl">فیلترهای پیشرفته</h2>
          <p class="text-sm text-smoke-500">جستجوی دقیق بر اساس وضعیت، سیستم، اولویت و متن</p>
        </div>
        <div class="flex flex-wrap items-center gap-2 sm:gap-3">
          <button class="btn btn-secondary" @click="resetFilters">بازنشانی فیلترها</button>
          <button class="btn btn-primary" @click="applyFilters">اعمال فیلتر</button>
        </div>
      </header>

      <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label class="label">متن کامل</label>
          <input
            v-model="filters.fullText"
            type="text"
            class="input"
            placeholder="عبارتی برای جستجو در عنوان، شرح یا نظرات"
          />
        </div>
        <div>
          <label class="label">وضعیت</label>
          <select v-model="filters.status" class="input">
            <option value="">همه</option>
            <option v-for="status in STATUS_LIST" :key="status" :value="status">{{ status }}</option>
          </select>
        </div>
        <div>
          <label class="label">سیستم</label>
          <select v-model="filters.system" class="input">
            <option value="">همه</option>
            <option v-for="system in SYSTEM_LIST" :key="system" :value="system">{{ system }}</option>
          </select>
        </div>
        <div>
          <label class="label">اولویت</label>
          <select v-model="filters.priority" class="input">
            <option value="">همه</option>
            <option v-for="priority in PRIORITY_LIST" :key="priority" :value="priority">{{ priority }}</option>
          </select>
        </div>
      </div>
    </section>

    <div
      v-if="activeFilters.length"
      class="flex flex-wrap items-center gap-2 rounded-3xl border border-white/40 bg-white/70 p-3 shadow-soft backdrop-blur-xl"
    >
      <span class="text-xs font-semibold text-smoke-500">فیلترهای فعال:</span>
      <span
        v-for="filter in activeFilters"
        :key="filter.key"
        class="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-brand-50/70 px-3 py-1 text-xs font-semibold text-brand-600"
      >
        {{ filter.label }}
        <button
          class="flex h-5 w-5 items-center justify-center rounded-full border border-transparent text-brand-500 transition hover:border-brand-200/80 hover:bg-white/70 hover:text-brand-700"
          @click="removeActiveFilter(filter.key)"
          aria-label="حذف فیلتر"
          type="button"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>
    </div>
    
    <section class="space-y-4">
      <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-smoke-900 md:text-2xl">نتایج درخواست‌ها</h2>
          <p class="text-sm text-smoke-500">نمایش {{ formatNumber(resultCount) }} درخواست بر اساس فیلترهای فعال</p>
        </div>
      </header>

      <AuroraSkeleton
        v-if="loading"
        :lines="6"
        tone="brand"
      />

      <EmptyState
        v-else-if="!requests.length"
        title="درخواستی یافت نشد"
        description="فیلترها را بازنشانی کنید یا جستجوی دیگری انجام دهید."
      />

      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                درخواست
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                مشتری / سیستم
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                وضعیت
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                اولویت
              </th>
              <th class="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.35em] text-smoke-400">
                متخصص
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
              v-for="request in requests"
              :key="request._id"
              class="transition-colors duration-200 hover:bg-brand-50/40"
            >
              <td class="px-6 py-4 align-top">
                <p class="text-sm font-semibold text-smoke-800">{{ request.request }}</p>
                <p class="mt-1 text-xs text-smoke-500">{{ request.requestType || '—' }}</p>
              </td>
              <td class="px-6 py-4 align-top">
                <p class="text-sm font-semibold text-smoke-700">{{ request.customerName || '—' }}</p>
                <p class="mt-1 text-xs text-smoke-500">{{ request.system || '—' }}</p>
              </td>
              <td class="px-6 py-4 align-top">
                <span class="badge" :class="statusBadgeClass(request.status)">
                  {{ request.status || 'نامشخص' }}
                </span>
              </td>
              <td class="px-6 py-4 align-top">
                <span class="badge" :class="priorityBadgeClass(request.priority)">
                  {{ request.priority || '—' }}
                </span>
              </td>
              <td class="px-6 py-4 align-top text-sm text-smoke-600">
                {{ request.assignedTo?.name || 'اختصاص داده نشده' }}
              </td>
              <td class="px-6 py-4 align-top text-sm text-smoke-600">
                <div>{{ formatDate(request.createdAt || request.date) }}</div>
                <div class="text-xs text-smoke-400">{{ formatRelative(request.createdAt || request.date) }}</div>
              </td>
              <td class="px-6 py-4 align-top">
                <button
                  class="inline-flex items-center gap-2 rounded-xl border border-brand-200/70 px-3 py-1.5 text-xs font-semibold text-brand-600 transition-all duration-200 hover:bg-brand-50/60"
                  @click="goToRequest(request._id)"
                >
                  مشاهده
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { SYSTEM_LIST, PRIORITY_LIST, STATUS_LIST } from '@/utils/constants'
import { useRequestStore } from '@/store/requests'
import EmptyState from '@/components/EmptyState.vue'
import AuroraSkeleton from '@/components/AuroraSkeleton.vue'
import dateUtils from '@/utils/dateUtils'

const router = useRouter()
const requestStore = useRequestStore()

const loading = computed(() => requestStore.loading)
const requests = computed(() => requestStore.requests)

const numberFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 })

const filters = reactive({
  fullText: '',
  status: '',
  system: '',
  priority: '',
})

const activeFilters = computed(() => {
  const pills = []
  if (filters.fullText) pills.push({ key: 'fullText', label: `جستجو: ${filters.fullText}` })
  if (filters.status) pills.push({ key: 'status', label: `وضعیت: ${filters.status}` })
  if (filters.system) pills.push({ key: 'system', label: `سیستم: ${filters.system}` })
  if (filters.priority) pills.push({ key: 'priority', label: `اولویت: ${filters.priority}` })
  return pills
})

const resultCount = computed(() => requests.value.length)

const formatNumber = (value) => {
  const numeric = Number(value ?? 0)
  if (!Number.isFinite(numeric)) return '۰'
  return numberFormatter.format(numeric)
}

const toPlainFilters = () => ({
  fullText: filters.fullText || '',
  status: filters.status || '',
  system: filters.system || '',
  priority: filters.priority || '',
})

const buildRequestParams = () => {
  const params = {}
  if (filters.fullText) params.fullText = filters.fullText
  if (filters.status) params.status = filters.status
  if (filters.system) params.system = filters.system
  if (filters.priority) params.priority = filters.priority
  return params
}

const removeActiveFilter = async (key) => {
  if (key === 'fullText') filters.fullText = ''
  if (key === 'status') filters.status = ''
  if (key === 'system') filters.system = ''
  if (key === 'priority') filters.priority = ''
  await applyFilters()
}

const resetFilters = async () => {
  filters.fullText = ''
  filters.status = ''
  filters.system = ''
  filters.priority = ''
  await applyFilters()
}

const applyFilters = async () => {
  const params = buildRequestParams()
  await requestStore.fetchRequests(params)
  localStorage.setItem('requestsFilters', JSON.stringify(toPlainFilters()))
}

const goToRequest = (id) => {
  router.push({ name: 'RequestDetails', params: { id } })
}

const formatDate = (value) => {
  if (!value) return '—'
  return dateUtils.formatDate(value, 'jYYYY/jMM/jDD HH:mm')
}

const formatRelative = (value) => {
  if (!value) return ''
  return dateUtils.getRelativeTime(value)
}

const statusBadgeClass = (status) => {
  switch (status) {
    case 'باز':
      return 'badge-warning'
    case 'انجام':
      return 'badge-success'
    case 'در درست اقدام':
      return 'badge-info'
    default:
      return 'badge-secondary'
  }
}

const priorityBadgeClass = (priority) => {
  switch (priority) {
    case 'فوری':
      return 'badge-danger'
    case 'زیاد':
      return 'badge-warning'
    case 'متوسط':
      return 'badge-info'
    case 'کم':
      return 'badge-secondary'
    default:
      return 'badge-secondary'
  }
}

onMounted(async () => {
  const cached = localStorage.getItem('requestsFilters')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      filters.fullText = parsed.fullText || ''
      filters.status = parsed.status || ''
      filters.system = parsed.system || ''
      filters.priority = parsed.priority || ''
    } catch (e) {
      filters.fullText = ''
      filters.status = ''
      filters.system = ''
      filters.priority = ''
    }
  }
  await applyFilters()
})
</script>

