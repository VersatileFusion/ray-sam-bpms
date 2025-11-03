import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const authStore = useAuthStore()

  const shortcuts = {
    // Create new request: Cmd/Ctrl + N
    'n': (e) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        if (authStore.user) {
          router.push('/requests/create')
        }
      }
    },
    
    // Dashboard: Cmd/Ctrl + D
    'd': (e) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        if (authStore.user) {
          router.push('/')
        }
      }
    },
    
    // Requests list: Cmd/Ctrl + R
    'r': (e) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        if (authStore.user) {
          router.push('/requests')
        }
      }
    },
    
    // Notifications: Cmd/Ctrl + M
    'm': (e) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        if (authStore.user) {
          router.push('/notifications')
        }
      }
    },
    
    // Profile: Cmd/Ctrl + P
    'p': (e) => {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        if (authStore.user) {
          router.push('/profile')
        }
      }
    }
  }

  const handleKeyDown = (e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.isContentEditable) {
      return
    }

    const key = e.key.toLowerCase()
    if (shortcuts[key]) {
      shortcuts[key](e)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
}

