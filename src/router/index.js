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
    redirect: '/dashboard/quiz',
    meta: { requiresAuth: true }
  },

  // ── ASSESSMENT / QUIZ ──────────────────────────────────────
  {
    path: '/dashboard/quiz',
    name: 'QuizList',
    component: () => import('../views/quiz/QuizList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/history',
    name: 'QuizHistory',
    component: () => import('../views/quiz/QuizHistory.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/admin',
    name: 'QuizDashboard',
    component: () => import('../views/quiz/QuizDashboard.vue'),
    meta: { requiresAuth: true }
  },
  // Quiz Program Routes
  {
    path: '/dashboard/quiz/program',
    name: 'QuizProgramManage',
    component: () => import('../views/quiz/QuizProgramManage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/program/new',
    name: 'QuizProgramNew',
    component: () => import('../views/quiz/QuizProgramForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/program/:id',
    name: 'QuizProgramDetail',
    component: () => import('../views/quiz/QuizProgramDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/program/:id/edit',
    name: 'QuizProgramEdit',
    component: () => import('../views/quiz/QuizProgramForm.vue'),
    meta: { requiresAuth: true }
  },
  // Quiz Bank Routes
  {
    path: '/dashboard/quiz/manage',
    name: 'QuizManage',
    component: () => import('../views/quiz/QuizManage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/manage/new',
    name: 'QuizBankNew',
    component: () => import('../views/quiz/QuizBankForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/manage/:id',
    name: 'QuizBankEdit',
    component: () => import('../views/quiz/QuizBankForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/take',
    name: 'QuizTaking',
    component: () => import('../views/quiz/QuizTaking.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/result/:resultId',
    name: 'QuizResult',
    component: () => import('../views/quiz/QuizResult.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/quiz/:id',
    name: 'QuizDetail',
    component: () => import('../views/quiz/QuizDetail.vue'),
    meta: { requiresAuth: true }
  },

  // ── LMS ───────────────────────────────────────────────────
  {
    path: '/dashboard/lms',
    name: 'LmsDashboard',
    component: () => import('../views/lms/LmsDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/courses',
    name: 'LmsCourses',
    component: () => import('../views/lms/LmsCourses.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/enrollments',
    name: 'LmsEnrollments',
    component: () => import('../views/lms/LmsEnrollments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/assessments',
    name: 'LmsAssessments',
    component: () => import('../views/lms/LmsAssessments.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/competencies',
    name: 'LmsCompetencies',
    component: () => import('../views/lms/LmsCompetencies.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/learning-paths',
    name: 'LmsLearningPaths',
    component: () => import('../views/lms/LmsLearningPaths.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/badges',
    name: 'LmsBadges',
    component: () => import('../views/lms/LmsBadges.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/analytics',
    name: 'LmsAnalytics',
    component: () => import('../views/lms/LmsAnalytics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/categories',
    name: 'LmsCategories',
    component: () => import('../views/lms/LmsCategories.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/modules',
    name: 'LmsModules',
    component: () => import('../views/lms/LmsModules.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/employees',
    name: 'LmsEmployees',
    component: () => import('../views/lms/LmsEmployees.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/lms/learn/:enrollmentId',
    name: 'LmsLearn',
    component: () => import('../views/lms/LmsLearn.vue'),
    meta: { requiresAuth: true }
  },

  // ── TRAINING JOURNEY ─────────────────────────────────────
  {
    path: '/dashboard/journey',
    name: 'JourneyList',
    component: () => import('../views/journey/JourneyList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/journey/mine',
    name: 'MyJourney',
    component: () => import('../views/journey/MyJourney.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/journey/templates',
    name: 'JourneyTemplates',
    component: () => import('../views/journey/JourneyTemplates.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/journey/:id',
    name: 'JourneyDetail',
    component: () => import('../views/journey/JourneyDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/journey/:id/assess',
    name: 'PracticalAssessForm',
    component: () => import('../views/journey/PracticalAssessForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/journey/:id/final-review',
    name: 'FinalReviewForm',
    component: () => import('../views/journey/FinalReviewForm.vue'),
    meta: { requiresAuth: true }
  },

  // ── HR / EMPLOYEES ────────────────────────────────────────
  {
    path: '/dashboard/employees',
    name: 'EmployeeList',
    component: () => import('../views/employees/EmployeeList.vue'),
    meta: { requiresAuth: true }
  },

  // ── HOLDING ───────────────────────────────────────────────
  {
    path: '/dashboard/overview',
    name: 'DashboardOverview',
    component: () => import('../views/OverviewDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard/holding/kpi',
    name: 'HoldingKPI',
    component: () => import('../views/KPI/Holding.vue'),
    meta: { requiresAuth: true }
  },

  // ── KPI ───────────────────────────────────────────────────
  {
    path: '/dashboard/kpi/outlet',
    name: 'OutletKPI',
    component: () => import('../views/KPI/Outlet.vue'),
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

  // ── STATS ─────────────────────────────────────────────────
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

  // ── AI ASSISTANT ─────────────────────────────────────────
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
      const numId = parseInt(route.params.id)
      if (!isNaN(numId)) return { chatId: numId }
      if (route.params.id !== 'new') router.push('/dashboard/ai-assistant')
      return { chatId: 0 }
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
  if (to.matched.some(r => r.meta.requiresAuth)) {
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
