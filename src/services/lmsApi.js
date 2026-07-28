import apiClient from '../config/api'

async function call(endpoint, params = {}) {
  const { data } = await apiClient.post(endpoint, {
    jsonrpc: '2.0',
    method: 'call',
    params,
  })
  if (data.error) {
    throw Object.assign(
      new Error(data.error.data?.message || data.error.message || 'Server error'),
      { code: 'server_error' }
    )
  }
  const result = data.result
  if (result?.status === 'error') {
    throw Object.assign(new Error(result.message), { code: result.code })
  }
  return result?.data ?? result
}

export const lmsApi = {
  // ── DASHBOARD ────────────────────────────────────────────────────────
  myDashboard: (params = {}) =>
    call('/web/v1/lms/dashboard', { operation: 'my_dashboard', ...params }),
  managerDashboard: (params = {}) =>
    call('/web/v1/lms/dashboard', { operation: 'manager_dashboard', ...params }),
  companyOverview: (params = {}) =>
    call('/web/v1/lms/dashboard', { operation: 'company_overview', ...params }),
  dashboardAnalytics: (params = {}) =>
    call('/web/v1/lms/dashboard', { operation: 'analytics', ...params }),

  // ── COURSES ──────────────────────────────────────────────────────────
  courseSearch: (params = {}) =>
    call('/web/v1/lms/courses', { operation: 'search', ...params }),
  courseCreate: (params) =>
    call('/web/v1/lms/courses', { operation: 'create', ...params }),
  courseUpdate: (params) =>
    call('/web/v1/lms/courses', { operation: 'update', ...params }),
  courseDelete: (params) =>
    call('/web/v1/lms/courses', { operation: 'delete', ...params }),
  courseArchive: (params) =>
    call('/web/v1/lms/courses', { operation: 'archive', ...params }),
  courseUnarchive: (params) =>
    call('/web/v1/lms/courses', { operation: 'unarchive', ...params }),
  coursePublish: (params) =>
    call('/web/v1/lms/courses', { operation: 'publish', ...params }),
  courseEnroll: (params) =>
    call('/web/v1/lms/courses', { operation: 'enroll', ...params }),
  courseStats: (params) =>
    call('/web/v1/lms/courses', { operation: 'stats', ...params }),

  // ── ENROLLMENTS ──────────────────────────────────────────────────────
  enrollmentSearch: (params = {}) =>
    call('/web/v1/lms/enrollments', { operation: 'search', ...params }),
  enrollmentCreate: (params) =>
    call('/web/v1/lms/enrollments', { operation: 'create', ...params }),
  enrollmentUpdateProgress: (params) =>
    call('/web/v1/lms/enrollments', { operation: 'update_progress', ...params }),
  enrollmentComplete: (params) =>
    call('/web/v1/lms/enrollments', { operation: 'complete', ...params }),
  enrollmentReset: (params) =>
    call('/web/v1/lms/enrollments', { operation: 'reset', ...params }),
  myEnrollments: (params = {}) =>
    call('/web/v1/lms/enrollments', { operation: 'my_enrollments', ...params }),
  bulkEnroll: (params) =>
    call('/web/v1/lms/enrollments', { operation: 'bulk_enroll', ...params }),

  // ── ASSESSMENTS ──────────────────────────────────────────────────────
  assessmentSearch: (params = {}) =>
    call('/web/v1/lms/assessments', { operation: 'search', ...params }),
  assessmentCreate: (params) =>
    call('/web/v1/lms/assessments', { operation: 'create', ...params }),
  assessmentUpdate: (params) =>
    call('/web/v1/lms/assessments', { operation: 'update', ...params }),
  assessmentDelete: (params) =>
    call('/web/v1/lms/assessments', { operation: 'delete', ...params }),
  assessmentSubmit: (params) =>
    call('/web/v1/lms/assessments', { operation: 'submit', ...params }),
  assessmentGetQuestions: (params) =>
    call('/web/v1/lms/assessments', { operation: 'get_questions', ...params }),
  assessmentAddQuestion: (params) =>
    call('/web/v1/lms/assessments', { operation: 'add_question', ...params }),
  assessmentUpdateQuestion: (params) =>
    call('/web/v1/lms/assessments', { operation: 'update_question', ...params }),
  assessmentDeleteQuestion: (params) =>
    call('/web/v1/lms/assessments', { operation: 'delete_question', ...params }),
  assessmentResults: (params = {}) =>
    call('/web/v1/lms/assessments', { operation: 'results', ...params }),
  assessmentRetry: (params) =>
    call('/web/v1/lms/assessments', { operation: 'retry', ...params }),
  assessmentForModule: (params) =>
    call('/web/v1/lms/assessments', { operation: 'get_for_module', ...params }),

  // ── COMPETENCIES ─────────────────────────────────────────────────────
  competencySearch: (params = {}) =>
    call('/web/v1/lms/competencies', { operation: 'search', ...params }),
  myCompetencies: (params = {}) =>
    call('/web/v1/lms/competencies', { operation: 'my_competencies', ...params }),
  competencyValidate: (params) =>
    call('/web/v1/lms/competencies', { operation: 'validate', ...params }),
  competencySearchUsers: (params = {}) =>
    call('/web/v1/lms/competencies', { operation: 'search_users', ...params }),
  competencyLeaderboard: (params = {}) =>
    call('/web/v1/lms/competencies', { operation: 'leaderboard', ...params }),

  // ── CATEGORIES ───────────────────────────────────────────────────────
  categorySearch: (params = {}) =>
    call('/web/v1/lms/categories', { operation: 'search', ...params }),
  categoryCreate: (params) =>
    call('/web/v1/lms/categories', { operation: 'create', ...params }),
  categoryUpdate: (params) =>
    call('/web/v1/lms/categories', { operation: 'update', ...params }),
  categoryDelete: (params) =>
    call('/web/v1/lms/categories', { operation: 'delete', ...params }),

  // ── MODULES ──────────────────────────────────────────────────────────
  moduleSearch: (params = {}) =>
    call('/web/v1/lms/modules', { operation: 'search', ...params }),
  moduleCreate: (params) =>
    call('/web/v1/lms/modules', { operation: 'create', ...params }),
  moduleUpdate: (params) =>
    call('/web/v1/lms/modules', { operation: 'update', ...params }),
  moduleDelete: (params) =>
    call('/web/v1/lms/modules', { operation: 'delete', ...params }),
  moduleUploadContent: (params) =>
    call('/web/v1/lms/modules', { operation: 'upload_content', ...params }),

  // ── SECTIONS (course structure 2-level) ──────────────────────────────
  sectionSearch: (params = {}) =>
    call('/web/v1/lms/sections', { operation: 'search', ...params }),
  sectionCreate: (params) =>
    call('/web/v1/lms/sections', { operation: 'create', ...params }),
  sectionUpdate: (params) =>
    call('/web/v1/lms/sections', { operation: 'update', ...params }),
  sectionDelete: (params) =>
    call('/web/v1/lms/sections', { operation: 'delete', ...params }),
  sectionReorder: (params) =>
    call('/web/v1/lms/sections', { operation: 'reorder', ...params }),

  // ── COURSE QUIZ (in-course, sourced from SOP quiz bank) ──────────────
  courseQuizGet: (params) =>
    call('/web/v1/lms/course-quiz', { operation: 'get', ...params }),
  courseQuizStart: (params) =>
    call('/web/v1/lms/course-quiz', { operation: 'start', ...params }),
  courseQuizSubmit: (params) =>
    call('/web/v1/lms/course-quiz', { operation: 'submit', ...params }),
  courseQuizGradeEssays: (params) =>
    call('/web/v1/lms/course-quiz', { operation: 'grade_essays', ...params }),

  // ── LEARNING PATHS ───────────────────────────────────────────────────
  learningPathSearch: (params = {}) =>
    call('/web/v1/lms/learning-paths', { operation: 'search', ...params }),
  learningPathCreate: (params) =>
    call('/web/v1/lms/learning-paths', { operation: 'create', ...params }),
  learningPathUpdate: (params) =>
    call('/web/v1/lms/learning-paths', { operation: 'update', ...params }),
  learningPathDelete: (params) =>
    call('/web/v1/lms/learning-paths', { operation: 'delete', ...params }),
  learningPathEnroll: (params) =>
    call('/web/v1/lms/learning-paths', { operation: 'enroll', ...params }),
  learningPathProgress: (params) =>
    call('/web/v1/lms/learning-paths', { operation: 'progress', ...params }),

  // ── BADGES ───────────────────────────────────────────────────────────
  badgeSearch: (params = {}) =>
    call('/web/v1/lms/badges', { operation: 'search', ...params }),
  myBadges: (params = {}) =>
    call('/web/v1/lms/badges', { operation: 'my_badges', ...params }),
  badgeLeaderboard: (params = {}) =>
    call('/web/v1/lms/badges', { operation: 'leaderboard', ...params }),
  badgeAward: (params) =>
    call('/web/v1/lms/badges', { operation: 'award', ...params }),
  badgeCreate: (params) =>
    call('/web/v1/lms/badges', { operation: 'create', ...params }),
  badgeUpdate: (params) =>
    call('/web/v1/lms/badges', { operation: 'update', ...params }),
  badgeDelete: (params) =>
    call('/web/v1/lms/badges', { operation: 'delete', ...params }),

  // ── ANALYTICS ────────────────────────────────────────────────────────
  courseAnalytics: (params = {}) =>
    call('/web/v1/lms/analytics', { operation: 'course_analytics', ...params }),
  userAnalytics: (params = {}) =>
    call('/web/v1/lms/analytics', { operation: 'user_analytics', ...params }),
  departmentAnalytics: (params = {}) =>
    call('/web/v1/lms/analytics', { operation: 'department_analytics', ...params }),
  trendAnalysis: (params = {}) =>
    call('/web/v1/lms/analytics', { operation: 'trend_analysis', ...params }),
  customReport: (params = {}) =>
    call('/web/v1/lms/analytics', { operation: 'custom_report', ...params }),

  // ── EMPLOYEES ────────────────────────────────────────────────────────
  employeeSearch: (params = {}) =>
    call('/web/v1/lms/employees', { operation: 'search', ...params }),
  employeeProfile: (params) =>
    call('/web/v1/lms/employees', { operation: 'profile', ...params }),
  employeeAutoEnroll: (params = {}) =>
    call('/web/v1/lms/employees', { operation: 'auto_enroll', ...params }),
  employeeComplianceReport: (params = {}) =>
    call('/web/v1/lms/employees', { operation: 'compliance_report', ...params }),
  employeePerformanceImpact: (params = {}) =>
    call('/web/v1/lms/employees', { operation: 'performance_impact', ...params }),
  employeeDepartments: () =>
    call('/web/v1/lms/employees', { operation: 'departments' }),
  jobPositions: () =>
    call('/web/v1/lms/employees', { operation: 'job_positions' }),
  employeeLeaderboard: (params = {}) =>
    call('/web/v1/lms/employees', { operation: 'leaderboard', ...params }),
}
