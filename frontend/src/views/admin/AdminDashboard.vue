<template>
  <div class="space-y-6">
    <section
      class="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white/70 p-4 md:flex-row md:items-center md:justify-between md:p-6 shadow-sm"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-primary-500">
          مرکز فرمان مدیریت
        </p>
        <h1 class="mt-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
          داشبورد مدیریت
        </h1>
        <p class="mt-1 text-sm text-gray-600 md:text-base">
          نمای کلی از وضعیت مشتریان، متخصصین و عملکرد سیستم
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 md:justify-end">
        <router-link
          to="/admin/customers"
          class="inline-flex items-center gap-2 rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 text-xs font-medium text-primary-700 transition hover:bg-primary-100 sm:text-sm"
        >
          مشتریان
        </router-link>
        <router-link
          to="/admin/specialists"
          class="inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 sm:text-sm"
        >
          متخصصین
        </router-link>
        <button
          class="btn btn-secondary"
          @click="refresh"
          :disabled="loading"
        >
          بروزرسانی
        </button>
      </div>
    </section>

    <transition name="fade" mode="out-in">
      <div
        v-if="loading"
        key="dashboard-loading"
        class="space-y-6"
      >
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div v-for="n in 4" :key="`dashboard-card-${n}`" class="animate-pulse rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div class="h-3 w-16 rounded bg-gray-200"></div>
            <div class="mt-3 h-6 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div v-for="n in 2" :key="`dashboard-chart-${n}`" class="animate-pulse space-y-3 rounded-2xl border border-gray-100 bg-white/80 p-5">
            <div class="h-4 w-1/3 rounded bg-gray-200"></div>
            <div class="h-3 w-3/4 rounded bg-gray-200"></div>
            <div class="h-64 w-full rounded bg-gray-200"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div v-for="n in 2" :key="`dashboard-list-${n}`" class="animate-pulse space-y-3 rounded-2xl border border-gray-100 bg-white/80 p-5">
            <div class="h-4 w-1/3 rounded bg-gray-200"></div>
            <div v-for="m in 3" :key="`dashboard-row-${n}-${m}`" class="h-3 w-full rounded bg-gray-200"></div>
          </div>
        </div>
      </div>

      <div v-else key="dashboard-content" class="space-y-6">
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article
            class="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-primary-100"
          >
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                کل مشتریان
              </p>
              <span
                class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a4 4 0 00-4-4h-3"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 20H4v-2a4 4 0 014-4h3"
                  />
                  <circle cx="9" cy="7" r="4" stroke-width="2" />
                  <circle cx="17" cy="7" r="4" stroke-width="2" />
                </svg>
              </span>
            </div>
            <p class="mt-4 text-3xl font-extrabold text-gray-900 md:text-4xl">
              {{ overview?.customers?.total || 0 }}
            </p>
            <p class="mt-1 text-sm text-gray-500">
              فعال:
              <span class="font-semibold text-primary-600">
                {{ overview?.customers?.active || 0 }}
              </span>
            </p>
          </article>

          <article
            class="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-emerald-100"
          >
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                مشتریان فعال
              </p>
              <span
                class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            </div>
            <p class="mt-4 text-3xl font-extrabold text-emerald-700 md:text-4xl">
              {{ overview?.customers?.active || 0 }}
            </p>
            <p class="mt-1 text-sm text-emerald-600">
              فرصت‌ها:
              <span class="font-semibold">
                {{ overview?.customers?.prospect || 0 }}
              </span>
            </p>
          </article>

          <article
            class="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-white p-5 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-indigo-100"
          >
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                متخصصین
              </p>
              <span
                class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4.12 19.88A9 9 0 0112 15a9 9 0 017.88 4.88"
                  />
                </svg>
              </span>
            </div>
            <p class="mt-4 text-3xl font-extrabold text-indigo-700 md:text-4xl">
              {{ overview?.specialists?.total || 0 }}
            </p>
            <p class="mt-1 text-sm text-indigo-600">
              آماده به کار:
              <span class="font-semibold">
                {{ overview?.specialists?.byStatus?.available || 0 }}
              </span>
            </p>
          </article>

          <article
            class="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white p-5 shadow-sm ring-1 ring-transparent transition hover:shadow-md hover:ring-sky-100"
          >
            <div class="flex items-center justify-between">
              <p class="text-xs font-semibold uppercase tracking-wide text-sky-600">
                میانگین بهره‌وری
              </p>
              <span
                class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-600"
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 3v10l5-5m3 12H5"
                  />
                </svg>
              </span>
            </div>
            <p class="mt-4 text-3xl font-extrabold text-sky-700 md:text-4xl">
              {{ overview?.specialists?.averageUtilization || 0 }}%
            </p>
            <p class="mt-1 text-sm text-sky-600">
              کل اختصاص‌ها:
              <span class="font-semibold">
                {{ overview?.specialists?.totalAssignments || 0 }}
              </span>
            </p>
          </article>
        </section>

        <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article class="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
                  مشتریان برتر
                </h2>
                <p class="mt-1 text-xs text-gray-500 sm:text-sm">
                  بر اساس تعداد کل درخواست‌های ثبت شده
                </p>
              </div>
              <span class="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
                ۲۰ مشتری
              </span>
            </div>
            <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
              <SimpleChart
                v-if="topCustomersChart.data.labels.length"
                :type="'bar'"
                :data="topCustomersChart.data"
                :options="topCustomersChart.options"
                height="320px"
              />
              <div v-else class="py-10 text-center text-sm text-gray-500">
                داده‌ای برای نمایش وجود ندارد.
              </div>
            </div>
          </article>

          <article class="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
                  وضعیت متخصصین
                </h2>
                <p class="mt-1 text-xs text-gray-500 sm:text-sm">
                  توزیع وضعیت کاری تیم پشتیبانی
                </p>
              </div>
              <span class="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                لحظه‌ای
              </span>
            </div>
            <div class="mt-4 rounded-2xl border border-gray-100 bg-white p-4">
              <SimpleChart
                v-if="specialistStatusChart.data.labels.length"
                :type="'doughnut'"
                :data="specialistStatusChart.data"
                height="320px"
              />
              <div v-else class="py-10 text-center text-sm text-gray-500">
                داده‌ای برای نمایش وضعیت متخصصین وجود ندارد.
              </div>
            </div>
          </article>
        </section>

        <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article class="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
                  مشتریان تازه اضافه شده
                </h2>
                <p class="mt-1 text-xs text-gray-500 sm:text-sm">
                  آخرین مشتریان ثبت شده در سیستم
                </p>
              </div>
            </div>
            <ul class="mt-4 divide-y divide-gray-100">
              <li
                v-for="customer in overview?.customers?.recent || []"
                :key="customer._id"
                class="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p class="text-sm font-semibold text-gray-900">
                    {{ customer.name }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500 sm:text-sm">
                    {{ customer.companyName || '—' }} • {{ tierLabel(customer.tier) }}
                  </p>
                  <p class="mt-1 text-xs text-gray-400">
                    {{ customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('fa-IR') : '—' }}
                  </p>
                </div>
                <span
                  class="badge"
                  :class="customer.status === 'active'
                    ? 'badge-success'
                    : customer.status === 'prospect'
                    ? 'badge-warning'
                    : 'badge-secondary'"
                >
                  {{ customerStatusLabel(customer.status) }}
                </span>
              </li>
              <li v-if="!(overview?.customers?.recent?.length)" class="py-10 text-center text-sm text-gray-500">
                مشتری جدیدی ثبت نشده است.
              </li>
            </ul>
          </article>

          <article class="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 md:text-xl">
                  مشتریان پرترافیک
                </h2>
                <p class="mt-1 text-xs text-gray-500 sm:text-sm">
                  وضعیت درخواست‌های باز، در جریان و انجام شده
                </p>
              </div>
            </div>
            <div class="mt-4 overflow-x-auto rounded-2xl border border-gray-100">
              <table class="min-w-full divide-y divide-gray-100 text-sm">
                <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th class="px-4 py-3 text-right">مشتری</th>
                    <th class="px-4 py-3 text-right">کل</th>
                    <th class="px-4 py-3 text-right">باز</th>
                    <th class="px-4 py-3 text-right">انجام شده</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr
                    v-for="item in overview?.topCustomers || []"
                    :key="item.id"
                    class="transition hover:bg-gray-50"
                  >
                    <td class="px-4 py-3">
                      <p class="font-semibold text-gray-900">{{ item.name }}</p>
                      <p class="mt-1 text-xs text-gray-500" v-if="item.tier">
                        {{ tierLabel(item.tier) }}
                      </p>
                    </td>
                    <td class="px-4 py-3 text-gray-900 font-semibold">{{ item.total }}</td>
                    <td class="px-4 py-3 text-amber-600 font-semibold">{{ item.open }}</td>
                    <td class="px-4 py-3 text-emerald-600 font-semibold">{{ item.completed }}</td>
                  </tr>
                  <tr v-if="!(overview?.topCustomers?.length)">
                    <td colspan="4" class="px-4 py-10 text-center text-sm text-gray-500">
                      داده‌ای برای نمایش وجود ندارد.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import SimpleChart from '@/components/SimpleChart.vue'
import { useAdminDashboardStore } from '@/store/adminDashboard'
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_TIER_LABELS,
  SPECIALIST_STATUS_LABELS,
} from '@/utils/constants'

