// API Assessment Calon Kabeng (/web/v1/leader, JSON-RPC dengan operation).
// Dijalankan di database Akademi; sama dengan layar PitClock.
import apiClient from '../config/api'

const UPLOAD_TIMEOUT = 120000

async function op(operation, params = {}, config = {}) {
  const { data } = await apiClient.post('/web/v1/leader', {
    jsonrpc: '2.0',
    method: 'call',
    params: { operation, ...params },
  }, config)
  if (data.error) {
    throw new Error(data.error.data?.message || data.error.message || 'Server error')
  }
  if (data.result?.status === 'error') throw new Error(data.result.message)
  return data.result?.data
}

export const leaderApi = {
  config: () => op('config'),
  programSave: (id, data) => op('program_save', { id, data }),
  programDelete: (id) => op('program_delete', { id }),
  topicGet: (id) => op('topic_get', { id }),
  topicSave: (id, data) => op('topic_save', { id, data }),
  topicDelete: (id) => op('topic_delete', { id }),
  topicsReorder: (ids) => op('topics_reorder', { ids }),
  questionSave: ({ id, topicId, data }) => op('question_save', id ? { id, data } : { topic_id: topicId, data }),
  questionDelete: (id) => op('question_delete', { id }),
  questionsReorder: (ids) => op('questions_reorder', { ids }),
  importTemplate: () => op('import_template'),
  questionsImport: (payload) => op('questions_import', payload, { timeout: UPLOAD_TIMEOUT }),
  questionsExport: (topicId) => op('questions_export', { topic_id: topicId }),
  materialUpload: (payload) => op('material_upload', payload, { timeout: UPLOAD_TIMEOUT }),
  materialDelete: (id) => op('material_delete', { id }),
  participants: (programId) => op('participants', { program_id: programId }),
  participantSave: (id, data) => op('participant_save', { id, data }),
  participantDelete: (id) => op('participant_delete', { id }),
  employees: (q) => op('employees', { q }),
  assign: (payload) => op('assign', payload),
  kiosk: (programId, regenerate = false) => op('kiosk', { program_id: programId, regenerate }),
  attempts: (filters) => op('attempts', filters),
  attemptDetail: (id) => op('attempt_detail', { id }),
  attemptUpdate: (id, data) => op('attempt_update', { id, data }),
  attemptReset: (id) => op('attempt_reset', { id }),
  attemptFinish: (id) => op('attempt_finish', { id }),
  attemptDelete: (id) => op('attempt_delete', { id }),
  recap: (programId) => op('recap', { program_id: programId }),
}

const MIME = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
  pdf: 'application/pdf',
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Unduh file dari string base64 (balasan API). */
export function downloadBase64(filename, content, mimetype) {
  const bin = atob(content || '')
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  const ext = (filename.split('.').pop() || '').toLowerCase()
  saveBlob(new Blob([bytes], { type: mimetype || MIME[ext] || 'application/octet-stream' }), filename)
}

/** Baca File jadi base64 murni (tanpa awalan data:). */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = () => reject(new Error('File tidak bisa dibaca.'))
    reader.readAsDataURL(file)
  })
}

/** Unduh bahan lewat axios blob supaya header sesi ikut terkirim. */
export async function downloadMaterial(material) {
  const res = await apiClient.get(`/web/v1/leader/material/${material.id}`, { responseType: 'blob', timeout: UPLOAD_TIMEOUT })
  saveBlob(res.data, material.name)
}
