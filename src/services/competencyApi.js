// API Peta Kompetensi (/web/v1/lms/competency, JSON-RPC dengan operation).
import apiClient from '../config/api'

async function op(operation, params = {}) {
  const { data } = await apiClient.post('/web/v1/lms/competency', {
    jsonrpc: '2.0',
    method: 'call',
    params: { operation, ...params },
  })
  if (data.error) {
    throw new Error(data.error.data?.message || data.error.message || 'Server error')
  }
  if (data.result?.status === 'error') throw new Error(data.result.message)
  return data.result?.data
}

export const competencyApi = {
  // Admin
  config: () => op('config'),
  saveProfile: (id, data) => op('save_profile', { id, data }),
  savePillar: (id, data) => op('save_pillar', { id, data }),
  saveQuestions: (profileId, questions) => op('save_questions', { profile_id: profileId, questions }),
  saveCase: (id, data) => op('save_case', { id, data }),
  archiveCase: (id, active) => op('archive_case', { id, active }),
  cycles: () => op('cycle_list'),
  saveCycle: (id, data) => op('cycle_save', { id, data }),
  openCycle: (id) => op('cycle_open', { id }),
  closeCycle: (id) => op('cycle_close', { id }),
  reopenCycle: (id) => op('cycle_reopen', { id }),
  cycleDetail: (id) => op('cycle_detail', { id }),
  addParticipants: (cycleId, employeeIds) => op('participant_add', { cycle_id: cycleId, employee_ids: employeeIds }),
  updateParticipant: (id, data) => op('participant_update', { id, ...data }),
  removeParticipant: (id) => op('participant_remove', { id }),
  participantDetail: (id) => op('participant_detail', { id }),
  setManual: (id, pillarId, level, note) => op('set_manual', { id, pillar_id: pillarId, level, note }),
  requeue: (attemptId) => op('requeue', { attempt_id: attemptId }),
  employees: (search = '') => op('employees', { search }),
  courses: () => op('courses'),
  audioUrl: (recordingId) => `/web/v1/lms/competency/recording/${recordingId}/audio`,
  // Pengguna
  myTasks: () => op('my_tasks'),
  attempt: (attemptId) => op('attempt_get', { attempt_id: attemptId }),
  saveAttempt: (attemptId, answers) => op('attempt_save', { attempt_id: attemptId, answers }),
  submitAttempt: (attemptId, answers) => op('attempt_submit', { attempt_id: attemptId, answers }),
  recordingStart: (attemptId, consent, mimetype) => op('recording_start', { attempt_id: attemptId, consent, mimetype }),
  recordingChunk: (recordingId, seq, data, duration) => op('recording_chunk', { recording_id: recordingId, seq, data, duration }),
  recordingMarker: (recordingId, t, code, label) => op('recording_marker', { recording_id: recordingId, t, code, label }),
  recordingStop: (recordingId, duration) => op('recording_stop', { recording_id: recordingId, duration }),
  recordingDiscard: (recordingId) => op('recording_discard', { recording_id: recordingId }),
  rating: (ratingId) => op('rating_get', { rating_id: ratingId }),
  submitRating: (ratingId, payload) => op('rating_submit', { rating_id: ratingId, ...payload }),
  myResult: (participantId) => op('my_result', { participant_id: participantId }),
}
