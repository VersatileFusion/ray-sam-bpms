<template>
  <div class="space-y-6">
    <section
      class="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6"
    >
      <div class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-widest text-primary-500">جزئیات مشتری</p>
        <h1 class="text-2xl font-extrabold text-gray-900 md:text-3xl">
          {{ customer?.name || 'جزئیات مشتری' }}
        </h1>
        <p class="text-sm text-gray-600 md:text-base">
          {{ customer?.companyName || 'اطلاعات سازمان در دسترس نیست' }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 md:justify-end">
        <router-link to="/admin/customers" class="btn btn-light">بازگشت به فهرست</router-link>
        <span
          v-if="customer"
          class="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600"
        >
          کد مشتری: {{ customer.code || '—' }}
        </span>
      </div>
    </section>

    <transition name="fade" mode="out-in">
      <div v-if="loading" key="details-loading" class="space-y-6">
        <div class="animate-pulse rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-sm space-y-3">
          <div class="h-4 w-1/4 rounded bg-gray-200"></div>
          <div class="h-3 w-1/3 rounded bg-gray-200"></div>
          <div class="flex gap-3">
            <div class="h-3 w-20 rounded bg-gray-200"></div>
            <div class="h-3 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div v-for="n in 4" :key="`summary-skeleton-${n}`" class="animate-pulse rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div class="h-3 w-16 rounded bg-gray-200"></div>
            <div class="mt-3 h-6 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="animate-pulse space-y-3 rounded-2xl border border-gray-100 bg-white/80 p-5">
            <div class="h-4 w-1/3 rounded bg-gray-200"></div>
            <div class="h-3 w-full rounded bg-gray-200"></div>
            <div class="h-3 w-5/6 rounded bg-gray-200"></div>
            <div class="h-3 w-2/3 rounded bg-gray-200"></div>
          </div>
          <div class="animate-pulse space-y-3 rounded-2xl border border-gray-100 bg-white/80 p-5">
            <div class="h-4 w-1/3 rounded bg-gray-200"></div>
            <div v-for="n in 3" :key="`contact-skeleton-${n}`" class="h-3 w-full rounded bg-gray-200"></div>
          </div>
        </div>
        <div class="animate-pulse rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm space-y-3">
          <div class="h-4 w-1/4 rounded bg-gray-200"></div>
          <div class="h-3 w-full rounded bg-gray-200"></div>
          <div class="h-3 w-4/5 rounded bg-gray-200"></div>
          <div class="h-3 w-1/2 rounded bg-gray-200"></div>
        </div>
      </div>

      <div v-else key="details-content" class="space-y-6">
        <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article class="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">کل درخواست‌ها</p>
            <p class="mt-3 text-3xl font-extrabold text-gray-900 md:text-4xl">{{ insights?.summary?.total || 0 }}</p>
          </article>
          <article class="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-amber-600">باز</p>
            <p class="mt-3 text-3xl font-extrabold text-amber-700 md:text-4xl">{{ insights?.summary?.open || 0 }}</p>
          </article>
          <article class="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-sky-600">در حال اقدام</p>
            <p class="mt-3 text-3xl font-extrabold text-sky-700 md:text-4xl">{{ insights?.summary?.inProgress || 0 }}</p>
          </article>
          <article class="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600">انجام شده</p>
            <div class="mt-3 flex items-baseline gap-2">
              <p class="text-3xl font-extrabold text-emerald-700 md:text-4xl">{{ insights?.summary?.completed || 0 }}</p>
              <span class="text-xs font-medium text-emerald-600">{{ insights?.summary?.completionRate || 0 }}%</span>
            </div>
          </article>
        </section>

        <section class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <article class="rounded-3xl border border-gray-100 bg-gradient-to-br from-white via-white to-gray-50 p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900 md:text-xl">اطلاعات مشتری</h2>
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-lineJoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
                </svg>
              </span>
            </div>
            <dl class="mt-5 grid grid-cols-1 gap-6 text-sm text-gray-600 sm:grid-cols-2">
              <div class="space-y-2 rounded-2xl border border-gray-100 bg-white/70 p-4">
                <dt class="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">و</span>
                  وضعیت همکاری
                </dt>
                <dd>
                  <span
                    class="badge"
                    :class="customer?.status === 'active'
                      ? 'badge-success'
                      : customer?.status === 'prospect'
                      ? 'badge-warning'
                      : 'badge-secondary'"
                  >
                    {{ statusLabel(customer?.status) }}
                  </span>
                </dd>
              </div>
              <div class="space-y-2 rounded-2xl border border-gray-100 bg-white/70 p-4">
                <dt class="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">س</span>
                  سطح خدمات
                </dt>
                <dd>
                  <span class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    {{ tierLabel(customer?.tier) }}
                  </span>
                </dd>
              </div>
              <div class="sm:col-span-2 space-y-2 rounded-2xl border border-gray-100 bg-white/70 p-4">
                <dt class="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-50 text-purple-600">ب</span>
                  برچسب‌ها
                </dt>
                <dd class="mt-2 flex flex-wrap gap-2">
                  <span v-for="tag in customer?.tags || []" :key="tag" class="inline-flex items-center rounded-full border border-purple-100 bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                    {{ tag }}
                  </span>
                  <span v-if="!(customer?.tags?.length)" class="text-xs text-gray-400">برچسبی ثبت نشده است</span>
                </dd>
              </div>
              <div class="sm:col-span-2 space-y-2 rounded-2xl border border-gray-100 bg-white/70 p-4">
                <dt class="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-600">ی</span>
                  یادداشت‌ها
                </dt>
                <dd class="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-700" v-if="customer?.notes">
                  {{ customer.notes }}
                </dd>
                <dd v-else class="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-500">
                  یادداشتی ثبت نشده است.
                </dd>
              </div>
            </dl>
          </article>

          <article class="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
            <h2 class="text-lg font-semibold text-gray-900 md:text-xl">مخاطبین</h2>
            <ul class="mt-4 divide-y divide-gray-100">
              <li
                v-for="contact in customer?.contacts || []"
                :key="contact._id"
                class="flex items-start justify-between gap-3 py-4"
              >
                <div class="space-y-1">
                  <p class="text-sm font-semibold text-gray-900">{{ contact.name || 'نامشخص' }}</p>
                  <p class="text-xs text-gray-500" v-if="contact.position">{{ contact.position }}</p>
                  <p class="text-xs text-gray-500" v-if="contact.email">{{ contact.email }}</p>
                  <p class="text-xs text-gray-500" v-if="contact.phone">{{ contact.phone }}</p>
                </div>
                <span v-if="contact.isPrimary" class="badge badge-success">مخاطب اصلی</span>
              </li>
              <li v-if="!(customer?.contacts?.length)" class="py-10 text-center text-sm text-gray-500">
                مخاطبی ثبت نشده است.
              </li>
            </ul>
          </article>
        </section>

        <section class="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 md:text-xl">آخرین درخواست‌ها</h2>
            <span class="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
              {{ insights?.summary?.total || 0 }} مورد
            </span>
          </div>
          <div class="mt-4 overflow-x-auto rounded-2xl border border-gray-100">
            <table class="min-w-full divide-y divide-gray-100 text-sm">
              <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th class="px-4 py-3 text-right">موضوع</th>
                  <th class="px-4 py-3 text-right">سیستم</th>
                  <th class="px-4 py-3 text-right">وضعیت</th>
                  <th class="px-4 py-3 text-right">تاریخ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 bg-white">
                <tr
                  v-for="request in insights?.recentRequests || []"
                  :key="request._id"
                  class="transition hover:bg-gray-50"
                >
                  <td class="px-4 py-3 text-sm text-gray-900">{{ request.request }}</td>
                  <td class="px-4 py-3 text-sm text-gray-700">{{ request.system }}</td>
                  <td class="px-4 py-3">
                    <span class="badge">{{ request.status }}</span>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-500">{{ request.date }}</td>
                </tr>
                <tr v-if="!(insights?.recentRequests?.length)">
                  <td colspan="4" class="px-4 py-10 text-center text-sm text-gray-500">
                    درخواستی برای این مشتری ثبت نشده است.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCustomerStore } from '@/store/customers'
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_TIER_LABELS,
} from '@/utils/constants'

const route = useRoute()
const customerStore = useCustomerStore()

const loading = computed(() => customerStore.loading)
const customer = computed(() => customerStore.selectedCustomer)
const insights = computed(() => customerStore.insights)

const statusLabel = (status) => CUSTOMER_STATUS_LABELS[status] || 'نامشخص'
const tierLabel = (tier) => CUSTOMER_TIER_LABELS[tier] || 'استاندارد'

const fetchData = async () => {
  const id = route.params.id
  if (!id) return

  await customerStore.fetchCustomer(id)
  await customerStore.fetchCustomerInsights(id)
}

fetchData()
</script>


