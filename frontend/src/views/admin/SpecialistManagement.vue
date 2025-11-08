<template>
  <div class="space-y-6">
    <section
      class="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between md:p-6"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-primary-500">
          مدیریت متخصصین
        </p>
        <h1 class="mt-2 text-2xl font-extrabold text-gray-900 md:text-3xl">
          تیم پشتیبانی
        </h1>
        <p class="mt-1 text-sm text-gray-600 md:text-base">
          مدیریت وضعیت، ظرفیت و حوزه مهارت متخصصین پشتیبانی
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2 sm:gap-3 md:justify-end">
        <router-link class="btn btn-light" to="/admin/users">
          ایجاد متخصص جدید
        </router-link>
        <button class="btn btn-secondary" @click="refresh" :disabled="loading">
          بروزرسانی
        </button>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article class="rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">تعداد کل متخصصین</p>
        <p class="mt-3 text-3xl font-extrabold text-gray-900 md:text-4xl">{{ specialists.length }}</p>
      </article>
      <article class="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600">آماده به کار</p>
        <p class="mt-3 text-3xl font-extrabold text-emerald-700 md:text-4xl">{{ specialistsAvailable }}</p>
      </article>
      <article class="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-orange-600">مشغول</p>
        <p class="mt-3 text-3xl font-extrabold text-orange-700 md:text-4xl">{{ specialistsBusy }}</p>
      </article>
      <article class="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-white p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-wide text-sky-600">میانگین بهره‌وری</p>
        <p class="mt-3 text-3xl font-extrabold text-sky-700 md:text-4xl">{{ averageUtilization }}%</p>
      </article>
    </section>

    <section class="rounded-2xl border border-gray-100 bg-white/80 shadow-sm">
      <div v-if="loading" class="space-y-3 p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div v-for="n in 4" :key="`specialist-summary-${n}`" class="animate-pulse rounded-2xl border border-gray-100 bg-gray-50/60 p-5">
            <div class="h-3 w-16 rounded bg-gray-200"></div>
            <div class="mt-3 h-6 w-24 rounded bg-gray-200"></div>
          </div>
        </div>
        <div class="space-y-3">
          <div v-for="n in 5" :key="`specialist-row-${n}`" class="animate-pulse space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <div class="flex flex-wrap justify-between gap-2">
              <div class="h-4 w-32 rounded bg-gray-200"></div>
              <div class="h-4 w-20 rounded bg-gray-200"></div>
            </div>
            <div class="h-3 w-3/4 rounded bg-gray-200"></div>
            <div class="flex gap-2">
              <div class="h-6 w-16 rounded-full bg-gray-200"></div>
              <div class="h-6 w-20 rounded-full bg-gray-200"></div>
              <div class="h-6 w-24 rounded-full bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="overflow-x-auto rounded-2xl">
        <table class="min-w-full divide-y divide-gray-100 text-sm">
          <thead class="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th class="px-6 py-3 text-right">نام</th>
              <th class="px-6 py-3 text-right">سمت</th>
              <th class="px-6 py-3 text-right">وضعیت</th>
              <th class="px-6 py-3 text-right">ظرفیت</th>
              <th class="px-6 py-3 text-right">سیستم‌ها</th>
              <th class="px-6 py-3 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr
              v-for="specialist in specialists"
              :key="specialist._id"
              class="transition hover:bg-gray-50"
            >
              <td class="px-6 py-4">
                <p class="text-sm font-semibold text-gray-900">{{ specialist.name }}</p>
                <p class="text-xs text-gray-500">{{ specialist.email || specialist.username }}</p>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ specialist.jobTitle || '—' }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="badge"
                  :class="statusBadgeClass(specialist.specialistProfile?.status)"
                >
                  {{ specialistStatusLabel(specialist.specialistProfile?.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                {{ specialist.specialistProfile?.workload || 0 }} /
                {{ specialist.specialistProfile?.capacity || 0 }}
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="system in specialist.specialistProfile?.systems || []"
                    :key="system"
                    class="badge badge-outline"
                  >
                    {{ system }}
                  </span>
                  <span v-if="!(specialist.specialistProfile?.systems?.length)" class="text-xs text-gray-400">
                    مشخص نشده
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <button class="text-indigo-600 hover:text-indigo-700" @click="openEditModal(specialist)">
                  ویرایش
                </button>
              </td>
            </tr>
            <tr v-if="!specialists.length">
              <td colspan="6" class="px-6 py-12 text-center text-sm text-gray-500">
                متخصصی ثبت نشده است. از بخش مدیریت کاربران متخصص جدیدی ایجاد کنید.
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
      <div class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div class="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 class="text-2xl font-bold text-gray-900">ویرایش متخصص</h2>
          <button class="text-gray-400 transition hover:text-gray-600" @click="closeModal" aria-label="بستن">
            ✕
          </button>
        </div>
        <form @submit.prevent="saveSpecialist" class="mt-6 space-y-6 overflow-y-auto max-h-[70vh] pr-1">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label class="label">نام</label>
              <input v-model="specialistForm.name" type="text" class="input" />
            </div>
            <div>
              <label class="label">ایمیل</label>
              <input v-model="specialistForm.email" type="email" class="input" />
            </div>
            <div>
              <label class="label">شماره تماس</label>
              <input v-model="specialistForm.phone" type="text" class="input" />
            </div>
            <div>
              <label class="label">سمت</label>
              <input v-model="specialistForm.jobTitle" type="text" class="input" />
            </div>
            <div>
              <label class="label">دپارتمان</label>
              <input v-model="specialistForm.department" type="text" class="input" />
            </div>
            <div>
              <label class="label">وضعیت</label>
              <select v-model="specialistForm.specialistProfile.status" class="input">
                <option v-for="(label, key) in SPECIALIST_STATUS_LABELS" :key="key" :value="key">
                  {{ label }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">ظرفیت</label>
              <input
                v-model.number="specialistForm.specialistProfile.capacity"
                type="number"
                min="0"
                class="input"
              />
            </div>
            <div>
              <label class="label">تجربه (سال)</label>
              <input
                v-model.number="specialistForm.specialistProfile.experienceYears"
                type="number"
                min="0"
                class="input"
              />
            </div>
            <div class="md:col-span-2 space-y-3">
              <label class="label m-0">سیستم‌های تخصصی</label>
              <div class="flex flex-wrap gap-2">
                <label
                  v-for="system in SYSTEM_LIST"
                  :key="system"
                  class="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2"
                >
                  <input
                    type="checkbox"
                    :value="system"
                    v-model="specialistForm.specialistProfile.systems"
                  />
                  <span class="text-sm text-gray-700">{{ system }}</span>
                </label>
              </div>
            </div>
            <div class="md:col-span-2">
              <label class="label">مهارت‌ها</label>
              <input
                v-model="skillsInput"
                type="text"
                class="input"
                placeholder="هر مهارت را با کاما جدا کنید"
              />
            </div>
            <div class="md:col-span-2">
              <label class="label">یادداشت</label>
              <textarea v-model="specialistForm.specialistProfile.notes" class="input h-24"></textarea>
            </div>
          </div>

          <div class="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button type="button" class="btn btn-light" @click="closeModal">
              انصراف
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              ذخیره تغییرات
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useSpecialistStore } from '@/store/specialists'
import {
  SPECIALIST_STATUS_LABELS,
  SPECIALIST_STATUS,
  SYSTEM_LIST,
} from '@/utils/constants'

const specialistStore = useSpecialistStore()

const specialists = computed(() => specialistStore.items)
const loading = computed(() => specialistStore.loading)

const showModal = ref(false)
const editingSpecialist = ref(null)
const skillsInput = ref('')

const specialistForm = reactive({
  role: 'specialist',
  name: '',
  email: '',
  phone: '',
  jobTitle: '',
  department: '',
  skills: [],
  specialistProfile: {
    status: SPECIALIST_STATUS.AVAILABLE,
    capacity: 5,
    experienceYears: 0,
    systems: [],
    notes: '',
  },
})

const refresh = async () => {
  await specialistStore.fetchSpecialists()
}

const statusBadgeClass = (status) => {
  switch (status) {
    case SPECIALIST_STATUS.AVAILABLE:
      return 'badge-success'
    case SPECIALIST_STATUS.BUSY:
      return 'badge-warning'
    case SPECIALIST_STATUS.AWAY:
      return 'badge-secondary'
    default:
      return 'badge-secondary'
  }
}

const specialistStatusLabel = (status) => SPECIALIST_STATUS_LABELS[status] || 'نامشخص'

const specialistsAvailable = computed(
  () => specialists.value.filter((s) => s.specialistProfile?.status === SPECIALIST_STATUS.AVAILABLE).length
)

const specialistsBusy = computed(
  () => specialists.value.filter((s) => s.specialistProfile?.status === SPECIALIST_STATUS.BUSY).length
)

const averageUtilization = computed(() => {
  const ratios = specialists.value
    .map((s) => {
      const capacity = s.specialistProfile?.capacity || 0
      const workload = s.specialistProfile?.workload || 0
      return capacity > 0 ? workload / capacity : 0
    })
    .filter((ratio) => ratio > 0)

  if (!ratios.length) return 0
  return Math.round((ratios.reduce((sum, r) => sum + r, 0) / ratios.length) * 100)
})

const resetForm = () => {
  editingSpecialist.value = null
  Object.assign(specialistForm, {
    role: 'specialist',
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    skills: [],
    specialistProfile: {
      status: SPECIALIST_STATUS.AVAILABLE,
      capacity: 5,
      experienceYears: 0,
      systems: [],
      notes: '',
    },
  })
  skillsInput.value = ''
}

const openEditModal = (specialist) => {
  editingSpecialist.value = specialist
  Object.assign(specialistForm, {
    role: 'specialist',
    name: specialist.name,
    email: specialist.email,
    phone: specialist.phone,
    jobTitle: specialist.jobTitle,
    department: specialist.department,
    skills: specialist.skills || [],
    specialistProfile: {
      status: specialist.specialistProfile?.status || SPECIALIST_STATUS.AVAILABLE,
      capacity: specialist.specialistProfile?.capacity ?? 5,
      experienceYears: specialist.specialistProfile?.experienceYears ?? 0,
      systems: [...(specialist.specialistProfile?.systems || [])],
      notes: specialist.specialistProfile?.notes || '',
    },
  })
  skillsInput.value = (specialistForm.skills || []).join(', ')
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const saveSpecialist = async () => {
  const payload = {
    name: specialistForm.name,
    email: specialistForm.email,
    phone: specialistForm.phone,
    jobTitle: specialistForm.jobTitle,
    department: specialistForm.department,
    role: 'specialist',
    skills: skillsInput.value
      ? skillsInput.value.split(',').map((skill) => skill.trim()).filter(Boolean)
      : [],
    specialistProfile: specialistForm.specialistProfile,
  }

  await specialistStore.updateProfile(editingSpecialist.value._id, payload)
  closeModal()
}

refresh()
</script>


