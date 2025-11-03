import { ref, onMounted, onUnmounted } from 'vue'
import { io } from 'socket.io-client'
import { useAuthStore } from '@/store/auth'
import { useToast } from './useToast'

let socket = null
const isConnected = ref(false)
const { success, error: showError } = useToast()

export function useSocket() {
  const connect = () => {
    if (socket?.connected) return

    const authStore = useAuthStore()
    if (!authStore.user) return

    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      isConnected.value = true
      console.log('Socket connected')
      
      // Join user-specific room
      if (authStore.user?._id) {
        socket.emit('join-user-room', authStore.user._id)
      }
    })

    socket.on('disconnect', () => {
      isConnected.value = false
      console.log('Socket disconnected')
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      isConnected.value = false
    })

    // Listen for notifications
    socket.on('notification', (data) => {
      if (data.message) {
        success(data.message)
      }
    })

    // Listen for request updates
    socket.on('request-updated', (data) => {
      console.log('Request updated:', data)
      // You can emit events or update stores here
    })

    return socket
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
      isConnected.value = false
    }
  }

  const joinRequestRoom = (requestId) => {
    if (socket && socket.connected) {
      socket.emit('join-request-room', requestId)
    }
  }

  const leaveRequestRoom = (requestId) => {
    if (socket && socket.connected) {
      socket.emit('leave-request-room', requestId)
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    joinRequestRoom,
    leaveRequestRoom
  }
}

