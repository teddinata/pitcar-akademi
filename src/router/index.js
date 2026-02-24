// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MechanicDetail from '../views/MechanicDetail.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '',
    redirect: '/dashboard/overview',
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/overview',
    name: 'DashboardOverview',
    component: () => import('../views/OverviewDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/mechanics',
    name: 'Dashboard',
    component: () => import('../views/MechanicDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/mechanic/:id',
    name: 'MechanicDetail',
    component: MechanicDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/service-advisor',
    name: 'DashboardServiceAdvisor',
    component: () => import('../views/ServiceAdvisorDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/kpi/customer-support',
    name: 'CustomerSupportDashboard',
    component: () => import('../views/CustomerSupportDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/kpi/mechanic',
    name: 'MechanicKPI',
    component: () => import('../views/MechanicKPI.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/kpi/marketing',
    name: 'MarketingKPI',
    component: () => import('../views/MarketingKPI.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/kpi/kaizen',
    name: 'KaizenKPI',
    component: () => import('../views/KaizenKPI.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/kpi/it',
    name: 'ITKPI',
    component: () => import('../views/ITKPI.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/kpi/outlet',
    name: 'OutletKPI',
    component: () => import('../views/KPI/Outlet.vue'),
    meta: { requiresAuth: true }
  },

  // ⭐ HOLDING ROUTES
  {
    path: '/dashboard/holding/kpi',
    name: 'HoldingKPI',
    component: () => import('../views/KPI/Holding.vue'),
    meta: { requiresAuth: true }
  },

  {
    path: '/dashboard/ai-assistant',
    name: 'ai-assistant',
    component: () => import('../views/AIAssistant.vue')
  },
  {
    path: '/dashboard/ai-assistant/new',
    name: 'ai-assistant-new',
    component: () => import('../views/ChatDetail.vue')
  },
  {
    path: '/dashboard/ai-assistant/:id',
    name: 'ai-assistant-id',
    component: () => import('../views/ChatDetail.vue'),
    props: route => {
      const idParam = route.params.id
      const numId = parseInt(idParam)
      if (!isNaN(numId)) {
        return { chatId: numId }
      } else {
        if (idParam !== 'new') {
          router.push('/dashboard/ai-assistant')
        }
        return { chatId: 0 }
      }
    }
  },
  {
    path: '/dashboard/ai-assistant/settings',
    name: 'ai-assistant-settings',
    component: () => import('../views/SettingsView.vue')
  },
  {
    path: '/dashboard/ai-assistant/archived',
    name: 'archived-chats',
    component: () => import('../views/ArchivedChats.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

window.router = router

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  if (to.matched.some(record => record.meta.requiresAuth)) {
    authStore.checkAuth()
    if (!authStore.isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router