<template>
  <div class="space-y-4">
    <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">زمان‌خط فعالیت</h3>
    
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
    
    <div v-else-if="activities.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <p>فعالیتی ثبت نشده است</p>
    </div>
    
    <div v-else class="relative">
      <!-- Timeline line -->
      <div class="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
      
      <div class="space-y-6">
        <div
          v-for="activity in activities"
          :key="activity._id"
          class="relative flex items-start space-x-4 space-x-reverse"
        >
          <!-- Timeline dot -->
          <div class="relative z-10 flex items-center justify-center w-8 h-8 rounded-full"
               :class="getActivityColor(activity.action)">
            <div class="w-3 h-3 rounded-full bg-white dark:bg-gray-800"></div>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ activity.description }}
                </p>
                <div v-if="activity.changes && Object.keys(activity.changes).length > 0" class="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <span v-for="(value, key) in activity.changes" :key="key" class="mr-3">
                    <strong>{{ key }}:</strong> 
                    <span v-if="typeof value === 'object'">
                      {{ value.from }} → {{ value.to }}
                    </span>
                    <span v-else>{{ value }}</span>
                  </span>
                </div>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap mr-3">
                {{ formatDate(activity.createdAt) }}
              </span>
            </div>
            <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              توسط: {{ activity.performedBy?.name || 'سیستم' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import dateUtils from '@/utils/dateUtils'

const props = defineProps({
  requestId: {
    type: String,
    required: true
  }
})

const activities = ref([])
const loading = ref(false)

const getActivityColor = (action) => {
  const colors = {
    created: 'bg-green-100 dark:bg-green-900/30',
    updated: 'bg-blue-100 dark:bg-blue-900/30',
    status_changed: 'bg-purple-100 dark:bg-purple-900/30',
    assigned: 'bg-yellow-100 dark:bg-yellow-900/30',
    comment_added: 'bg-indigo-100 dark:bg-indigo-900/30',
    closed: 'bg-gray-100 dark:bg-gray-700',
    reopened: 'bg-orange-100 dark:bg-orange-900/30'
  }
  return colors[action] || 'bg-gray-100 dark:bg-gray-700'
}

const formatDate = (date) => {
  if (!date) return ''
  return dateUtils.formatDate(date, 'jYYYY/jMM/jDD HH:mm')
}

const loadActivities = async () => {
  loading.value = true
  try {
    const response = await api.get(`/requests/${props.requestId}/activities`)
    if (response.data.success) {
      activities.value = response.data.data || []
    }
  } catch (error) {
    console.error('Error loading activities:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadActivities()
})
</script>

