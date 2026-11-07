// API Kelas Offline Akademi. Admin lewat /web/v1/leader (login); mentor lewat /web/v1/leader/mentor (tautan
// bertoken, tanpa login). Keduanya memakai nama operasi yang sama, jadi komponen menerima salah satu klien.
import apiClient from '../config/api'

const UPLOAD_TIMEOUT = 120000

async function adminOp(operation, params = {}, config = {}) {
  const { data } = await apiClient.post('/web/v1/leader', { jsonrpc: '2.0', method: 'call', params: { operation, ...params } }, config)
  if (data.error) throw new Error(data.error.data?.message || data.error.message || 'Server error')
  if (data.result?.status === 'error') throw new Error(data.result.message)
  return data.result?.data
}

function client(op) {
  return {
    config: () => op('config', { kind: 'academy' }),
    programSave: (id, data) => op('program_save', { id, data: { ...data, kind: 'academy' } }),
    programDelete: (id) => op('program_delete', { id }),
    programCopy: (sourceId, data) => op('academy_program_copy', { source_id: sourceId, data }),
    overview: (programId) => op('academy_overview', { program_id: programId }),
    sessions: (programId, range = {}) => op('academy_sessions', { program_id: programId, ...range }),
    sessionSave: (id, data) => op('academy_session_save', { id, data }),
    sessionDelete: (id) => op('academy_session_delete', { id }),
    sessionsGenerate: (payload) => op('academy_sessions_generate', payload),
    sessionDetail: (id) => op('academy_session_detail', { id }),
    sessionStart: (id) => op('academy_session_start', { id }),
    sessionFinish: (id, payload = {}) => op('academy_session_finish', { id, ...payload }),
    sessionJournal: (id, payload) => op('academy_session_save_journal', { id, ...payload }),
    attendanceSet: (payload) => op('academy_attendance_set', payload),
    progress: (programId) => op('academy_progress', { program_id: programId }),
    progressSet: (payload) => op('academy_progress_set', payload),
    student: (id) => op('academy_student', { id }),
    evaluations: (programId, filters = {}) => op('academy_evaluations', { program_id: programId, ...filters }),
    evaluationSave: (id, data) => op('academy_evaluation_save', { id, data }),
    evaluationDelete: (id) => op('academy_evaluation_delete', { id }),
    mentors: () => op('academy_mentors'),
    mentorSave: (id, data, regenerate = false) => op('academy_mentor_save', { id, data, regenerate }),
    mentorDelete: (id) => op('academy_mentor_delete', { id }),
    importFile: (payload) => op('academy_import', payload, { timeout: UPLOAD_TIMEOUT }),
    template: (target) => op('academy_template', { target }),
    kiosk: (programId) => op('kiosk', { program_id: programId }),
    mentorHome: () => op('mentor_home'),
  }
}

export const academyApi = client(adminOp)

/** Klien untuk halaman mentor (tanpa login): token dari tautan, database disetel lebih dulu lewat ?db=. */
export function mentorClient(token) {
  return client(async (operation, params = {}) => {
    const res = await fetch('/web/v1/leader/mentor', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { token, operation, ...params } }),
    })
    if (!res.ok) throw new Error(`Server tidak bisa dihubungi (${res.status}).`)
    const data = await res.json()
    if (data.error) throw new Error(data.error.data?.message || data.error.message || 'Terjadi kesalahan.')
    if (data.result?.status === 'error') throw new Error(data.result.message)
    return data.result?.data
  })
}

export const ATT_STATUS = {
  present: { label: 'Hadir', short: 'H', tone: 'green' },
  late: { label: 'Terlambat', short: 'T', tone: 'amber' },
  permit: { label: 'Izin', short: 'I', tone: 'gray' },
  sick: { label: 'Sakit', short: 'S', tone: 'gray' },
  absent: { label: 'Alpa', short: 'A', tone: 'red' },
}

export const TOPIC_STATUS = {
  competent: { label: 'Kompeten', short: 'K', cls: 'bg-[#0f7a43] text-white' },
  practice: { label: 'Praktik', short: 'P', cls: 'bg-[#d9f2e3]' },
  attended: { label: 'Diikuti', short: 'D', cls: 'bg-[#fff6bf]' },
  missed: { label: 'Tertinggal', short: '!', cls: 'bg-[#ffd6d6] text-[#8f0000]' },
  pending: { label: 'Belum', short: '·', cls: 'bg-white text-[#3a3a3a]' },
}

export const SESSION_STATE = {
  planned: { label: 'Terjadwal', tone: 'gray' },
  running: { label: 'Berjalan', tone: 'amber' },
  done: { label: 'Selesai', tone: 'green' },
  cancelled: { label: 'Batal', tone: 'red' },
}

export const SESSION_FLAG = {
  late_start: 'Belum dimulai padahal sudah lewat jam',
  not_held: 'Tidak dijalankan',
  auto_closed: 'Ditutup otomatis (lupa diselesaikan)',
  no_journal: 'Selesai tanpa materi tercatat',
}

export const RUBRIC = [
  { value: 'discipline', label: 'Sikap & disiplin' },
  { value: 'theory', label: 'Pemahaman teori' },
  { value: 'practice', label: 'Keterampilan praktik' },
  { value: 'teamwork', label: 'Kerja tim' },
]

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

/** '2027-01-04' -> 'Senin, 4 Jan 2027' */
export const tanggal = (iso, withDay = true) => {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return `${withDay ? HARI[dt.getUTCDay()] + ', ' : ''}${d} ${BULAN[m - 1]} ${y}`
}

/** Tanggal hari ini (WIB) 'YYYY-MM-DD'. */
export const hariIniWib = () => new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)

export const tambahHari = (iso, n) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** Senin dari minggu tanggal ini. */
export const seninDari = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  return tambahHari(iso, -((dt.getUTCDay() + 6) % 7))
}
