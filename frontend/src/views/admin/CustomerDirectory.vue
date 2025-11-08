<template>
  <div class="space-y-6">
    <section
      class="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-primary-500">
          مدیریت مشتریان
        </p>
        <h1 class="mt-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
          فهرست مشتریان
        </h1>
        <p class="mt-1 text-sm text-gray-600 md:text-base">
          مدیریت اطلاعات مشتریان، مخاطبین و سطح خدمات در یک نگاه
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 md:justify-end">
        <button class="btn btn-secondary" @click="refresh" :disabled="loading">
          بروزرسانی
        </button>
        <button class="btn btn-primary" @click="openCreateModal">
          مشتری جدید
        </button>
      </div>
    </section>

    <section class="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-end">
        <div class="flex flex-col gap-2">
          <label class="label text-xs font-semibold text-gray-700">جستجو</label>
          <input
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="نام مشتری یا شرکت"
            @keyup.enter="refresh"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="label text-xs font-semibold text-gray-700">وضعیت</label>
          <select v-model="filters.status" class="input">
            <option value="">همه</option>
            <option v-for="(label, key) in CUSTOMER_STATUS_LABELS" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label class="label text-xs font-semibold text-gray-700">سطح</label>
          <select v-model="filters.tier" class="input">
            <option value="">همه</option>
            <option v-for="(label, key) in CUSTOMER_TIER_LABELS" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <label class="label text-xs font-semibold text-gray-700">برچسب</label>
          <input
            v-model="filters.tag"
            type="text"
            class="input"
            placeholder="مثال: VIP"
            @keyup.enter="refresh"
          />
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button class="btn btn-light" @click="refresh" :disabled="loading">
          اعمال فیلتر
        </button>
      </div>
    </section>

    <section class="rounded-2xl border border-gray-100 bg-white/80 shadow-sm">
      <div v-if="loading" class="space-y-3 p-6">
        <div v-for="n in 6" :key="`customer-skeleton-${n}`" class="animate-pulse space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <div class="flex items-center justify-between">
            <div class="h-4 w-1/4 rounded bg-gray-200"></div>
            <div class="h-3 w-16 rounded bg-gray-200"></div>
          </div>
          <div class="h-3 w-1/2 rounded bg-gray-200"></div>
          <div class="flex flex-wrap gap-2">
            <div class="h-6 w-20 rounded-full bg-gray-200"></div>
            <div class="h-6 w-20 rounded-full bg-gray-200"></div>
            <div class="h-6 w-24 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>

      <div v-else class="overflow-x-auto rounded-2xl">
        <table class="min-w-full divide-y divide-gray-100 text-sm">
          <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-6 py-3 text-right">مشتری</th>
              <th class="px-6 py-3 text-right">شرکت</th>
              <th class="px-6 py-3 text-right">سطح</th>
              <th class="px-6 py-3 text-right">وضعیت</th>
              <th class="px-6 py-3 text-right">متخصصین</th>
              <th class="px-6 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr
              v-for="customer in customers"
              :key="customer._id"
              class="transition hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-semibold text-gray-900">{{ customer.name }}</span>
                  <span class="text-xs text-gray-500" v-if="customer.code">کد: {{ customer.code }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ customer.companyName || '—' }}
              </td>
              <td class="px-6 py-4">
                <span class="badge badge-info">
                  {{ CUSTOMER_TIER_LABELS[customer.tier] || 'استاندارد' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  class="badge"
                  :class="customer.status === 'active'
                    ? 'badge-success'
                    : customer.status === 'prospect'
                    ? 'badge-warning'
                    : 'badge-secondary'"
                >
                  {{ CUSTOMER_STATUS_LABELS[customer.status] || 'نامشخص' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="specialist in customer.assignedSpecialists || []"
                    :key="specialist._id"
                    class="badge badge-outline"
                  >
                    {{ specialist.name }}
                  </span>
                  <span v-if="!(customer.assignedSpecialists?.length)" class="text-xs text-gray-400">
                    اختصاص داده نشده
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap items-center gap-3">
                  <router-link
                    :to="{ name: 'CustomerDetails', params: { id: customer._id } }"
                    class="text-primary-600 hover:text-primary-700"
                  >
                    جزئیات
                  </router-link>
                  <button
                    class="text-indigo-600 hover:text-indigo-700"
                    @click="editCustomer(customer)"
                  >
                    ویرایش
                  </button>
                  <button
                    class="text-red-600 hover:text-red-700"
                    @click="archive(customer)"
                  >
                    غیرفعال
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!customers.length">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                مشتری یافت نشد. با استفاده از دکمه «مشتری جدید» اولین مشتری خود را اضافه کنید.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    >
      <div class="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">
              {{ editingCustomer ? 'ویرایش مشتری' : 'مشتری جدید' }}
            </h2>
            <p class="text-sm text-gray-500">اطلاعات مشتری و مخاطب اصلی را تکمیل کنید.</p>
          </div>
          <button class="text-gray-400 transition hover:text-gray-600" @click="closeModal" aria-label="بستن">
            ✕
          </button>
        </div>

        <form @submit.prevent="submitCustomer" class="mt-6 space-y-6 overflow-y-auto max-h-[70vh] pr-1">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="label">نام مشتری <span class="text-red-500">*</span></label>
              <input v-model="customerForm.name" type="text" class="input" required />
            </div>
            <div>
              <label class="label">نام سازمان</label>
              <input v-model="customerForm.companyName" type="text" class="input" />
            </div>
            <div>
              <label class="label">کد مشتری</label>
              <input v-model="customerForm.code" type="text" class="input" />
            </div>
            <div>
              <label class="label">وضعیت</label>
              <select v-model="customerForm.status" class="input">
                <option v-for="(label, key) in CUSTOMER_STATUS_LABELS" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">سطح</label>
              <select v-model="customerForm.tier" class="input">
                <option v-for="(label, key) in CUSTOMER_TIER_LABELS" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="label">برچسب‌ها</label>
              <input
                v-model="tagsInput"
                type="text"
                class="input"
                placeholder="هر برچسب را با کاما جدا کنید"
              />
            </div>
            <div class="md:col-span-2">
              <label class="label">یادداشت</label>
              <textarea v-model="customerForm.notes" class="input h-24"></textarea>
            </div>
            <div class="md:col-span-2 space-y-3">
              <div class="flex items-center justify-between">
                <label class="label m-0">متخصصین اختصاص داده شده</label>
                <button
                  type="button"
                  class="text-xs text-indigo-600 hover:text-indigo-700"
                  @click="specialistStore.fetchSpecialists()"
                >
                  بروزرسانی لیست
                </button>
              </div>
              <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label
                  v-for="specialist in specialistStore.items"
                  :key="specialist._id"
                  class="flex items-center gap-2 rounded-lg border border-gray-200 p-3"
                >
                  <input
                    type="checkbox"
                    :value="specialist._id"
                    v-model="customerForm.assignedSpecialists"
                  />
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ specialist.name }}</p>
                    <p class="text-xs text-gray-500">{{ specialist.jobTitle || 'متخصص' }}</p>
                  </div>
                </label>
                <p v-if="!specialistStore.items.length" class="text-xs text-gray-400">
                  متخصصی ثبت نشده است. ابتدا متخصص جدید ایجاد کنید.
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <h3 class="text-sm font-semibold text-gray-900">مخاطب اصلی</h3>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label class="label">نام</label>
                <input v-model="primaryContact.name" type="text" class="input" />
              </div>
              <div>
                <label class="label">ایمیل</label>
                <input v-model="primaryContact.email" type="email" class="input" />
              </div>
              <div>
                <label class="label">تلفن</label>
                <input v-model="primaryContact.phone" type="text" class="input" />
              </div>
              <div class="md:col-span-3">
                <label class="label">سمت</label>
                <input v-model="primaryContact.position" type="text" class="input" />
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" class="btn btn-light" @click="closeModal">
              انصراف
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              ذخیره اطلاعات
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useCustomerStore } from '@/store/customers'
import { useSpecialistStore } from '@/store/specialists'
import {
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_TIER_LABELS,
} from '@/utils/constants'
import Swal from 'sweetalert2'

const customerStore = useCustomerStore()
const specialistStore = useSpecialistStore()

const loading = computed(() => customerStore.loading)
const customers = computed(() => customerStore.items)

const filters = reactive({ ...customerStore.filters })

const showModal = ref(false)
const editingCustomer = ref(null)
const customerForm = reactive({
  name: '',
  companyName: '',
  code: '',
  status: 'active',
  tier: 'standard',
  tags: [],
  notes: '',
  assignedSpecialists: [],
  contacts: [],
})

const primaryContact = reactive({
  name: '',
  email: '',
  phone: '',
  position: '',
  isPrimary: true,
})

const tagsInput = ref('')

const refresh = async () => {
  customerStore.setFilters(filters)
  await customerStore.fetchCustomers()
}

const resetForm = () => {
  editingCustomer.value = null
  Object.assign(customerForm, {
    name: '',
    companyName: '',
    code: '',
    status: 'active',
    tier: 'standard',
    tags: [],
    notes: '',
    assignedSpecialists: [],
    contacts: [],
  })
  Object.assign(primaryContact, {
    name: '',
    email: '',
    phone: '',
    position: '',
    isPrimary: true,
  })
  tagsInput.value = ''
}

const openCreateModal = async () => {
  resetForm()
  showModal.value = true
  if (!specialistStore.items.length) {
    await specialistStore.fetchSpecialists()
  }
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const submitCustomer = async () => {
  const payload = {
    ...customerForm,
    tags: tagsInput.value
      ? tagsInput.value.split(',').map((tag) => tag.trim()).filter(Boolean)
      : [],
    contacts: [],
  }

  if (primaryContact.name || primaryContact.email || primaryContact.phone) {
    payload.contacts.push({ ...primaryContact })
  }

  try {
    if (editingCustomer.value) {
      await customerStore.updateCustomer(editingCustomer.value._id, payload)
    } else {
      await customerStore.createCustomer(payload)
    }
    closeModal()
  } catch (error) {
    // handled in store
  }
}

const editCustomer = async (customer) => {
  editingCustomer.value = customer
  Object.assign(customerForm, {
    name: customer.name,
    companyName: customer.companyName,
    code: customer.code,
    status: customer.status,
    tier: customer.tier,
    tags: customer.tags || [],
    notes: customer.notes || '',
    assignedSpecialists: (customer.assignedSpecialists || []).map((s) => s._id),
    contacts: customer.contacts || [],
  })
  tagsInput.value = (customer.tags || []).join(', ')
  const primary = customer.contacts?.find((c) => c.isPrimary) || {}
  Object.assign(primaryContact, {
    name: primary.name || '',
    email: primary.email || '',
    phone: primary.phone || '',
    position: primary.position || '',
    isPrimary: true,
  })
  showModal.value = true
  if (!specialistStore.items.length) {
    await specialistStore.fetchSpecialists()
  }
}

const archive = async (customer) => {
  const result = await Swal.fire({
    title: `غیرفعال کردن ${customer.name}`,
    text: 'آیا از غیرفعال کردن این مشتری اطمینان دارید؟',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'بله، غیرفعال کن',
    cancelButtonText: 'انصراف',
    reverseButtons: true,
  })

  if (!result.isConfirmed) return

  await customerStore.archiveCustomer(customer._id)
}

refresh()
</script>


