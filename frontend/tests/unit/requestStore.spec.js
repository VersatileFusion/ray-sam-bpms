import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRequestStore } from '@/store/requests'

describe('Request Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty requests', () => {
    const store = useRequestStore()
    expect(store.requests).toEqual([])
    expect(store.currentRequest).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('should filter requests correctly', () => {
    const store = useRequestStore()
    
    // Set some requests
    store.requests = [
      { _id: '1', status: 'باز', system: 'مالی', priority: 'متوسط' },
      { _id: '2', status: 'انجام', system: 'مالی', priority: 'فوری' },
      { _id: '3', status: 'باز', system: 'انبار', priority: 'کم' }
    ]

    // Filter by status
    store.setFilters({ status: 'باز' })
    const filtered = store.filteredRequests
    expect(filtered.length).toBe(2)
    filtered.forEach(req => expect(req.status).toBe('باز'))

    // Filter by system
    store.setFilters({ system: 'مالی', status: '' })
    const filtered2 = store.filteredRequests
    expect(filtered2.length).toBe(2)
    filtered2.forEach(req => expect(req.system).toBe('مالی'))

    // Filter by priority
    store.setFilters({ priority: 'فوری', system: '' })
    const filtered3 = store.filteredRequests
    expect(filtered3.length).toBe(1)
    expect(filtered3[0].priority).toBe('فوری')
  })

  it('should clear filters correctly', () => {
    const store = useRequestStore()
    store.setFilters({ status: 'باز', system: 'مالی', priority: 'متوسط' })
    store.clearFilters()
    
    expect(store.filters.status).toBe('')
    expect(store.filters.system).toBe('')
    expect(store.filters.priority).toBe('')
  })
})

