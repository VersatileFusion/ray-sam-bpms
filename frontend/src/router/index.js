import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        {
          path: '/requests',
          name: 'Requests',
          component: () => import('@/views/Requests.vue'),
        },
        {
          path: '/requests/create',
          name: 'CreateRequest',
          component: () => import('@/views/CreateRequest.vue'),
        },
        {
          path: '/requests/:id',
          name: 'RequestDetails',
          component: () => import('@/views/RequestDetails.vue'),
        },
        {
          path: '/notifications',
          name: 'Notifications',
          component: () => import('@/views/Notifications.vue'),
        },
        {
          path: '/admin/users',
          name: 'UserManagement',
          component: () => import('@/views/admin/UserManagement.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('@/views/Profile.vue'),
        },
        {
          path: '/reports',
          name: 'Reports',
          component: () => import('@/views/Reports.vue'),
        },
        {
          path: '/scheduled-reports',
          name: 'ScheduledReports',
          component: () => import('@/views/ScheduledReports.vue'),
        },
        {
          path: '/export-history',
          name: 'ExportHistory',
          component: () => import('@/views/ExportHistory.vue'),
        },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state
  if (!authStore.user) {
    await authStore.checkAuth()
  }
  
  if (to.meta.requiresAuth && !authStore.user) {
    next({ name: 'Login' })
  } else if (to.meta.requiresGuest && authStore.user) {
    next({ name: 'Dashboard' })
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router

