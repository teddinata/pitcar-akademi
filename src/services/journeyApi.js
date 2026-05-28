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

export const journeyApi = {
  // ── TEMPLATE (admin) ─────────────────────────────────────────────
  templateList: (params = {}) => call('/web/journey/template/list', params),
  templateCreate: (params) => call('/web/journey/template/create', params),
  templateDetail: (id) => call(`/web/journey/template/${id}/detail`),
  templateUpdate: (id, params) => call(`/web/journey/template/${id}/update`, params),
  templateDelete: (id) => call(`/web/journey/template/${id}/delete`),

  // ── JOURNEY INSTANCES (admin / mentor) ───────────────────────────
  list: (params = {}) => call('/web/journey/list', params),
  create: (params) => call('/web/journey/create', params),
  detail: (id) => call(`/web/journey/${id}/detail`),
  start: (id) => call(`/web/journey/${id}/start`),
  syncScores: (id) => call(`/web/journey/${id}/sync-scores`),
  complete: (id, params = {}) => call(`/web/journey/${id}/complete`, params),
  cancel: (id) => call(`/web/journey/${id}/cancel`),

  // ── PRACTICAL ASSESSMENT (supervisor) ────────────────────────────
  practicalAssess: (journeyId, params) =>
    call(`/web/journey/${journeyId}/practical-assess`, params),

  // ── STAGE STATE (manual advance) ─────────────────────────────────
  stageUpdateState: (journeyId, spId, params) =>
    call(`/web/journey/${journeyId}/stage/${spId}/update-state`, params),

  // ── LOOKUP LISTS (for template dropdowns) ────────────────────────
  courseList: () => call('/web/journey/lms-courses'),
  quizProgramList: () => call('/web/journey/sop-quiz-programs'),

  // ── STAGE LINKING ─────────────────────────────────────────────────
  stageLinkSource: (journeyId, spId, params) =>
    call(`/web/journey/${journeyId}/stage/${spId}/link-source`, params),

  // ── EMPLOYEE SELF VIEW ────────────────────────────────────────────
  myJourney: () => call('/web/journey/my'),
}
