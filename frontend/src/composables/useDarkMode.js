import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

// Shared state
const isDark = ref(false)
let mediaQuery = null
let mediaQueryHandler = null

// Initialize dark mode immediately (before component mount)
const initDarkMode = () => {
  if (typeof window === 'undefined') return
  
  // Check localStorage first
  const stored = localStorage.getItem('darkMode')
  if (stored !== null) {
    isDark.value = stored === 'true'
  } else {
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyDarkMode()
}

const applyDarkMode = () => {
  if (typeof document === 'undefined') return
  
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', isDark.value.toString())
}

export function useDarkMode() {
  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    applyDarkMode()
  }

  const setDarkMode = (value) => {
    isDark.value = value
    applyDarkMode()
  }

  // Watch for system theme changes (only if user hasn't manually set a preference)
  onMounted(() => {
    // Initialize if not already done
    if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') === false && !localStorage.getItem('darkMode')) {
      initDarkMode()
    }
    
    // Set up system preference listener
    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQueryHandler = (e) => {
        // Only update if user hasn't manually set a preference
        if (!localStorage.getItem('darkMode')) {
          isDark.value = e.matches
          applyDarkMode()
        }
      }
      
      mediaQuery.addEventListener('change', mediaQueryHandler)
    }
  })

  onBeforeUnmount(() => {
    if (mediaQuery && mediaQueryHandler) {
      mediaQuery.removeEventListener('change', mediaQueryHandler)
    }
  })

  watch(isDark, () => {
    applyDarkMode()
  })

  return {
    isDark,
    toggleDarkMode,
    setDarkMode
  }
}

// Initialize immediately when module loads
if (typeof window !== 'undefined') {
  initDarkMode()
}