const dashboardStore = useAdminDashboardStore()

const loading = computed(() => dashboardStore.loading)
const overview = computed(() => dashboardStore.overview)

const refresh = async () => {
  await dashboardStore.fetchOverview()
}

onMounted(() => {
  refresh()
})

const tierLabel = (tier) => CUSTOMER_TIER_LABELS[tier] || '—'

const customerStatusLabel = (status) => CUSTOMER_STATUS_LABELS[status] || 'نامشخص'

const topCustomersChart = computed(() => {
  const items = overview.value?.topCustomers || []
  return {
    data: {
      labels: items.map((item) => item.name),
      datasets: [
        {
          label: 'کل درخواست‌ها',
          backgroundColor: '#3b82f6',
          borderRadius: 6,
          data: items.map((item) => item.total),
        },
        {
          label: 'باز',
          backgroundColor: '#facc15',
          borderRadius: 6,
          data: items.map((item) => item.open),
        },
        {
          label: 'انجام‌شده',
          backgroundColor: '#22c55e',
          borderRadius: 6,
          data: items.map((item) => item.completed),
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
          },
        },
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: false,
          },
        },
      },
    },
  }
})

const specialistStatusChart = computed(() => {
  const byStatus = overview.value?.specialists?.byStatus || {}
  const labels = Object.keys(SPECIALIST_STATUS_LABELS)
    .filter((key) => byStatus[key] > 0)
    .map((key) => SPECIALIST_STATUS_LABELS[key])

  const data = Object.keys(SPECIALIST_STATUS_LABELS)
    .filter((key) => byStatus[key] > 0)
    .map((key) => byStatus[key])

  return {
    data: {
      labels,
      datasets: [
        {
          label: 'وضعیت متخصصین',
          backgroundColor: ['#22c55e', '#f97316', '#94a3b8'],
          data,
        },
      ],
    },
  }
})
</script>


