// Label & format bersama halaman menu Asesmen (Asesmen Terpadu).
export const STATUS = {
  incomplete: { label: 'Belum lengkap', chip: '' },
  review: { label: 'Perlu dicek asesor', chip: 'u-chip-kuning' },
  ready: { label: 'Siap disahkan', chip: 'u-chip-merah' },
  validated: { label: 'Disahkan', chip: 'u-chip-hijau' },
}

export const COMPONENT = {
  oral: { label: 'Ujian lisan', short: 'Lisan' },
  case: { label: 'Studi kasus', short: 'Kasus' },
  lead: { label: 'Penilaian lead', short: 'Lead' },
}

const AI = { none: 'belum', queued: 'antre AI', running: 'dinilai AI', done: 'selesai', failed: 'AI gagal' }

export function ORAL_STATE(o) {
  if (o.state === 'draft') return 'Belum mulai'
  if (o.state === 'progress') return `Mengerjakan ${o.answered}/${o.total}`
  return o.ai_state === 'done' ? 'Dinilai' : `Terkirim · ${AI[o.ai_state] || o.ai_state}`
}

export function CASE_STATE(a) {
  if (a.state !== 'submitted') return a.started ? 'dikerjakan' : 'belum mulai'
  return AI[a.ai_state] || a.ai_state
}

export const COMPONENT_STATUS = {
  none: 'Tidak dipakai', pending: 'Belum selesai', processing: 'Dinilai AI', failed: 'AI gagal', done: 'Selesai', empty: 'Tanpa nilai',
}

// Angka Indonesia: 63,67
export const num = (v, digits = 2) => (v == null ? '–' : String(Math.round(v * 10 ** digits) / 10 ** digits).replace('.', ','))
export const pct = (v) => (v == null ? '–' : `${Number(v).toFixed(2).replace('.', ',')}%`)
export const skorClass = (v) => (v == null ? 'is-empty' : `s${Math.max(1, Math.min(5, Math.round(v)))}`)
export const levelClass = (v) => (v == null ? 'l0' : `l${Math.max(0, Math.min(4, Math.round(v)))}`)

// "00:41" / "L00:12" -> detik + jenis rekaman
export function parseWaktu(w) {
  const m = /^(L)?\s*(\d{1,2}):(\d{2})/.exec(String(w || '').replace(/[[\]]/g, '').trim())
  if (!m) return null
  return { followup: !!m[1], t: Number(m[2]) * 60 + Number(m[3]) }
}
