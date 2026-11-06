// Pembantu tampilan Assessment Calon Kabeng: waktu WIB, status, nomor WhatsApp, pesan.
const WIB_OFFSET_MS = 7 * 3600 * 1000

const parseUtc = (s) => (s ? new Date(String(s).replace(' ', 'T') + 'Z') : null)

const pad = (n) => String(n).padStart(2, '0')

/** 'YYYY-MM-DD HH:MM:SS' UTC -> '6 Nov 2026, 14.30' (WIB). */
export const formatWib = (s) => {
  const d = parseUtc(s)
  if (!d || isNaN(d)) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(d).replace(' pukul', ',')
}

/** UTC string -> nilai input datetime-local dalam WIB. */
export const utcToWibInput = (s) => {
  const d = parseUtc(s)
  if (!d || isNaN(d)) return ''
  const w = new Date(d.getTime() + WIB_OFFSET_MS)
  return `${w.getUTCFullYear()}-${pad(w.getUTCMonth() + 1)}-${pad(w.getUTCDate())}T${pad(w.getUTCHours())}:${pad(w.getUTCMinutes())}`
}

/** Nilai input datetime-local (WIB) -> 'YYYY-MM-DD HH:MM:SS' UTC. */
export const wibInputToUtc = (v) => {
  if (!v) return false
  const [date, time] = v.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = (time || '00:00').split(':').map(Number)
  const u = new Date(Date.UTC(y, m - 1, d, hh, mm) - WIB_OFFSET_MS)
  return `${u.getUTCFullYear()}-${pad(u.getUTCMonth() + 1)}-${pad(u.getUTCDate())} ${pad(u.getUTCHours())}:${pad(u.getUTCMinutes())}:00`
}

export const todayWib = () => new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

export const ATTEMPT_STATE = {
  assigned: { label: 'Belum dimulai', tone: 'gray' },
  in_progress: { label: 'Sedang mengerjakan', tone: 'amber' },
  submitted: { label: 'Selesai', tone: 'green' },
  expired: { label: 'Kedaluwarsa', tone: 'red' }
}

export const RESULT_STATUS = {
  passed: { label: 'Lulus', tone: 'green' },
  remedial: { label: 'Remedial', tone: 'amber' },
  relearn: { label: 'Pembelajaran ulang', tone: 'red' },
  pending: { label: 'Belum', tone: 'gray' }
}

// tone -> kelas u-chip (exam.css / leader.css)
export const CHIP_CLASS = { green: 'u-chip-hijau', amber: 'u-chip-kuning', red: 'u-chip-merah', gray: 'u-chip-abu' }

export const KIND_LABEL = { initial: 'Tes awal', remedial: 'Tes susulan' }

/** Sisa waktu / keterangan singkat penugasan. */
export const timeNote = (a) => {
  if (a.state === 'submitted') return `Selesai ${formatWib(a.submitted_at)}`
  if (a.state === 'in_progress') return `Berakhir ${formatWib(a.ends_at)}`
  if (a.open_until) return `Berlaku sampai ${formatWib(a.open_until)}`
  return 'Tanpa batas berlaku'
}

/** 08xx / +62xx / 62xx -> 62xx (kosong bila tak ada angka). */
export const waNumber = (phone) => {
  let n = String(phone || '').replace(/\D/g, '')
  if (!n) return ''
  if (n.startsWith('0')) n = '62' + n.slice(1)
  else if (n.startsWith('8')) n = '62' + n
  return n
}

export const waUrl = (attempt, participant) => {
  const name = attempt.participant_name || participant?.name || ''
  const text = `Halo Kak ${name}, berikut tautan pribadi untuk mengerjakan "${attempt.topic_name}" (${KIND_LABEL[attempt.kind] || 'Tes'}, waktu ${attempt.time_limit_minutes} menit).\n\n${attempt.link}\n\nTautan ini hanya untuk Kakak. Kerjakan di tempat yang tenang dan sinyal stabil ya. Terima kasih.`
  const n = waNumber(participant?.phone)
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`
}

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const t = document.createElement('textarea')
    t.value = text
    document.body.appendChild(t)
    t.select()
    const ok = document.execCommand('copy')
    t.remove()
    return ok
  }
}

export const fmtScore = (v) => (v === null || v === undefined || v === false ? '-' : Number(v).toFixed(Number.isInteger(Number(v)) ? 0 : 1))
