// Tampilan level kompetensi L1-L4 dipakai bersama halaman peta & hasil.
export const LEVEL_STYLE = {
  1: { cell: 'bg-rose-50 text-rose-800 ring-rose-200', dot: 'bg-rose-400', label: 'Perlu dasar' },
  2: { cell: 'bg-amber-50 text-amber-900 ring-amber-200', dot: 'bg-amber-400', label: 'Berkembang' },
  3: { cell: 'bg-sky-50 text-sky-900 ring-sky-200', dot: 'bg-sky-500', label: 'Mandiri' },
  4: { cell: 'bg-emerald-100 text-emerald-900 ring-emerald-300', dot: 'bg-emerald-600', label: 'Panutan' },
}
// Nama jenjang per profil (mis. L1 Helper / Junior Mekanik); kosong memakai label umum.
export const levelName = (n, names) => (names && names[n]) || LEVEL_STYLE[n]?.label || ''
export const EMPTY_CELL = 'bg-gray-50 text-gray-400 ring-gray-200'

export const RATER_LABEL = { self: 'Penilaian diri', supervisor: 'Penilaian atasan', team: 'Feedback tim (anonim)' }
export const SOURCE_LABEL = { case: 'Studi kasus (AI)', supervisor: 'Atasan', team: 'Tim (360)', self: 'Diri sendiri' }
export const SOURCE_WEIGHT = { case: '40%', supervisor: '30%', team: '30%', self: 'tidak dihitung' }

export const fmtLevel = (v) => (v == null ? '–' : (Math.round(v * 10) / 10).toString().replace('.', ','))
export const mmss = (s) => {
  const t = Math.max(0, Math.floor(s || 0))
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
// Server mengirim datetime UTC 'YYYY-MM-DD HH:MM:SS'.
export function fmtDateTime(v) {
  if (!v) return '-'
  const d = new Date(v.replace(' ', 'T') + (v.length > 10 ? 'Z' : ''))
  const tgl = `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  return v.length > 10 ? `${tgl} ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}` : tgl
}
