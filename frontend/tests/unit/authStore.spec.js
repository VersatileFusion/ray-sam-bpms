import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/store/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with null user', () => {
    const store = useAuthStore()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('should have correct getters', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isAdmin).toBe(false)
    expect(store.isCustomer).toBe(false)
  })

  it('should update isAdmin when user is admin', () => {
    const store = useAuthStore()
    store.user = { role: 'admin', name: 'Admin', username: 'admin' }
    expect(store.isAdmin).toBe(true)
    expect(store.isAuthenticated).toBe(true)
  })

  it('should update isCustomer when user is customer', () => {
    const store = useAuthStore()
    store.user = { role: 'customer', name: 'Customer', username: 'customer' }
    expect(store.isCustomer).toBe(true)
    expect(store.isAuthenticated).toBe(true)
  })
})

