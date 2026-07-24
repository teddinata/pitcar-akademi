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

export const quizApi = {
  // ── EMPLOYEE ─────────────────────────────────────────────────────────
  list: (params = {}) => call('/web/quiz/list', params),
  detail: (quizId) => call(`/web/quiz/${quizId}/detail`),
  start: (quizId) => call(`/web/quiz/${quizId}/start`),
  submit: (sessionId, answers) =>
    call(`/web/quiz/session/${sessionId}/submit`, { answers }),
  result: (resultId) => call(`/web/quiz/result/${resultId}`),
  history: (params = {}) => call('/web/quiz/history', params),

  // ── MONITORING ───────────────────────────────────────────────────────
  dashboard: (params = {}) => call('/web/quiz/dashboard', params),
  adminMonitoring: (quizId) => call(`/web/quiz/admin/quiz/${quizId}/monitoring`),
  adminProgramMonitoring: (programId) => call(`/web/quiz/admin/program/${programId}/monitoring`),

  // ── ADMIN TOOLS ──────────────────────────────────────────────────────
  adminResetSession: (params) => call('/web/quiz/admin/reset-session', params),
  adminAssign: (params) => call('/web/quiz/admin/assign', params),

  // ── ADMIN CRUD QUIZ ──────────────────────────────────────────────────
  adminList: (params = {}) => call('/web/quiz/admin/quiz/list', params),
  adminCreate: (params) => call('/web/quiz/admin/quiz/create', params),
  adminUpdate: (quizId, params) =>
    call(`/web/quiz/admin/quiz/${quizId}/update`, params),
  adminDelete: (quizId) => call(`/web/quiz/admin/quiz/${quizId}/delete`),
  adminSubmitReview: (quizId) =>
    call(`/web/quiz/admin/quiz/${quizId}/submit-review`),
  adminPublish: (quizId) => call(`/web/quiz/admin/quiz/${quizId}/publish`),
  adminClose: (quizId) => call(`/web/quiz/admin/quiz/${quizId}/close`),
  adminCopy: (quizId, params = {}) => call(`/web/quiz/admin/quiz/${quizId}/copy`, params),

  // ── SOP LIST ─────────────────────────────────────────────────────────
  sopList: (params = {}) => call('/web/v2/sop', { operation: 'list', limit: 200, ...params }),

  // ── ADMIN CRUD SOAL ──────────────────────────────────────────────────
  adminQuestionList: (quizId) =>
    call(`/web/quiz/admin/quiz/${quizId}/questions/list`),
  adminQuestionCreate: (quizId, params) =>
    call(`/web/quiz/admin/quiz/${quizId}/questions/create`, params),
  adminQuestionUpdate: (questionId, params) =>
    call(`/web/quiz/admin/question/${questionId}/update`, params),
  adminQuestionDelete: (questionId) =>
    call(`/web/quiz/admin/question/${questionId}/delete`),

  // ── QUIZ PROGRAM ─────────────────────────────────────────────────────
  programList: (params = {}) => call('/web/quiz/program/list', params),
  programCreate: (params) => call('/web/quiz/program/create', params),
  programDetail: (programId) => call(`/web/quiz/program/${programId}/detail`),
  programUpdate: (programId, params) =>
    call(`/web/quiz/program/${programId}/update`, params),
  programDelete: (programId) => call(`/web/quiz/program/${programId}/delete`),
  programActivate: (programId) =>
    call(`/web/quiz/program/${programId}/activate`),
  programClose: (programId) => call(`/web/quiz/program/${programId}/close`),
  programReopen: (programId) => call(`/web/quiz/program/${programId}/reopen`),
  programSummary: (programId) => call(`/web/quiz/program/${programId}/summary`),
  programStart: (programId) => call(`/web/quiz/program/${programId}/start`),
  programSubmit: (payload) => call('/web/quiz/program/submit', payload),
  programAvailableBanks: (programId) => call(`/web/quiz/program/${programId}/available-banks`),
  programAttachBanks: (programId, bankIds) =>
    call(`/web/quiz/program/${programId}/attach-banks`, { bank_ids: bankIds }),

  // ── SESSION DETAIL (ADMIN) ───────────────────────────────────────────
  adminSessionDetail: (sessionId) =>
    call(`/web/quiz/admin/session/${sessionId}/detail`),

  // ── ESSAY GRADING ────────────────────────────────────────────────────
  gradeEssays: (sessionId, gradings) =>
    call(`/web/quiz/session/${sessionId}/grade-essays`, { gradings }),
  pendingGrading: (params = {}) => call('/web/quiz/admin/pending-grading', params),

  // ── IMPORT/EXPORT ────────────────────────────────────────────────────
  // Full Quiz Import (deprecated - use questions import instead)
  adminImportExcel: (params) => call('/web/quiz/admin/import-excel', params),
  adminDownloadTemplate: () => {
    // Use relative path to go through Vite proxy (preserves session cookies)
    const a = document.createElement('a')
    a.href = '/web/quiz/admin/download-template'
    a.download = 'Quiz_Import_Template.xlsx'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  },

  // Questions Import (recommended - import soal ke quiz yang sudah ada)
  adminImportQuestions: (quizId, params) =>
    call(`/web/quiz/admin/quiz/${quizId}/import-questions`, params),
  adminDownloadTemplateQuestions: () => {
    // Use relative path to go through Vite proxy (preserves session cookies)
    const a = document.createElement('a')
    a.href = '/web/quiz/admin/download-template-questions'
    a.download = 'Quiz_Questions_Template.xlsx'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  },
}
