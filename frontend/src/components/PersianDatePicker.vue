<template>
  <div class="relative">
    <input
      :value="displayValue"
      @click="showPicker = !showPicker"
      @focus="showPicker = true"
      @blur="handleBlur"
      readonly
      :placeholder="placeholder"
      class="input cursor-pointer pr-12"
      required
    />
    <button
      type="button"
      @click.stop="showPicker = !showPicker"
      class="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl hover:scale-110 transition-transform"
    >
      📅
    </button>
    
    <transition name="fade">
      <div
        v-if="showPicker"
        class="absolute z-50 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-4"
        style="width: 320px;"
        @click.stop
      >
      <!-- Date picker header -->
      <div class="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <button
          @click="previousMonth"
          class="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all hover:scale-110"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="text-lg font-bold gradient-text">{{ currentMonthYear }}</span>
        <button
          @click="nextMonth"
          class="p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all hover:scale-110"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <!-- Day names -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-sm font-bold py-2 rounded-lg"
          :class="day === 'ج' ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700' : 'text-gray-600'"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          @click="selectDate(day)"
          class="text-center py-2 rounded-lg transition-all cursor-pointer calendar-day"
          :class="{
            'text-gray-400': day === '',
            'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md': day === selectedDay && currentMonth === selectedMonth && currentYear === selectedYear,
            'bg-gray-50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50': day !== '' && !(day === selectedDay && currentMonth === selectedMonth && currentYear === selectedYear)
          }"
        >
          {{ day }}
        </div>
      </div>
      
      <!-- Quick actions -->
      <div class="mt-3 pt-3 border-t border-gray-200 flex justify-between gap-2">
        <button
          @click="today"
          class="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          ✅ امروز
        </button>
        <button
          @click="clear"
          class="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
        >
          🗑️ پاک کردن
        </button>
      </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import moment from 'moment-jalaali'

const props = defineProps({
  modelValue: String,
  placeholder: {
    type: String,
    default: '1403/08/15'
  }
})

const emit = defineEmits(['update:modelValue'])

const showPicker = ref(false)
const selectedDay = ref(null)
const selectedMonth = ref(null)
const selectedYear = ref(null)
const currentMonth = ref(null)
const currentYear = ref(null)

const weekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

const currentMonthYear = computed(() => {
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ]
  return `${monthNames[currentMonth.value - 1]} ${currentYear.value}`
})

const displayValue = computed(() => {
  if (props.modelValue) {
    return props.modelValue
  }
  return ''
})

const calendarDays = computed(() => {
  const days = []
  const firstDay = moment(`${currentYear.value}/${currentMonth.value}/1`, 'jYYYY/jMM/jDD').day()
  const daysInMonth = moment(`${currentYear.value}/${currentMonth.value}/1`, 'jYYYY/jMM/jDD').daysInMonth()
  
  // Adjust for Persian week (Saturday = 0)
  const persianFirstDay = (firstDay + 1) % 7
  
  // Empty cells for days before month starts
  for (let i = 0; i < persianFirstDay; i++) {
    days.push('')
  }
  
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }
  
  return days
})

const initialize = () => {
  const now = moment()
  currentYear.value = now.jYear()
  currentMonth.value = now.jMonth() + 1
  
  if (props.modelValue) {
    const dateParts = props.modelValue.split('/')
    if (dateParts.length === 3) {
      selectedYear.value = parseInt(dateParts[0])
      selectedMonth.value = parseInt(dateParts[1])
      selectedDay.value = parseInt(dateParts[2])
    }
  } else {
    selectedDay.value = now.jDate()
    selectedMonth.value = now.jMonth() + 1
    selectedYear.value = now.jYear()
  }
}

const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (day) => {
  if (day === '') return
  
  selectedDay.value = day
  selectedMonth.value = currentMonth.value
  selectedYear.value = currentYear.value
  
  const formattedDate = `${selectedYear.value}/${String(selectedMonth.value).padStart(2, '0')}/${String(selectedDay.value).padStart(2, '0')}`
  emit('update:modelValue', formattedDate)
  showPicker.value = false
}

const today = () => {
  const now = moment()
  selectDate(now.jDate())
  currentMonth.value = now.jMonth() + 1
  currentYear.value = now.jYear()
}

const clear = () => {
  selectedDay.value = null
  selectedMonth.value = null
  selectedYear.value = null
  emit('update:modelValue', '')
  showPicker.value = false
}

const handleBlur = () => {
  setTimeout(() => {
    showPicker.value = false
  }, 200)
}

onMounted(() => {
  initialize()
})

watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const dateParts = newValue.split('/')
    if (dateParts.length === 3) {
      selectedYear.value = parseInt(dateParts[0])
      selectedMonth.value = parseInt(dateParts[1])
      selectedDay.value = parseInt(dateParts[2])
    }
  }
})
</script>

<style scoped>
/* Persian calendar styles */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Calendar day hover effect */
.calendar-day:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: scale(1.1);
}
</style>

