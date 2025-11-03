<template>
  <div>
    <label class="label">استفاده از الگو (اختیاری)</label>
    <select 
      v-model="selectedTemplateId" 
      class="input"
      @change="applyTemplate"
    >
      <option value="">بدون الگو</option>
      <option 
        v-for="template in templates" 
        :key="template._id" 
        :value="template._id"
      >
        {{ template.name }} - {{ template.system }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'template-applied'])

const templates = ref([])
const selectedTemplateId = ref(props.modelValue)
const loading = ref(false)

const loadTemplates = async () => {
  loading.value = true
  try {
    const response = await api.get('/request-templates')
    if (response.data.success) {
      templates.value = response.data.templates || []
    }
  } catch (error) {
    console.error('Error loading templates:', error)
  } finally {
    loading.value = false
  }
}

const applyTemplate = async () => {
  if (!selectedTemplateId.value) {
    emit('template-applied', null)
    return
  }

  try {
    const response = await api.get(`/request-templates/${selectedTemplateId.value}`)
    if (response.data.success) {
      emit('template-applied', response.data.template)
      emit('update:modelValue', selectedTemplateId.value)
    }
  } catch (error) {
    console.error('Error loading template:', error)
  }
}

onMounted(() => {
  loadTemplates()
})
</script>

