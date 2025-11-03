import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import RequestDetails from '@/views/RequestDetails.vue'

describe('RequestDetails.vue', () => {
  let router
  
  beforeEach(() => {
    setActivePinia(createPinia())
    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/requests/:id', component: RequestDetails }]
    })
  })

  it('should render request details', async () => {
    const wrapper = mount(RequestDetails, {
      global: {
        plugins: [createPinia(), router]
      },
      props: {
        request: {
          _id: '123',
          customerName: 'Test Customer',
          request: 'Test Request',
          status: 'باز'
        }
      }
    })

    expect(wrapper.text()).toContain('Test Customer')
  })

  it('should show loading state initially', () => {
    const wrapper = mount(RequestDetails, {
      global: {
        plugins: [createPinia(), router]
      },
      data() {
        return { loading: true }
      }
    })

    expect(wrapper.find('.animate-spin').exists()).toBe(true)
  })
})

