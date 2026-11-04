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

function blobBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = () => reject(new Error('File tidak bisa dibaca.'))
    reader.readAsDataURL(blob)
  })
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
  importCases: (cases, dryRun) => op('import_cases', { cases, dry_run: dryRun }),
  newCycleToken: (id) => op('cycle_new_token', { id }),
  employees: (search = '') => op('employees', { search }),
  courses: () => op('courses'),
  audioUrl: (recordingId) => `/web/v1/lms/competency/recording/${recordingId}/audio`,
  // Pengguna
  myTasks: () => op('my_tasks'),
  attempt: (attemptId) => op('attempt_get', { attempt_id: attemptId }),
  startAttempt: (attemptId) => op('attempt_start', { attempt_id: attemptId }),
  saveAttempt: (attemptId, answers) => op('attempt_save', { attempt_id: attemptId, answers }),
  submitAttempt: (attemptId, answers, timeout = false) => op('attempt_submit', { attempt_id: attemptId, answers, timeout }),
  join: (token) => op('join', { token }),
  tours: () => op('tour_get'),
  saveTour: (tour, step, done = false) => op('tour_save', { tour, step, done }),
  recordingStart: (attemptId, consent, mimetype) => op('recording_start', { attempt_id: attemptId, consent, mimetype }),
  recordingChunk: (recordingId, seq, data, duration) => op('recording_chunk', { recording_id: recordingId, seq, data, duration }),
  recordingMarker: (recordingId, t, code, label) => op('recording_marker', { recording_id: recordingId, t, code, label }),
  recordingStop: (recordingId, duration) => op('recording_stop', { recording_id: recordingId, duration }),
  recordingDiscard: (recordingId) => op('recording_discard', { recording_id: recordingId }),
  rating: (ratingId) => op('rating_get', { rating_id: ratingId }),
  submitRating: (ratingId, payload) => op('rating_submit', { rating_id: ratingId, ...payload }),
  myResult: (participantId) => op('my_result', { participant_id: participantId }),

  // Menu Asesmen (Asesmen Terpadu)
  packages: () => op('packages'),
  package: (profileId) => op('package_get', { profile_id: profileId }),
  savePackage: (profileId, data) => op('package_save', { profile_id: profileId, data }),
  oralBank: () => op('oral_bank'),
  saveOralQuestion: (id, data) => op('oral_question_save', { id, data }),
  archiveOralQuestion: (id, active) => op('oral_question_archive', { id, active }),
  users: (search = '') => op('users', { search }),
  terpaduCycles: () => op('terpadu_cycles'),
  saveTerpaduCycle: (id, data) => op('terpadu_cycle_save', { id, data }),
  terpaduCycle: (id) => op('terpadu_cycle_detail', { id }),
  setLeads: (participantIds, leadIds, mode = 'replace') => op('terpadu_set_leads', { participant_ids: participantIds, lead_ids: leadIds, mode }),
  useManagersAsLeads: (id) => op('terpadu_use_managers', { id }),
  recap: (id) => op('terpadu_recap', { id }),
  recapParticipant: (id) => op('terpadu_participant', { id }),
  reviewOral: (lineId, scores, note) => op('oral_review', { line_id: lineId, scores, note }),
  requeueOral: (oralId) => op('oral_requeue', { oral_id: oralId }),
  requeueCase: (attemptId) => op('terpadu_requeue_case', { attempt_id: attemptId }),
  retranscribeOral: (recordingId) => op('oral_retranscribe', { recording_id: recordingId }),
  useOralRecording: (recordingId, used) => op('oral_recording_use', { recording_id: recordingId, used }),
  /** Asesor melampirkan file rekaman untuk satu soal; dikirim per potongan agar tahan sinyal lemah. */
  async attachOralRecording(lineId, kind, file, { replace = true, duration = 0, onProgress } = {}) {
    const { recording_id: id } = await op('oral_attach_start', {
      line_id: lineId, kind, mimetype: file.type, filename: file.name, size: file.size,
    })
    const PART = 1536 * 1024
    for (let seq = 0, at = 0; at < file.size; seq += 1, at += PART) {
      const data = await blobBase64(file.slice(at, at + PART))
      await op('oral_attach_chunk', { recording_id: id, seq, data })
      onProgress?.(Math.min(1, (at + PART) / file.size))
    }
    return op('oral_attach_finish', { recording_id: id, duration, replace })
  },
  validate: (id, note, undo = false) => op('terpadu_validate', { id, note, undo }),
  oral: (oralId) => op('oral_get', { oral_id: oralId }),
  oralStart: (lineId, consent, mimetype) => op('oral_start', { line_id: lineId, consent, mimetype }),
  oralFinish: (lineId) => op('oral_finish', { line_id: lineId }),
  oralFollowupStart: (lineId, mimetype) => op('oral_followup_start', { line_id: lineId, mimetype }),
  oralFollowupFinish: (lineId) => op('oral_followup_finish', { line_id: lineId }),
  terpaduResult: (participantId) => op('terpadu_my_result', { participant_id: participantId }),
}
