<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4" @click.self="close">
    <div class="relative max-w-7xl max-h-full">
      <button
        @click="close"
        class="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <img
        :src="imageUrl"
        :alt="alt"
        class="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        @error="handleError"
      />
      
      <div v-if="navigation && images && images.length > 1" class="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
        <button
          v-if="currentIndex > 0"
          @click="previousImage"
          class="pointer-events-auto bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          v-if="currentIndex < images.length - 1"
          @click="nextImage"
          class="pointer-events-auto bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    required: true
  },
  images: {
    type: Array,
    default: null
  },
  alt: {
    type: String,
    default: 'تصویر'
  },
  navigation: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'update:isOpen'])

const currentIndex = ref(0)
const imageError = ref(false)

const currentImageUrl = computed(() => {
  if (props.images && props.images.length > 0) {
    return props.images[currentIndex.value]?.url || props.images[currentIndex.value]
  }
  return props.imageUrl
})

const handleError = () => {
  imageError.value = true
}

const previousImage = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    imageError.value = false
  }
}

const nextImage = () => {
  if (props.images && currentIndex.value < props.images.length - 1) {
    currentIndex.value++
    imageError.value = false
  }
}

const close = () => {
  emit('close')
  emit('update:isOpen', false)
}

// Keyboard navigation
const handleKeyDown = (e) => {
  if (!props.isOpen) return
  
  if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowLeft' && props.navigation && props.images) {
    previousImage()
  } else if (e.key === 'ArrowRight' && props.navigation && props.images) {
    nextImage()
  }
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.addEventListener('keydown', handleKeyDown)
    currentIndex.value = 0
    imageError.value = false
  } else {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

watch(() => props.imageUrl, () => {
  currentIndex.value = 0
  imageError.value = false
})
</script>

